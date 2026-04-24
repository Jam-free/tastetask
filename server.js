const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// 数据库初始化
const db = new sqlite3.Database('./tastetask.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('✓ 已连接到 SQLite 数据库');
  }
});

// 创建表
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      level TEXT NOT NULL,
      sheet TEXT NOT NULL,
      source TEXT,
      preset TEXT,
      golden TEXT NOT NULL,
      skill TEXT,
      note TEXT,
      image_data TEXT,
      user_added INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(case_id, user_id)
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_cases_level ON cases(level)');
  db.run('CREATE INDEX IF NOT EXISTS idx_cases_sheet ON cases(sheet)');
  db.run('CREATE INDEX IF NOT EXISTS idx_favorites_case_id ON favorites(case_id)');
});

// 文件上传配置
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 管理员密码验证中间件
function verifyAdmin(req, res, next) {
  const { password } = req.body;
  if (password !== 'shijinshi1994') {
    return res.status(403).json({ error: '管理员密码错误' });
  }
  next();
}

// 生成用户ID
function getUserId(req) {
  return req.headers['x-user-id'] || 'anonymous';
}

// 辅助函数：Promise化数据库查询
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// ============ API 路由 ============

// 获取所有用例（带收藏统计）
app.get('/api/cases', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { random, limit } = req.query;

    let sql = `
      SELECT c.*,
        (SELECT COUNT(DISTINCT user_id) FROM favorites WHERE case_id = c.id) as favorite_count,
        EXISTS(SELECT 1 FROM favorites WHERE case_id = c.id AND user_id = ?) as is_favorite
      FROM cases c
      GROUP BY c.id
    `;

    if (random === 'true') {
      sql += ' ORDER BY RANDOM()';
      if (limit) {
        sql += ` LIMIT ${parseInt(limit)}`;
      }
    } else {
      sql += ' ORDER BY favorite_count DESC, c.created_at DESC';
    }

    const cases = await dbAll(sql, [userId]);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单个用例详情
app.get('/api/cases/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const sql = `
      SELECT c.*,
        (SELECT COUNT(DISTINCT user_id) FROM favorites WHERE case_id = c.id) as favorite_count,
        EXISTS(SELECT 1 FROM favorites WHERE case_id = c.id AND user_id = ?) as is_favorite
      FROM cases c
      WHERE c.id = ?
    `;

    const caseItem = await dbGet(sql, [userId, req.params.id]);

    if (!caseItem) {
      return res.status(404).json({ error: '用例不存在' });
    }
    res.json(caseItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加新用例
app.post('/api/cases', async (req, res) => {
  try {
    const { query, level, sheet, source, preset, golden, skill, note, imageData } = req.body;

    if (!query || !golden) {
      return res.status(400).json({ error: 'query 和 golden 为必填项' });
    }

    const id = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sql = `
      INSERT INTO cases (id, query, level, sheet, source, preset, golden, skill, note, image_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbRun(sql, [id, query, level, sheet, source, preset, golden, skill, note, imageData]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除用例（仅管理员）
app.delete('/api/cases/:id', verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    // 先删除相关的收藏记录
    await dbRun('DELETE FROM favorites WHERE case_id = ?', [id]);

    // 删除用例
    const result = await dbRun('DELETE FROM cases WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: '用例不存在' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新用例（仅管理员）
app.put('/api/cases/:id', verifyAdmin, async (req, res) => {
  try {
    const { query, level, sheet, source, preset, golden, skill, note, imageData } = req.body;
    const id = req.params.id;

    const sql = `
      UPDATE cases
      SET query = ?, level = ?, sheet = ?, source = ?, preset = ?, golden = ?, skill = ?, note = ?, image_data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await dbRun(sql, [query, level, sheet, source, preset, golden, skill, note, imageData, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '用例不存在' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 收藏/取消收藏用例
app.post('/api/cases/:id/favorite', async (req, res) => {
  try {
    const userId = getUserId(req);
    const caseId = req.params.id;

    // 检查用例是否存在
    const caseExists = await dbGet('SELECT 1 FROM cases WHERE id = ?', [caseId]);
    if (!caseExists) {
      return res.status(404).json({ error: '用例不存在' });
    }

    // 切换收藏状态
    const existing = await dbGet('SELECT 1 FROM favorites WHERE case_id = ? AND user_id = ?', [caseId, userId]);

    if (existing) {
      await dbRun('DELETE FROM favorites WHERE case_id = ? AND user_id = ?', [caseId, userId]);
      res.json({ favorited: false });
    } else {
      await dbRun('INSERT INTO favorites (case_id, user_id) VALUES (?, ?)', [caseId, userId]);
      res.json({ favorited: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取收藏最多的用例（排行榜）
app.get('/api/cases/top/favorites', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = getUserId(req);

    const sql = `
      SELECT c.*,
        (SELECT COUNT(DISTINCT user_id) FROM favorites WHERE case_id = c.id) as favorite_count,
        EXISTS(SELECT 1 FROM favorites WHERE case_id = c.id AND user_id = ?) as is_favorite
      FROM cases c
      WHERE (SELECT COUNT(*) FROM favorites WHERE case_id = c.id) > 0
      GROUP BY c.id
      ORDER BY favorite_count DESC
      LIMIT ?
    `;

    const cases = await dbAll(sql, [userId, limit]);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取统计信息
app.get('/api/stats', async (req, res) => {
  try {
    const total = await dbGet('SELECT COUNT(*) as count FROM cases');
    const byLevel = await dbAll('SELECT level, COUNT(*) as count FROM cases GROUP BY level');
    const bySheet = await dbAll('SELECT sheet, COUNT(*) as count FROM cases GROUP BY sheet');
    const totalFavorites = await dbGet('SELECT COUNT(DISTINCT user_id) as count FROM favorites');

    const topCases = await dbAll(`
      SELECT c.id, c.query, (SELECT COUNT(DISTINCT user_id) FROM favorites WHERE case_id = c.id) as favorite_count
      FROM cases c
      WHERE (SELECT COUNT(*) FROM favorites WHERE case_id = c.id) > 0
      ORDER BY favorite_count DESC
      LIMIT 5
    `);

    res.json({
      total: total.count,
      byLevel,
      bySheet,
      totalFavorites: totalFavorites.count,
      topCases
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Taste-Task 试金石服务器运行在 http://localhost:${PORT}`);
  console.log(`🔑 管理员密码: shijinshi1994`);
});
