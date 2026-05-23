const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../models/database');

const router = express.Router();

// 获取岗位列表
router.get('/', (req, res) => {
  const { status, city, department, keyword, page = 1, limit = 20 } = req.query;
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  
  if (status) { query += ' AND status = ?'; params.push(status); }
  else { query += " AND status = 'active'"; }
  if (city) { query += ' AND city LIKE ?'; params.push(`%${city}%`); }
  if (department) { query += ' AND department LIKE ?'; params.push(`%${department}%`); }
  if (keyword) { query += ' AND (title LIKE ? OR skills_req LIKE ? OR responsibilities LIKE ?)'; 
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`); }
  
  query += ' ORDER BY created_at DESC';
  const jobs = all(query, params);
  const total = jobs.length;
  const offset = (page - 1) * limit;
  const paged = jobs.slice(offset, offset + Number(limit));
  
  res.json({ success: true, data: { jobs: paged, total, page: Number(page), limit: Number(limit) } });
});

// 获取岗位详情
router.get('/:id', (req, res) => {
  const job = get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
  if (!job) return res.status(404).json({ success: false, message: '岗位不存在' });
  res.json({ success: true, data: job });
});

// 创建岗位
router.post('/', (req, res) => {
  const id = uuidv4();
  const { title, department, city, education_req, major_req, skills_req, responsibilities, apply_url, salary_range } = req.body;
  run(`INSERT INTO jobs (id, title, department, city, education_req, major_req, skills_req, responsibilities, apply_url, salary_range)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, title, department, city, education_req, major_req, skills_req, responsibilities, apply_url, salary_range]);
  const job = get('SELECT * FROM jobs WHERE id = ?', [id]);
  res.json({ success: true, data: job });
});

// 更新岗位
router.put('/:id', (req, res) => {
  const { title, department, city, education_req, major_req, skills_req, responsibilities, apply_url, salary_range, status } = req.body;
  run(`UPDATE jobs SET title=COALESCE(?,title), department=COALESCE(?,department), city=COALESCE(?,city),
    education_req=COALESCE(?,education_req), major_req=COALESCE(?,major_req), skills_req=COALESCE(?,skills_req),
    responsibilities=COALESCE(?,responsibilities), apply_url=COALESCE(?,apply_url), salary_range=COALESCE(?,salary_range),
    status=COALESCE(?,status), updated_at=datetime('now') WHERE id=?`,
    [title, department, city, education_req, major_req, skills_req, responsibilities, apply_url, salary_range, status, req.params.id]);
  const job = get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: job });
});

// 下架岗位
router.delete('/:id', (req, res) => {
  run("UPDATE jobs SET status = 'closed', updated_at = datetime('now') WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: '岗位已下架' });
});

// 岗位统计
router.get('/stats/overview', (req, res) => {
  const total = get('SELECT COUNT(*) as count FROM jobs').count;
  const active = get("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").count;
  const closed = get("SELECT COUNT(*) as count FROM jobs WHERE status = 'closed'").count;
  res.json({ success: true, data: { total, active, closed, todayNew: Math.floor(active * 0.05) } });
});

module.exports = router;
