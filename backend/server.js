require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const pool = require('./db');      // db.js export เป็น createPool() (ยังไม่ .promise())
const db = pool.promise();         // ใช้แบบ promise
const connection = pool; 
const corsOpts = {
  origin: ['https://test-web-app-ge.vercel.app'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOpts));
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use(cookieParser());



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: [
    'https://test-web-app-ge.vercel.app',
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))
function authRequired(req, res, next) {
  try {
    const token = req.cookies?.auth;
    if (!token) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // แนบ user ให้ route ถัดไปใช้งาน
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
}
app.get('/me', (req, res) => {
  try {
    const token = req.cookies?.auth;
    if (!token) return res.json({ ok: false });
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ ok: true, user });
  } catch {
    return res.json({ ok: false });
  }
});



app.get('/db-health', async (_req, res) => {
  try {
    const [r] = await pool.query('SELECT 1');
    res.json({ ok: true, r });
  } catch (e) {
    console.error('DB health fail:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});



app.get("/testtt", (req, res) => {
  connection.query("SELECT *FROM testtt", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ✅ API ดึงคณะ
app.get('/faculty', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT faculty_ID, faculty_Name FROM Faculty');
    res.json(rows);
  } catch (err) {
    console.error('SQL /faculty error:', err);   // 👈 ดูใน Render Logs
    res.status(500).json({ ok:false, message:'DB error', error: err.code || err.message });
  }
});


// ✅ API ดึงเกรดทั้งหมด
app.get("/grades", (req, res) => {
  connection.query("SELECT grade_ID, grade_Name FROM Grade_map", (err, results) => {
    if (err) return res.status(500).send("ดึงเกรดล้มเหลว");
    res.json(results);
  });
});

// ✅ API วิชา
// ดึงเฉพาะกลุ่มวิชา (distinct group_type)
app.get("/subject-groups", (req, res) => {
  const sql = "SELECT GroupType_ID, GroupType_Name FROM Group_Type";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL ERROR:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});


// ดึงรายวิชาจากกลุ่มวิชาที่เลือก
app.get("/subjects/:groupId", (req, res) => {
  const groupId = req.params.groupId;
  console.log("GroupType_ID ที่รับมา:", groupId);

  const sql = "SELECT subject_ID, subject_Name FROM Subject WHERE group_type_ID = ?";
  connection.query(sql, [groupId], (err, results) => {
    if (err) {
      console.error("❌ SQL ERROR:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});


// ✅ API ดึงข้อมูลความสนใจ
app.get("/interestd", (req, res) => {
  console.log("📡 ถูกเรียก /interestd");
  const sql = "SELECT interest_ID, interest_Name FROM Interestd";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึงข้อมูลความสนใจล้มเหลว:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results); // ส่งข้อมูลกลับเป็น JSON
  });
});

// ✅ API ดึงข้อมูลงานกลุ่ม
app.get("/groupwork", (req, res) => {
  const sql = "SELECT groupwork_ID, groupwork_Name FROM GroupWork_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง groupwork ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลงานเดี่ยว
app.get("/solowork", (req, res) => {
  const sql = "SELECT solowork_ID, solowork_Name FROM SoloWork_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง solowork ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลสอบ
app.get("/exam", (req, res) => {
  const sql = "SELECT exam_ID, exam_Name FROM Exam_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง exam ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลเข้าห้องเรียน
app.get("/attendance", (req, res) => {
  const sql = "SELECT attendance_ID, attendance_Name FROM Attendance_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง attendance ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลการสอน
app.get("/instruction", (req, res) => {
  const sql = "SELECT instruction_ID, instruction_Name FROM Instruction_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง instruction ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลนำเสนอ
app.get("/present", (req, res) => {
  const sql = "SELECT present_ID, present_Name FROM Present_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง present ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลประสบการณ์ใหม่ๆ
app.get("/experience", (req, res) => {
  const sql = "SELECT experience_ID, experience_Name FROM Experience_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง experience ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลความท้าทาย
app.get("/challenge", (req, res) => {
  const sql = "SELECT challenge_ID, challenge_Name FROM Challenge_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง challenge ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ API ดึงข้อมูลเวลา
app.get("/time", (req, res) => {
  const sql = "SELECT time_ID, time_Name FROM Time_map";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ดึง time ผิดพลาด:", err);
      return res.status(500).send("Database Error");
    }
    res.json(results);
  });
});

// ✅ ต้องแน่ใจว่า pool มาจาก mysql2/promise เช่น
// import mysql from 'mysql2/promise';
// const pool = mysql.createPool({ ... });

app.post("/submit-form", (req, res) => {
  console.log("📦 ฟอร์มที่รับมา:", req.body);
  const {
    student_id,
    subjectGroup,
    student_level,
    faculty,
    interestd,
    subject,
    groupwork,
    solowork,
    exam,
    attendance,
    instruction,
    present,
    experience,
    challenge,
    time,
    grade,
    review
  } = req.body;

  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

  const interestds = Array.isArray(interestd) ? interestd.join(",") : interestd;

  console.log("❤️ interestd =", interestd);
  console.log("💡 interestds =", interestds);

  const insertFormGe = `
    INSERT INTO Form_ge (student_ID, faculty_ID, student_level, interestd, timestamp)
    VALUES (?, ?, ?, ?, ?)

  `;

  connection.query(insertFormGe, [student_id, faculty, student_level, interestds, timestamp], (err, result) => {
    if (err) {
      console.error("Insert Form_ge error:", err);
      return res.status(500).send("Insert Form_ge failed");
    }

    const formGeId = result.insertId;

    const insertReview = `
      INSERT INTO Form_review (
        fg_ID,
        group_type,
        subject_ID,
        groupwork_ID,
        solowork_ID,
        exam_ID,
        attendance_ID,
        instruction_ID,
        present_ID,
        experience_ID,
        challenge_ID,
        time_ID,
        grade_ID,
        review
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertReview, [
      formGeId,
      subjectGroup,
      subject,
      groupwork,
      solowork,
      exam,
      attendance,
      instruction,
      present,
      experience,
      challenge,
      time,
      grade,
      review
    ], (err2) => {
      if (err2) {
        console.error("Insert Form_review error:", err2);
        return res.status(500).send("Insert Form_review failed");
      }

      res.send("✅ ข้อมูลถูกบันทึกเรียบร้อยแล้ว");
    });
  });
});


// ✅ API ล็อกอิน
const bcrypt = require('bcryptjs');

function isNuEmail(v) {
  return typeof v === 'string' && v.toLowerCase().endsWith('@nu.ac.th');
}

// ในไฟล์ server.js (หา app.post('/login', ...) แล้วแก้ไขทั้งบล็อก)

app.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password;

  const sql = `
    SELECT
      u.email,
      u.password,
      s.student_Name,
      s.student_level,
      s.faculty_ID,
      f.faculty_Name,
      s.student_ID
    FROM Users u
    LEFT JOIN Student s ON s.email = u.email
    LEFT JOIN Faculty f ON f.faculty_ID = s.faculty_ID
    WHERE u.email = ?
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(sql, [email]);  // ← คุณมี db.promise() แล้ว ใช้ต่อได้เลย :contentReference[oaicite:3]{index=3}
    if (!rows.length) {
      return res.status(401).json({ ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    const row = rows[0];

    const ok = await bcrypt.compare(password, row.password);
    if (!ok) {
      return res.status(401).json({ ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // --- สร้าง JWT payload ที่จำเป็นต่อการโชว์ในหน้าเว็บ ---
    const payload = {
      email: row.email,
      student_ID: row.student_ID || '',
      student_Name: row.student_Name || '',
      student_level: row.student_level || '',
      faculty_ID: row.faculty_ID || '',
      faculty_Name: row.faculty_Name || ''
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    // --- ออกคุกกี้แบบ httpOnly ข้ามโดเมน (Vercel ↔ Render) ---
    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,         // ต้อง https เท่านั้น
      sameSite: 'none',     // เพื่อส่งข้ามโดเมน
      maxAge: 2 * 60 * 60 * 1000 // 2 ชั่วโมง
    });

    return res.json({ ok: true, user: payload });
  } catch (err) {
    console.error('Login DB error:', err);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('auth', { httpOnly: true, secure: true, sameSite: 'none' });
  return res.json({ ok: true });
});







// ===== สมัครบัญชี =====
app.post('/register', (req, res) => {
  // รับค่าจาก body: ใช้ชื่อ student_ID / student_Name เป็นหลัก
  // (เผื่อฟรอนต์เก่าส่ง student_id/full_name มาจะ fallback ให้)
  const student_ID = req.body.student_ID ?? req.body.student_id;
  const student_Name = req.body.student_Name ?? req.body.full_name;
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  const student_level = req.body.student_level;
  const faculty = req.body.faculty;

  // ตรวจความครบถ้วน
  if (!student_ID || !student_Name || !email || !password || !student_level || !faculty) {
    return res.status(400).json({ ok: false, message: 'กรอกข้อมูลให้ครบ' });
  }
  // ตรวจโดเมนอีเมล @nu.ac.th
  function isNuEmail(v) {
    return typeof v === 'string' && v.endsWith('@nu.ac.th');
  }
  if (!isNuEmail(email)) {
    return res.status(400).json({ ok: false, message: 'ต้องใช้อีเมล @nu.ac.th เท่านั้น' });
  }

  // เช็คซ้ำว่ามีอยู่แล้วหรือไม่
  const checkSql = `
    SELECT
      (SELECT COUNT(*) FROM Student WHERE student_ID = ?) AS sCount,
      (SELECT COUNT(*) FROM Users   WHERE email      = ?) AS uCount
  `;
  connection.query(checkSql, [student_ID, email], async (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ ok: false, message: 'Database Error' });
    }
    const { sCount = 0, uCount = 0 } = rows?.[0] || {};
    if (sCount > 0 || uCount > 0) {
      return res.status(409).json({ ok: false, message: 'มีบัญชีนี้อยู่แล้ว' });
    }

    // เริ่มทรานแซกชัน
    connection.beginTransaction(async (trErr) => {
      if (trErr) {
        console.error('beginTransaction error:', trErr);
        return res.status(500).json({ ok: false, message: 'Transaction start failed' });
      }

      try {
        // 1) แทรก Users ก่อน (ถ้า Student.email เป็น FK → Users.email)
        const hash = await bcrypt.hash(password, 10);
        const insertUser = `INSERT INTO Users (email, password) VALUES (?, ?)`;
        connection.query(insertUser, [email, hash], (iUErr) => {
          if (iUErr) {
            // ซ้ำอีเมล
            if (iUErr.code === 'ER_DUP_ENTRY') {
              return connection.rollback(() => {
                res.status(409).json({ ok: false, message: 'อีเมลนี้ถูกใช้แล้ว' });
              });
            }
            console.error('Insert Users error:', iUErr);
            return connection.rollback(() => {
              res.status(500).json({ ok: false, message: 'Insert Users failed' });
            });
          }

          // 2) แทรก Student (ใช้คอลัมน์ตาม DB: student_ID, student_Name, ...)
          const insertStudent = `
            INSERT INTO Student (student_ID, student_Name, student_level, faculty_ID, email)
            VALUES (?, ?, ?, ?, ?)
          `;
          connection.query(
            insertStudent,
            [student_ID, student_Name, student_level, faculty, email],
            (iSErr) => {
              if (iSErr) {
                // ถ้า FK ล้มเหลวเพราะ Users ยังไม่พร้อม (ไม่น่าเกิดเพราะเรา insert Users ก่อนแล้ว)
                console.error('Insert Student error:', iSErr);
                return connection.rollback(() => {
                  res.status(500).json({ ok: false, message: 'Insert Student failed' });
                });
              }

              connection.commit((cErr) => {
                if (cErr) {
                  console.error('Commit error:', cErr);
                  return connection.rollback(() => {
                    res.status(500).json({ ok: false, message: 'Commit failed' });
                  });
                }
                res.json({ ok: true, message: 'สมัครบัญชีสำเร็จ' });
              });
            }
          );
        });
      } catch (e) {
        console.error('Register catch error:', e);
        return connection.rollback(() => {
          res.status(500).json({ ok: false, message: 'Register failed' });
        });
      }
    });
  });
});





/* ---------- Case-based Reasoning ---------- */

app.post('/cbr-match', (req, res) => {
  const {
    interestd = [],
    groupwork, solowork, exam, attendance,
    instructions = [],      // ✅ ใหม่: รองรับหลายค่า
    instruction = '',       // เดิม: ค่าเดียว (เผื่อยังส่งมา)
    present, experience, challenge, time,
    group_types = [],
    grade: userGrade,
    weights = {},
    debug
  } = req.body;

  const wantDebug = Boolean(debug) || process.env.DEBUG_CBR === '1';

  // --- helpers เฉพาะมิตินี้ ---
  const parseCsv = (s) =>
    String(s ?? '')
      .split(',')
      .map(x => String(x).trim())
      .filter(Boolean);

  const toD = (v) => {
    const s = String(v).trim().toUpperCase();        // 'd1' -> 'D1'
    if (/^\d+$/.test(s)) return 'D' + s;             // '1' -> 'D1'
    const m = s.match(/^D\s*(\d+)$/i);               // 'D 1' -> 'D1'
    return m ? 'D' + m[1] : s;                       // คืนเดิมถ้าไม่แมตช์
  };

  const normInstrTokens = (arrOrCsv) => {
    const arr = Array.isArray(arrOrCsv) ? arrOrCsv : parseCsv(arrOrCsv);
    // unique & คงลำดับที่ติ๊ก (พอประมาณ)
    const seen = new Set();
    const out = [];
    for (const v of arr.map(toD)) {
      if (!seen.has(v)) { seen.add(v); out.push(v); }
    }
    return out;
  };

  // --- SQL: ดึง CSV ของ instruction จากตารางเชื่อม ถ้ามี; ถ้าไม่มี ใช้คอลัมน์เดิม ---
  let sql = `
    SELECT
      fr.subject_ID,
      s.subject_Name,
      fr.group_type,
      gt.GroupType_Name,
      fr.groupwork_ID, fr.solowork_ID, fr.exam_ID, fr.attendance_ID,
      fr.instruction_ID,             -- อาจเป็นค่าว่าง/CSV เก่า
      COALESCE(fri.instruction_csv, fr.instruction_ID) AS instruction_csv,  -- ✅ ใช้ csv จากตารางเชื่อม
      fr.present_ID, fr.experience_ID, fr.challenge_ID, fr.time_ID,
      fr.grade_ID, gm.grade_Name, fr.review,
      fg.interestd
    FROM Form_review AS fr
    JOIN Form_ge  AS fg ON fg.id = fr.fg_ID
    LEFT JOIN Subject    AS s  ON s.subject_ID = fr.subject_ID
    LEFT JOIN Group_Type AS gt ON gt.GroupType_ID = fr.group_type
    LEFT JOIN Grade_map  AS gm ON gm.grade_ID  = fr.grade_ID
    LEFT JOIN (
      SELECT fr_ID, GROUP_CONCAT(instruction_ID ORDER BY instruction_ID) AS instruction_csv
      FROM Form_review_instruction
      GROUP BY fr_ID
    ) AS fri ON fri.fr_ID = fr.fr_ID
  `;
  const params = [];

  if (Array.isArray(group_types) && group_types.length) {
    sql += ` WHERE fr.group_type IN (${group_types.map(() => '?').join(',')})`;
    params.push(...group_types);
  }

  connection.query(sql, params, (err, rows) => {
    if (err) {
      console.error('CBR SQL error:', err);
      return res.status(500).json({ ok: false, message: 'Database Error' });
    }

    try {
      // ---------- น้ำหนัก ----------
      const baseW = {
        interestd: 25,
        exam: 32,
        instruction: 28,
        groupwork: 24,
        solowork: 19,
        experience: 30,
        challenge: 22,
        time: 25,
        attendance: 38,
        present: 31,
      };
      const W = { ...baseW, ...(weights || {}) };

      // ---------- helpers เดิม (ยกมาจากไฟล์คุณ) ----------
      function normalizeInterestTokens(value) {
        if (value == null) return [];
        const tokens = Array.isArray(value) ? value : String(value).split(',');
        const out = tokens
          .map(t => String(t).trim())
          .filter(Boolean)
          .map(t => {
            const m = t.match(/\d+/);
            if (!m) return null;
            const n = parseInt(m[0], 10);
            return Number.isFinite(n) ? String(n) : null;
          })
          .filter(Boolean);
        return [...new Set(out)];
      }
      function diceTokens(A, B) {
        if (!Array.isArray(A) || !Array.isArray(B) || A.length === 0 || B.length === 0) return null;
        const a = new Set(A), b = new Set(B);
        const inter = [...a].filter(x => b.has(x)).length;
        return (2 * inter) / (a.size + b.size);
      }
      function parseCodeLevel(v) {
        if (v == null) return { prefix: null, level: null };
        const s = String(v).trim();
        if (/^\d+(\.\d+)?$/.test(s)) return { prefix: null, level: Number(s) };
        const m = s.match(/^([A-Za-z]+)?\s*(\d+(?:\.\d+)?)$/);
        if (!m) return { prefix: null, level: null };
        return { prefix: (m[1] || '').toUpperCase(), level: Number(m[2]) };
      }
      function simCodeOrdinal(userVal, caseVal, { expectedPrefix = null, min = 1, max = 4, onPrefixMismatch = 'zero' } = {}) {
        const u = parseCodeLevel(userVal);
        const c = parseCodeLevel(caseVal);
        if (expectedPrefix) {
          const badU = u.prefix && u.prefix !== expectedPrefix;
          const badC = c.prefix && c.prefix !== expectedPrefix;
          if (badU || badC) return onPrefixMismatch === 'skip' ? null : 0;
        }
        if (!Number.isFinite(u.level) || !Number.isFinite(c.level)) return null;
        const range = Number(max) - Number(min);
        if (range <= 0) return u.level === c.level ? 1 : 0;
        const diff = Math.abs(u.level - c.level) / range;
        return Math.max(0, Math.min(1, 1 - diff));
      }
      const simInverseAbs = (a, b) => {
        const an = Number(a), bn = Number(b);
        if (!Number.isFinite(an) || !Number.isFinite(bn)) return null;
        return 1 / (1 + Math.abs(an - bn));
      };
      function ensurePrefix(val, prefix) {
        if (val == null) return null;
        const s = String(val).trim();
        if (/^\d+$/.test(s)) return prefix + s;
        return s;
      }

      // ---------- เตรียมค่าผู้ใช้ ----------
      const userInterestTokens = normalizeInterestTokens(interestd);
      // ✅ รวม instruction หลายค่า (instructions[]) + เดี่ยว (instruction)
      const userInstrTokens = normInstrTokens([
        ... (Array.isArray(instructions) ? instructions : []),
        ...parseCsv(instruction)
      ]);

      // ---------- ประมวลผลเคส ----------
      const results = rows.map((r) => {
        const caseInterestTokens = normalizeInterestTokens(r.interestd);
        // ✅ ดึงโค้ดรูปแบบการสอนของเคสจาก instruction_csv (หรือคอลัมน์เดิม)
        const caseInstrTokens = normInstrTokens(r.instruction_csv);

        // ถ้าคุณยังอยากได้ ordinal สำหรับ “ค่าเดียว” ก็ปล่อยไว้ได้ แต่ให้ Dice เป็นตัวหลัก
        const sims = {
          interestd: diceTokens(userInterestTokens, caseInterestTokens),
          groupwork: simInverseAbs(groupwork, r.groupwork_ID),
          solowork: simInverseAbs(solowork, r.solowork_ID),
          exam: simCodeOrdinal(ensurePrefix(exam, 'C'), r.exam_ID, { expectedPrefix: 'C', min: 0, max: 7 }),
          attendance: simInverseAbs(attendance, r.attendance_ID),

          // ✅ ใช้ Dice สำหรับ “หลายค่า”
          instruction: diceTokens(userInstrTokens, caseInstrTokens),

          present: simInverseAbs(present, r.present_ID),
          experience: simInverseAbs(experience, r.experience_ID),
          challenge: simInverseAbs(challenge, r.challenge_ID),
          time: simInverseAbs(time, r.time_ID),
        };

        // รวมคะแนนตามน้ำหนัก (นับเฉพาะ sim ที่ไม่ใช่ null)
        let score = 0, wsum = 0;
        const contribs = {};
        const weightsUsed = {};
        for (const k of Object.keys(sims)) {
          const s = sims[k];
          if (s == null || !Number.isFinite(s)) continue;
          const w = Number(W[k]) || 0;
          if (w <= 0) continue;
          score += w * s;
          wsum += w;
          contribs[k] = { w, s, ws: w * s };
          weightsUsed[k] = w;
        }
        const norm = wsum ? score / wsum : 0;
        const similarityPct = Math.round(Math.max(0, Math.min(1, norm)) * 10000) / 100;

        const dbg = wantDebug ? {
          user_input: {
            interestd_raw: interestd,
            interestd_tokens: userInterestTokens,
            instruction_tokens: userInstrTokens,   // ✅ debug token
            groupwork, solowork, exam, attendance, present, experience, challenge, time,
          },
          case_values: {
            subject_ID: r.subject_ID,
            group_type: r.group_type,
            interestd_raw: r.interestd,
            interestd_tokens: caseInterestTokens,
            instruction_csv: r.instruction_csv,    // ✅ debug csv
            instruction_tokens: caseInstrTokens,   // ✅ debug token
            groupwork_ID: r.groupwork_ID,
            solowork_ID: r.solowork_ID,
            exam_ID: r.exam_ID,
            attendance_ID: r.attendance_ID,
            present_ID: r.present_ID,
            experience_ID: r.experience_ID,
            challenge_ID: r.challenge_ID,
            time_ID: r.time_ID,
          },
          sims, weights_used: weightsUsed,
          contributions: Object.fromEntries(
            Object.entries(contribs).map(([k, v]) => [k, {
              w: +v.w.toFixed(6),
              s: +v.s.toFixed(6),
              ws: +v.ws.toFixed(6),
              ws_pct: wsum ? +((v.ws / wsum) * 100).toFixed(3) : 0
            }])
          ),
          sums: { score: +score.toFixed(6), wsum: +wsum.toFixed(6), norm: +norm.toFixed(6), similarityPct }
        } : undefined;

        return {
          subject_ID: r.subject_ID,
          subject_Name: r.subject_Name,
          review: r.review,
          group_type: r.group_type,
          group_type_name: r.GroupType_Name || String(r.group_type),
          similarity: similarityPct,
          sims,
          grade_ID: r.grade_ID ?? null,
          grade_Name: r.grade_Name ?? null,
          ...(wantDebug ? { dbg } : {})
        };
      });

      // เรียง/จัดกลุ่ม (เหมือนของเดิม)
      results.sort((a, b) => b.similarity - a.similarity);

      if (Array.isArray(group_types) && group_types.length) {
        const byGroup = {};
        for (const it of results) {
          (byGroup[it.group_type] ||= { group_type: it.group_type, group_type_name: it.group_type_name, items: [] }).items.push(it);
        }
        const groups = Object.values(byGroup).map(g => {
          // เก็บตัวที่ดีที่สุดต่อ subject_ID
          const seen = new Set();
          const out = [];
          for (const x of g.items) {
            const key = String(x.subject_ID);
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(x);
          }
          g.items = out.slice(0, 3);
          return g;
        });
        return res.json({ ok: true, groups });
      }

      return res.json({ ok: true, top: results.slice(0, 3), all: results });

    } catch (e) {
      console.error('CBR compute error:', e);
      return res.status(500).json({ ok: false, message: 'CBR compute error' });
    }
  });
});



//รวมวิชาทั้งหมด ไว้ในกลุ่ม
app.get('/grouped-subjects', (req, res) => {
  const sql = `
    SELECT
      g.GroupType_ID,
      g.GroupType_Name,
      s.subject_ID,
      s.subject_Name
    FROM Group_Type g
    LEFT JOIN Subject s ON s.Group_Type_ID = g.GroupType_ID
    ORDER BY g.GroupType_ID, s.subject_Name
  `

  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).send("Database Error")

    const grouped = []

    rows.forEach(row => {
      let group = grouped.find(g => g.group_ID === row.GroupType_ID)

      if (!group) {
        group = {
          group_ID: row.GroupType_ID,
          group_Name: row.GroupType_Name,
          subjects: []
        }
        grouped.push(group)
      }

      if (row.subject_ID) {
        group.subjects.push({
          subject_ID: row.subject_ID,
          subject_Name: row.subject_Name
        })
      }
    })

    res.json(grouped)
  })
})

// ✅ ดึง "รีวิวทั้งหมด" ของวิชานั้น
app.get('/subjects/:id/reviews', (req, res) => {
  const subjectId = String(req.params.id || '').trim()
  if (!subjectId) {
    return res.status(400).json({ message: 'subject id is required' })
  }

  const sql = `
    SELECT
      fr_ID      AS id,
      subject_ID AS subjectId,
      review     AS text
    FROM Form_review
    WHERE subject_ID = ?
    ORDER BY fr_ID DESC
  `
  connection.query(sql, [subjectId], (err, rows) => {
    if (err) {
      console.error('❌ fetch reviews failed:', err)
      return res.status(500).json({ message: 'Failed to fetch reviews' })
    }
    res.json({
      subjectId,
      count: rows.length,
      reviews: rows, // [{ id, subjectId, text }]
    })
  })
})

function normalizeSubjectId(x) {
  return String(x || '').replace(/\s+/g, '').toUpperCase().slice(0, 6);
}


// คืนเฉพาะ subject_ID เพื่อไฮไลต์หัวใจ
// คืน subject_ID ทั้งหมดที่คนนั้นกดหัวใจ
// ✅ ใช้มิดเดิลแวร์ authRequired (คุณมีอยู่แล้วด้านบน)
function authRequired(req, res, next) {
  try {
    const token = req.cookies?.auth;
    if (!token) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // แนบข้อมูล user ใน token
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
}

// ✅ ดึงรายการโปรดทั้งหมด (เฉพาะ ID)
app.get('/favorites/ids', authRequired, async (req, res) => {
  try {
    const studentId = String(req.user.student_ID || '').trim();
    if (!studentId) return res.status(400).json({ ok: false, message: 'student_id missing in token' });

    const [rows] = await db.query(
      'SELECT subject_ID FROM Favorite WHERE student_ID = ?',
      [studentId]
    );
    res.json(rows.map(r => r.subject_ID));
  } catch (e) {
    console.error('favorites ids error:', e);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ✅ เพิ่มรายการโปรด (ไม่ต้องส่ง student_id แล้ว)
app.post('/favorites', authRequired, async (req, res) => {
  try {
    const studentId = String(req.user.student_ID || '').trim();
    const { subject_id } = req.body || {};

    if (!studentId || !subject_id) {
      return res.status(400).json({ ok: false, message: 'student_id or subject_id missing' });
    }

    const sid = normalizeSubjectId(subject_id);

    // ดึง group_type ของวิชานั้น
    const [[row]] = await db.query(
      'SELECT Group_Type_ID AS gt FROM Subject WHERE subject_ID = ? LIMIT 1',
      [sid]
    );
    if (!row || !row.gt) {
      return res.status(400).json({ ok: false, message: 'subject not found or no group type' });
    }

    await db.query(
      `INSERT INTO Favorite (student_ID, subject_ID, group_type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
      [studentId, sid, row.gt]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('favorite add error:', e);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ✅ เอาออกจากรายการโปรด (ไม่ต้องส่ง student_id แล้ว)
app.delete('/favorites', authRequired, async (req, res) => {
  try {
    const studentId = String(req.user.student_ID || '').trim();
    const subjectId = normalizeSubjectId(req.query.subject_id);
    if (!studentId || !subjectId) {
      return res.status(400).json({ ok: false, message: 'student_id or subject_id missing' });
    }

    await db.query(
      'DELETE FROM Favorite WHERE student_ID = ? AND subject_ID = ?',
      [studentId, subjectId]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('favorite delete error:', e);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ✅ ดึงรายการโปรดแบบ grouped (ไม่ต้องส่ง student_id)
app.get('/favorites/grouped', authRequired, async (req, res) => {
  try {
    const studentId = String(req.user.student_ID || '').trim();
    if (!studentId) return res.status(400).json({ ok: false, message: 'student_id missing in token' });

    const [rows] = await db.query(`
      SELECT
        s.Group_Type_ID AS group_ID,
        gt.GroupType_Name AS group_Name,
        s.subject_ID,
        s.subject_Name
      FROM Favorite f
      JOIN Subject s        ON s.subject_ID    = f.subject_ID
      LEFT JOIN Group_Type gt ON gt.GroupType_ID = s.Group_Type_ID
      WHERE f.student_ID = ?
      ORDER BY s.Group_Type_ID, s.subject_Name
    `, [studentId]);

    const grouped = [];
    for (const r of rows) {
      let g = grouped.find(x => x.group_ID === r.group_ID);
      if (!g) {
        g = { group_ID: r.group_ID, group_Name: r.group_Name, subjects: [] };
        grouped.push(g);
      }
      g.subjects.push({ subject_ID: r.subject_ID, subject_Name: r.subject_Name });
    }

    res.json(grouped);
  } catch (e) {
    console.error('favorites grouped error:', e);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});


// ✅ Top 3 วิชายอดฮิตของแต่ละกลุ่ม พร้อมรีวิวทั้งหมด
app.get('/popular-subjects', async (req, res) => {
  try {
    const sql = `
      SELECT 
        s.Group_Type_ID AS group_ID,
        gt.GroupType_Name AS group_Name,
        fr.subject_ID,
        s.subject_Name,
        COUNT(fr.fr_ID) AS review_count
      FROM Form_review fr
      JOIN Subject s ON s.subject_ID = fr.subject_ID
      LEFT JOIN Group_Type gt ON gt.GroupType_ID = s.Group_Type_ID
      GROUP BY s.Group_Type_ID, fr.subject_ID
      ORDER BY s.Group_Type_ID, review_count DESC
    `;

    const [rows] = await db.query(sql);

    // ✅ จัดกลุ่ม
    const grouped = {};
    for (const r of rows) {
      if (!grouped[r.group_ID]) {
        grouped[r.group_ID] = {
          group_ID: r.group_ID,
          group_Name: r.group_Name,
          subjects: []
        };
      }
      grouped[r.group_ID].subjects.push(r);
    }

    // ✅ เอา top 3 + เพิ่มรีวิวทั้งหมด
    for (const g of Object.values(grouped)) {
      g.subjects = await Promise.all(
        g.subjects
          .sort((a, b) => b.review_count - a.review_count)
          .slice(0, 3)
          .map(async subj => {
            const [reviews] = await db.query(
              `SELECT fr_ID AS id, review AS text 
               FROM Form_review 
               WHERE subject_ID = ? 
               ORDER BY fr_ID DESC`,
              [subj.subject_ID]
            );
            return {
              ...subj,
              reviews
            };
          })
      );
    }

    res.json(Object.values(grouped));
  } catch (e) {
    console.error('popular-subjects error:', e);
    res.status(500).json({ message: 'Database error' });
  }
});

//ดึงชื่อในตารางstudents
app.put('/students/:id', async (req, res) => {
  const studentId = req.params.id;
  const { name } = req.body;

  if (!name) {
    console.error("Validation Error: Name is required.");
    return res.status(400).json({ error: 'Name is required' });
  }

  const sql = "UPDATE Student SET student_Name = ? WHERE student_ID = ?";

  try {
    const [result] = await db.query(sql, [name, studentId]);

    if (result.affectedRows === 0) {
      console.warn(`Update Warning: Student with ID ${studentId} not found.`);
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log(`✅ Success: Updated student ID ${studentId} to name "${name}".`);

    res.status(200).json({
      student_ID: studentId,
      student_Name: name
    });

  } catch (err) {
    console.error("Database Error on UPDATE:", err);
    return res.status(500).json({ error: 'Database update failed' });
  }
});


const port = process.env.PORT || 3000; // 🟢 แนะนำให้ใช้ process.env.PORT บน Render
app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
});
