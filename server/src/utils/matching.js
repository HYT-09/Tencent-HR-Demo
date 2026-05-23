const { v4: uuidv4 } = require('uuid');
const { all, getDb } = require('../models/database');
const { isAIConfigured, matchMajorScore: aiMatchMajorScore } = require('./ai');

// AI匹配算法核心
async function calculateMatchScore(resume, job) {
  const parsed = typeof resume.resume_parsed === 'string' 
    ? JSON.parse(resume.resume_parsed) 
    : (resume.resume_parsed || {});

  const result = { total: 0, details: {} };

  // 1. 学历匹配 (30%)
  const eduScore = calculateEduScore(resume.education || parsed.education, job.education_req);
  result.details.education = { score: eduScore, weight: 30, max: 30 };

  // 2. 专业匹配 (20%) — 异步 AI 判断
  const majorScore = await calculateMajorScore(
    resume.major || parsed.major,
    job.major_req,
    parsed.major_category || resume.major_category || ''
  );
  result.details.major = { score: majorScore, weight: 20, max: 20 };

  // 3. 技能匹配 (30%)
  const skillScore = calculateSkillScore(resume.skills || parsed.skills, job.skills_req);
  result.details.skill = { score: skillScore, weight: 30, max: 30 };

  // 4. 经历匹配 (20%)
  const expScore = calculateExpScore(resume.experience || parsed.experience, job.responsibilities);
  result.details.experience = { score: expScore, weight: 20, max: 20 };

  result.total = Math.round(
    eduScore * 30 + majorScore * 20 + skillScore * 30 + expScore * 20
  );

  result.level = getMatchLevel(result.total);
  result.reasons = generateReasons(result.details, resume, job);

  return result;
}

function calculateEduScore(userEdu, reqEdu) {
  if (!reqEdu || reqEdu === '不限') return 1;
  const levels = { '大专': 1, '本科': 2, '硕士': 3, '博士': 4, 'MBA': 3 };
  const userLevel = levels[userEdu] || 0;
  const reqLevel = levels[reqEdu] || 0;
  if (userLevel >= reqLevel) return 1;
  if (userLevel === reqLevel - 1) return 0.5;
  return 0;
}

// 专业大类映射表（本地降级使用）
const MAJOR_CATEGORY_MAP = {
  '计算机科学与技术': '计算机类', '软件工程': '计算机类', '人工智能': '计算机类',
  '信息安全': '计算机类', '网络工程': '计算机类', '物联网工程': '计算机类',
  '数据科学与大数据技术': '计算机类', '数字媒体技术': '计算机类',
  '电子信息工程': '电子信息类', '通信工程': '电子信息类', '微电子科学与工程': '电子信息类',
  '数学与应用数学': '数学类', '信息与计算科学': '数学类', '统计学': '统计学类',
  '应用统计学': '统计学类', '经济学': '经济学类', '金融学': '金融学类',
  '工商管理': '工商管理类', '市场营销': '工商管理类', '人力资源管理': '工商管理类',
  '管理科学': '管理科学与工程类', '信息管理与信息系统': '管理科学与工程类',
};

// 同一大类视为相关专业，给予较高分数
function getCategoryForMajor(major) {
  for (const [name, cat] of Object.entries(MAJOR_CATEGORY_MAP)) {
    if (major.includes(name) || name.includes(major)) return cat;
  }
  return null;
}

async function calculateMajorScore(userMajor, reqMajor, majorCategory) {
  if (!reqMajor || reqMajor === '不限') return 1;
  if (!userMajor) return 0;

  // 优先使用 AI 判断
  if (isAIConfigured()) {
    try {
      const result = await aiMatchMajorScore(userMajor, majorCategory || '', reqMajor);
      return result.score;
    } catch (err) {
      console.warn('AI 专业匹配失败，降级到本地规则:', err.message);
    }
  }

  // 本地降级：基于专业大类的匹配
  const reqList = reqMajor.split(/[,，、]/).map(s => s.trim());
  const userList = userMajor.split(/[,，、]/).map(s => s.trim());

  let matchCount = 0;
  for (const r of reqList) {
    for (const u of userList) {
      // 精确包含匹配
      if (u.includes(r) || r.includes(u)) { matchCount++; break; }
      // 同专业大类匹配
      const uCat = majorCategory || getCategoryForMajor(u);
      const rCat = getCategoryForMajor(r);
      if (uCat && rCat && uCat === rCat) { matchCount++; break; }
    }
  }

  if (matchCount >= reqList.length) return 1;
  if (matchCount > 0) return 0.6; // 同大类匹配给 0.6
  return 0;
}

function calculateSkillScore(userSkills, reqSkills) {
  if (!reqSkills) return 1;
  if (!userSkills) return 0;
  const reqList = reqSkills.split(/[,，、]/).map(s => s.trim());
  const userList = userSkills.split(/[,，、]/).map(s => s.trim());
  let matchCount = 0;
  for (const r of reqList) {
    for (const u of userList) {
      if (u.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(u.toLowerCase())) {
        matchCount++; break;
      }
    }
  }
  if (matchCount >= reqList.length) return 1;
  if (matchCount > 0) return 0.5;
  return 0;
}

function calculateExpScore(userExp, responsibilities) {
  if (!responsibilities) return 0.5;
  if (!userExp) return 0;
  const keywords = responsibilities.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || [];
  const unique = [...new Set(keywords)].slice(0, 10);
  let matchCount = 0;
  for (const kw of unique) {
    if (userExp.includes(kw)) matchCount++;
  }
  if (matchCount >= unique.length * 0.6) return 1;
  if (matchCount >= unique.length * 0.3) return 0.5;
  return 0;
}

function getMatchLevel(score) {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  return 'C';
}

function generateReasons(details, resume, job) {
  const reasons = [];
  const parsed = typeof resume.resume_parsed === 'string'
    ? JSON.parse(resume.resume_parsed)
    : (resume.resume_parsed || {});

  if (details.education.score >= 0.8) {
    reasons.push(`学历${resume.education || parsed.education || ''}满足${job.education_req || '岗位'}要求`);
  }
  if (details.major.score >= 0.8) {
    reasons.push(`专业方向与岗位要求高度契合`);
  }
  if (details.skill.score >= 0.8) {
    reasons.push(`核心技能与岗位需求完全匹配`);
  } else if (details.skill.score >= 0.5) {
    reasons.push(`部分技能与岗位需求匹配`);
  }
  if (details.experience.score >= 0.8) {
    reasons.push(`实习/项目经历与岗位职责高度相关`);
  }
  return reasons;
}

// 二次AI匹配（跨岗位回捞）
async function calculateSecondaryMatch(user, excludeJobId) {
  const jobs = all("SELECT * FROM jobs WHERE status = 'active' AND id != ?", [excludeJobId]);

  const results = [];
  for (const job of jobs) {
    const match = await calculateMatchScore(user, job);
    if (match.total >= 60) {
      results.push({
        job,
        match_score: match.total,
        match_level: match.level,
        match_details: match.details,
        reasons: match.reasons
      });
    }
  }

  results.sort((a, b) => b.match_score - a.match_score);
  return results.slice(0, 2);
}

module.exports = {
  calculateMatchScore,
  calculateSecondaryMatch,
  getMatchLevel
};
