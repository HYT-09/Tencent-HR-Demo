const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../models/database');
const { calculateSecondaryMatch, calculateMatchScore } = require('../utils/matching');

const router = express.Router();

// HR登录
router.post('/login', (req, res) => {
  const { email } = req.body;
  let hr = get('SELECT * FROM hr_users WHERE email = ?', [email]);
  if (!hr) {
    const id = uuidv4();
    run('INSERT INTO hr_users (id, name, email, department) VALUES (?, ?, ?, ?)', [id, `HR${email.slice(0, 3)}`, email, '技术事业部']);
    hr = get('SELECT * FROM hr_users WHERE id = ?', [id]);
  }
  res.json({ success: true, data: hr });
});

// HR工作台
router.get('/:hrId/dashboard', (req, res) => {
  const hrId = req.params.hrId;
  const pending = get("SELECT COUNT(*) as c FROM applications WHERE hr_id = ? AND status = 'applied'", [hrId]).c;
  const invited = get("SELECT COUNT(*) as c FROM applications WHERE hr_id = ? AND status = 'invited'", [hrId]).c;
  const rejected = get("SELECT COUNT(*) as c FROM applications WHERE hr_id = ? AND status = 'rejected'", [hrId]).c;
  
  const highMatch = all(`SELECT a.*, j.title as job_title, j.department, u.name as user_name, u.education, u.major
    FROM applications a JOIN jobs j ON a.job_id = j.id JOIN users u ON a.user_id = u.id
    WHERE a.hr_id = ? AND a.match_level IN ('S','A') AND a.status = 'applied'
    ORDER BY a.match_score DESC LIMIT 5`, [hrId]);
  
  const recentActivity = all(`SELECT a.*, j.title as job_title, u.name as user_name
    FROM applications a JOIN jobs j ON a.job_id = j.id JOIN users u ON a.user_id = u.id
    WHERE a.hr_id = ? ORDER BY a.apply_time DESC LIMIT 10`, [hrId]);
  
  res.json({ success: true, data: { pending, invited, rejected, highMatch, recentActivity } });
});

// 候选人列表
router.get('/:hrId/candidates', (req, res) => {
  const hrId = req.params.hrId;
  const { job_id, status, match_level } = req.query;
  
  let query = `SELECT a.*, j.title as job_title, j.department, j.city,
    u.name as user_name, u.education, u.major, u.skills, u.experience, u.resume_parsed
    FROM applications a JOIN jobs j ON a.job_id = j.id JOIN users u ON a.user_id = u.id
    WHERE a.hr_id = ?`;
  const params = [hrId];
  
  if (job_id) { query += ' AND a.job_id = ?'; params.push(job_id); }
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (match_level) { query += ' AND a.match_level = ?'; params.push(match_level); }
  query += ' ORDER BY a.match_score DESC';
  
  const candidates = all(query, params);
  const stats = all('SELECT status, COUNT(*) as count FROM applications WHERE hr_id = ? GROUP BY status', [hrId]);
  res.json({ success: true, data: { candidates, stats } });
});

// 发送面试邀约
router.post('/invite', (req, res) => {
  const { application_id, interview_time, interview_location, interview_type, interview_notes } = req.body;
  run(`UPDATE applications SET status = 'invited', interview_time = ?, interview_location = ?, 
    interview_type = ?, interview_notes = ? WHERE id = ?`,
    [interview_time, interview_location, interview_type, interview_notes, application_id]);
  const app = get(`SELECT a.*, j.title as job_title, u.name as user_name
    FROM applications a JOIN jobs j ON a.job_id = j.id JOIN users u ON a.user_id = u.id WHERE a.id = ?`, [application_id]);
  res.json({ success: true, data: app });
});

// 标记面试结果
router.post('/result', (req, res) => {
  const { application_id, status, reject_reason, hr_id } = req.body;
  
  if (status === 'rejected') {
    run(`UPDATE applications SET status = 'rejected', reject_reason = ?, reject_time = datetime('now') WHERE id = ?`,
      [reject_reason || '未通过', application_id]);
    const app = get('SELECT * FROM applications WHERE id = ?', [application_id]);
    if (app) {
      const rejectId = uuidv4();
      run(`INSERT INTO rejections (id, user_id, original_job_id, original_match_score, original_match_level, reject_reason, hr_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [rejectId, app.user_id, app.job_id, app.match_score, app.match_level, reject_reason || '未通过', hr_id]);
    }
  } else {
    run('UPDATE applications SET status = ? WHERE id = ?', [status, application_id]);
  }
  
  const application = get(`SELECT a.*, j.title as job_title, u.name as user_name
    FROM applications a JOIN jobs j ON a.job_id = j.id JOIN users u ON a.user_id = u.id WHERE a.id = ?`, [application_id]);
  res.json({ success: true, data: application });
});

// 已拒绝候选人池
router.get('/:hrId/rejections', (req, res) => {
  const hrId = req.params.hrId;
  const { education, major, skills } = req.query;
  
  let query = `SELECT r.*, j.title as original_job_title, j.department,
    u.name as user_name, u.education, u.major, u.skills, u.experience
    FROM rejections r JOIN jobs j ON r.original_job_id = j.id JOIN users u ON r.user_id = u.id
    WHERE r.hr_id = ?`;
  const params = [hrId];
  
  if (education) { query += ' AND u.education LIKE ?'; params.push(`%${education}%`); }
  if (major) { query += ' AND u.major LIKE ?'; params.push(`%${major}%`); }
  if (skills) { query += ' AND u.skills LIKE ?'; params.push(`%${skills}%`); }
  query += ' ORDER BY r.reject_time DESC';
  
  const rejections = all(query, params);
  res.json({ success: true, data: rejections });
});

// AI二次匹配回捞
router.post('/reclaim', async (req, res) => {
  const { rejection_ids, hr_id } = req.body;
  const results = [];
  
  try {
    for (const rid of rejection_ids) {
      const rejection = get(`SELECT r.*, u.name as user_name, u.education, u.major, u.skills, u.experience, u.resume_parsed
        FROM rejections r JOIN users u ON r.user_id = u.id WHERE r.id = ?`, [rid]);
      if (!rejection) continue;
      
      const matches = await calculateSecondaryMatch(rejection, rejection.original_job_id);
      const reclaimMatch = matches.map(m => ({
        job_id: m.job.id, job_title: m.job.title, match_score: m.match_score,
        match_level: m.match_level, reasons: m.reasons
      }));
      
      run('UPDATE rejections SET reclaim_match = ?, reclaim_status = ?, hr_id = ? WHERE id = ?',
        [JSON.stringify(reclaimMatch), 'matched', hr_id, rid]);
      
      results.push({ rejection_id: rid, user_name: rejection.user_name, matches: reclaimMatch });
    }
    
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('二次匹配失败:', err);
    res.status(500).json({ success: false, message: `二次匹配失败: ${err.message}` });
  }
});

// 回捞后发起邀约
router.post('/reclaim-invite', async (req, res) => {
  const { user_id, job_id, hr_id, interview_time, interview_location } = req.body;
  const user = get('SELECT * FROM users WHERE id = ?', [user_id]);
  const job = get('SELECT * FROM jobs WHERE id = ?', [job_id]);
  if (!user || !job) return res.status(404).json({ success: false, message: '数据不存在' });
  
  try {
    const match = await calculateMatchScore(user, job);
    const id = uuidv4();
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id, interview_time, interview_location)
      VALUES (?, ?, ?, ?, ?, ?, 'invited', ?, ?, ?)`,
      [id, user_id, job_id, match.total, match.level, JSON.stringify(match.details), hr_id, interview_time, interview_location]);

    run("UPDATE rejections SET status = 'reclaimed' WHERE user_id = ? AND original_job_id != ? AND status = 'available'", [user_id, job_id]);
    res.json({ success: true, data: { application_id: id } });
  } catch (err) {
    console.error('回捞邀约失败:', err);
    res.status(500).json({ success: false, message: `回捞邀约失败: ${err.message}` });
  }
});

module.exports = router;
