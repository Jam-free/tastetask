const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 打开数据库
const db = new sqlite3.Database('./tastetask.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('✓ 已连接到数据库');
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
      user_added INTEGER DEFAULT 0,
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
  `, () => {
    // 从原始 HTML 文件中提取并插入预设用例
    insertPresetCases();
  });
});

// 从原始HTML中提取预设用例并插入到数据库
function insertPresetCases() {
  const htmlPath = path.join(__dirname, 'index.original.html');

  if (!fs.existsSync(htmlPath)) {
    console.error('❌ 找不到原始HTML文件: index.original.html');
    console.log('请确保原始的 index.html 文件已重命名为 index.original.html');
    db.close();
    process.exit(1);
  }

  const html = fs.readFileSync(htmlPath, 'utf8');

  // 提取 PRESET 数组
  const presetMatch = html.match(/const PRESET=\[([\s\S]*?)\];/);
  if (!presetMatch) {
    console.error('❌ 无法找到预设用例数据');
    db.close();
    process.exit(1);
  }

  // 解析用例数据
  const cases = parsePresetData(presetMatch[1]);

  if (cases.length === 0) {
    console.error('❌ 未能解析出任何用例');
    db.close();
    process.exit(1);
  }

  console.log(`📋 解析到 ${cases.length} 条预设用例`);

  // 插入用例
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO cases (id, query, level, sheet, source, preset, golden, skill, note, user_added)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  let inserted = 0;
  let failed = 0;

  db.serialize(() => {
    cases.forEach(c => {
      if (c.id && c.query && c.golden) {
        stmt.run(
          c.id,
          c.query,
          c.level,
          c.sheet,
          c.source || c.sheet,
          c.preset || '',
          c.golden,
          c.skill || '',
          c.note || '',
          (err) => {
            if (err) {
              failed++;
              console.error(`❌ 插入失败 ${c.id}:`, err.message);
            } else {
              inserted++;
            }
          }
        );
      }
    });

    // 等待所有插入完成
    setTimeout(() => {
      stmt.finalize();
      console.log(`\n✅ 数据库初始化完成`);
      console.log(`   ✓ 成功插入: ${inserted} 条`);
      if (failed > 0) {
        console.log(`   ✗ 失败: ${failed} 条`);
      }
      console.log(`   ✓ 数据库文件: tastetask.db\n`);
      db.close();
    }, 500);
  });
}

// 解析预设用例数据
function parsePresetData(data) {
  const cases = [];

  // 使用正则表达式匹配每个用例对象
  const caseRegex = /{id:'([^']+)',[\s\S]*?query:'([^']+)',[\s\S]*?level:'(L[1-5])',[\s\S]*?sheet:'([^']+)',[\s\S]*?source:'([^']*)',[\s\S]*?preset:([\s\S]*?),[\s\S]*?golden:'([^']+)',[\s\S]*?skill:'([^']*)',[\s\S]*?note:'([^']*)'}/g;

  let match;
  while ((match = caseRegex.exec(data)) !== null) {
    cases.push({
      id: match[1],
      query: match[2],
      level: match[3],
      sheet: match[4],
      source: match[5],
      preset: match[6],
      golden: match[7],
      skill: match[8],
      note: match[9]
    });
  }

  return cases;
}
