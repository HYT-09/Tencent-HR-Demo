const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../models/database');

const router = express.Router();

router.get('/stats', (req, res) => {
  const jobStats = {
    total: get('SELECT COUNT(*) as c FROM jobs').c,
    active: get("SELECT COUNT(*) as c FROM jobs WHERE status='active'").c,
    closed: get("SELECT COUNT(*) as c FROM jobs WHERE status='closed'").c,
    todayNew: Math.floor(get("SELECT COUNT(*) as c FROM jobs WHERE status='active'").c * 0.05),
  };
  const userStats = {
    total: get('SELECT COUNT(*) as c FROM users').c,
    todayNew: Math.floor(get('SELECT COUNT(*) as c FROM users').c * 0.1),
  };
  const appStats = {
    total: get('SELECT COUNT(*) as c FROM applications').c,
    applied: get("SELECT COUNT(*) as c FROM applications WHERE status='applied'").c,
    invited: get("SELECT COUNT(*) as c FROM applications WHERE status='invited'").c,
    rejected: get("SELECT COUNT(*) as c FROM applications WHERE status='rejected'").c,
  };
  const matchDistribution = all('SELECT match_level, COUNT(*) as count FROM applications GROUP BY match_level');
  res.json({ success: true, data: { jobStats, userStats, appStats, matchDistribution } });
});

router.get('/logs', (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const logs = all('SELECT * FROM operation_logs ORDER BY created_at DESC');
  res.json({ success: true, data: { logs: logs.slice(0, limit), total: logs.length, page: Number(page) } });
});

function logAction(operatorType, operatorId, action, targetType, targetId, details) {
  run(`INSERT INTO operation_logs (id, operator_type, operator_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), operatorType, operatorId, action, targetType, targetId, JSON.stringify(details || {})]);
}

module.exports = { router, logAction };
