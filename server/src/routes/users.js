const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { all, get, run } = require('../models/database');
const { calculateMatchScore } = require('../utils/matching');
const { isAIConfigured, parseResumeByText } = require('../utils/ai');
const { extractTextFromFile } = require('../utils/fileParser');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// 用户注册/登录（新手机号自动创建用户）
router.post('/login', (req, res) => {
  const { phone, name } = req.body;
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: '请输入正确的11位手机号' });
  }
  let user = get('SELECT * FROM users WHERE phone = ?', [phone]);
  let isNewUser = false;
  if (!user) {
    const id = uuidv4();
    run('INSERT INTO users (id, name, phone) VALUES (?, ?, ?)', [id, name || `用户${phone.slice(-4)}`, phone]);
    user = get('SELECT * FROM users WHERE id = ?', [id]);
    isNewUser = true;
  } else if (name && name !== user.name && user.name.startsWith('用户')) {
    // 老用户如果之前是默认名，允许更新
    run('UPDATE users SET name = ?, updated_at = datetime("now") WHERE id = ?', [name, user.id]);
    user = get('SELECT * FROM users WHERE id = ?', [user.id]);
  }
  res.json({ success: true, data: { ...user, isNewUser } });
});

// 获取用户信息
router.get('/:id', (req, res) => {
  const user = get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
  try { user.resume_parsed = JSON.parse(user.resume_parsed || '{}'); } catch(e) {}
  res.json({ success: true, data: user });
});

// 更新用户信息
router.put('/:id', (req, res) => {
  const { name, email, education, major, skills } = req.body;
  run(`UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email), 
    education=COALESCE(?,education), major=COALESCE(?,major), skills=COALESCE(?,skills),
    updated_at=datetime('now') WHERE id=?`, [name, email, education, major, skills, req.params.id]);
  const user = get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: user });
});

// 上传简历 & AI解析（同时支持文本和文件上传）
router.post('/:id/resume', upload.single('resume'), async (req, res) => {
  const userId = req.params.id;

  try {
    let resumeText = '';

    // 优先从上传文件中提取文本
    if (req.file) {
      const extracted = await extractTextFromFile(req.file.buffer, req.file.originalname);
      if (extracted && extracted.trim().length >= 10) {
        resumeText = extracted;
      }
    }

    // 如果没有文件或文件提取失败，从 body 中获取文本
    if (!resumeText) {
      resumeText = req.body?.resumeText || '';
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(400).json({ success: false, message: '请提供简历文本内容（至少10个字符）' });
    }

    if (!isAIConfigured()) {
      return res.status(503).json({ success: false, message: 'AI 服务未配置或 API Key 无效，请检查 HUNYUAN_API_KEY 配置' });
    }

    const parsed = await parseResumeByText(resumeText);

    run(`UPDATE users SET education=?, major=?, skills=?, experience=?, projects=?,
      resume_parsed=?, resume_url=?, updated_at=datetime('now') WHERE id=?`,
      [parsed.education, parsed.major, parsed.skills, parsed.experience, parsed.projects,
       JSON.stringify(parsed), '/uploads/resume_parsed.txt', userId]);
    const user = get('SELECT * FROM users WHERE id = ?', [userId]);
    user.resume_parsed = parsed;
    res.json({ success: true, data: { user, parsed } });
  } catch (err) {
    console.error('简历解析失败:', err.message);
    // 对 401 错误给出更友好的提示
    if (err.message && err.message.includes('401')) {
      return res.status(503).json({ success: false, message: 'AI 服务认证失败，请检查 HUNYUAN_API_KEY 是否正确' });
    }
    res.status(500).json({ success: false, message: `简历解析失败: ${err.message}` });
  }
});

// AI岗位匹配
router.post('/:id/match', async (req, res) => {
  const userId = req.params.id;
  const user = get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
  if (!user.education && !user.resume_parsed) {
    return res.status(400).json({ success: false, message: '请先上传简历' });
  }
  
  try {
    const jobs = all("SELECT * FROM jobs WHERE status = 'active'");
    const results = [];
    for (const job of jobs) {
      const match = await calculateMatchScore(user, job);
      results.push({ job, match_score: match.total, match_level: match.level, match_details: match.details, reasons: match.reasons });
    }
    results.sort((a, b) => b.match_score - a.match_score);
    res.json({ success: true, data: results.slice(0, 3) });
  } catch (err) {
    console.error('匹配失败:', err);
    res.status(500).json({ success: false, message: `匹配失败: ${err.message}` });
  }
});

// 获取用户投递记录
router.get('/:id/applications', (req, res) => {
  const { status } = req.query;
  let query = `SELECT a.*, j.title as job_title, j.department, j.city, j.salary_range
    FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.user_id = ?`;
  const params = [req.params.id];
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  query += ' ORDER BY a.apply_time DESC';
  const applications = all(query, params);
  res.json({ success: true, data: applications });
});

// 用户一键投递
router.post('/:id/apply', async (req, res) => {
  const userId = req.params.id;
  const { job_id } = req.body;
  const user = get('SELECT * FROM users WHERE id = ?', [userId]);
  const job = get('SELECT * FROM jobs WHERE id = ?', [job_id]);
  if (!user || !job) return res.status(404).json({ success: false, message: '用户或岗位不存在' });
  
  const existing = get('SELECT * FROM applications WHERE user_id = ? AND job_id = ?', [userId, job_id]);
  if (existing) return res.status(400).json({ success: false, message: '已投递该岗位' });
  
  try {
    const match = await calculateMatchScore(user, job);
    const id = uuidv4();
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status)
      VALUES (?, ?, ?, ?, ?, ?, 'applied')`, [id, userId, job_id, match.total, match.level, JSON.stringify(match.details)]);

    // 为投递分配HR：优先分配同部门HR，否则分配任意HR
    const hrList = all('SELECT * FROM hr_users WHERE department = ?', [job.department]);
    const assignedHr = hrList.length > 0 ? hrList[0] : get('SELECT * FROM hr_users LIMIT 1');
    if (assignedHr) {
      run('UPDATE applications SET hr_id = ? WHERE id = ?', [assignedHr.id, id]);
    }

    const application = get(`SELECT a.*, j.title as job_title, j.department, j.city
      FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?`, [id]);
    res.json({ success: true, data: application });
  } catch (err) {
    console.error('投递失败:', err);
    res.status(500).json({ success: false, message: `投递失败: ${err.message}` });
  }
});

// 获取求职进度看板
router.get('/:id/progress', (req, res) => {
  const userId = req.params.id;
  const stats = all('SELECT status, COUNT(*) as count FROM applications WHERE user_id = ? GROUP BY status', [userId]);
  const summary = { applied: 0, invited: 0, interviewed: 0, offered: 0, rejected: 0, withdrawn: 0, total: 0 };
  stats.forEach(s => { summary[s.status] = s.count; summary.total += s.count; });
  
  const applications = all(`SELECT a.*, j.title as job_title, j.department, j.city, j.salary_range
    FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.user_id = ? ORDER BY a.apply_time DESC`, [userId]);
  
  res.json({ success: true, data: { summary, applications } });
});

module.exports = router;
