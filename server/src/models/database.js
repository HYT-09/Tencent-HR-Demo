const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/app.db');

let db;
let SQL;

async function getDb() {
  if (!db) {
    SQL = await initSqlJs();
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buf);
    } else {
      db = new SQL.Database();
    }
    
    db.run('PRAGMA foreign_keys = ON');
    
    // Auto-save every 5 seconds
    setInterval(() => saveDb(), 5000);
  }
  return db;
}

function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buf = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buf);
  } catch (e) {
    console.error('数据库保存失败:', e.message);
  }
}

function initDb() {
  // Returns a promise now
  return getDb().then(database => {
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT,
        avatar TEXT,
        education TEXT,
        major TEXT,
        skills TEXT,
        experience TEXT,
        projects TEXT,
        resume_url TEXT,
        resume_parsed TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    database.run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT,
        city TEXT,
        education_req TEXT,
        major_req TEXT,
        skills_req TEXT,
        responsibilities TEXT,
        apply_url TEXT,
        salary_range TEXT,
        status TEXT DEFAULT 'active',
        source TEXT DEFAULT 'tencent_official',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    database.run(`
      CREATE TABLE IF NOT EXISTS hr_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    database.run(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        match_score INTEGER,
        match_level TEXT,
        match_details TEXT DEFAULT '{}',
        status TEXT DEFAULT 'applied',
        apply_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        interview_time TEXT,
        interview_location TEXT,
        interview_type TEXT,
        interview_notes TEXT,
        reject_reason TEXT,
        reject_time DATETIME,
        hr_id TEXT
      )
    `);

    database.run(`
      CREATE TABLE IF NOT EXISTS rejections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        original_job_id TEXT NOT NULL,
        original_match_score INTEGER,
        original_match_level TEXT,
        reject_reason TEXT,
        reject_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'available',
        reclaim_match TEXT DEFAULT '[]',
        reclaim_status TEXT,
        hr_id TEXT
      )
    `);

    database.run(`
      CREATE TABLE IF NOT EXISTS operation_logs (
        id TEXT PRIMARY KEY,
        operator_type TEXT NOT NULL,
        operator_id TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        details TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    saveDb();
    return database;
  });
}

// Helper to convert sql.js results to arrays
function all(query, params = []) {
  const stmt = db.prepare(query);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function get(query, params = []) {
  const rows = all(query, params);
  return rows.length > 0 ? rows[0] : undefined;
}

function run(query, params = []) {
  db.run(query, params);
  return { changes: db.getRowsModified() };
}

module.exports = { getDb, initDb, saveDb, all, get, run };
