require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

const db = require('./db');  
app.set('trust proxy', 1);
const corsOpts = {
  origin: ['https://test-web-app-ge.vercel.app'], // ✅ เหลืออันเดียว
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOpts));


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use(cookieParser());

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


function authRequired(req, res, next) {
  try {
    const token = req.cookies?.auth;
    if (!token) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
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
    const [rows] = await db.query('SELECT 1 AS result');
    res.json({ ok: true, rows });
  } catch (e) {
    console.error('DB health fail:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ✅ API ล็อกอิน
const bcrypt = require('bcryptjs');

app.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password)
      return res.status(400).json({ ok: false, message: 'กรอกอีเมลและรหัสผ่านให้ครบ' });

    const sql = `
      SELECT u.email, u.password, s.student_Name, s.student_level, 
             s.faculty_ID, f.faculty_Name, s.student_ID
      FROM Users u
      LEFT JOIN Student s ON s.email = u.email
      LEFT JOIN Faculty f ON f.faculty_ID = s.faculty_ID
      WHERE u.email = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [email]);
    if (!rows.length)
      return res.status(401).json({ ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const payload = {
      email: user.email,
      student_ID: user.student_ID || '',
      student_Name: user.student_Name || '',
      student_level: user.student_level || '',
      faculty_ID: user.faculty_ID || '',
      faculty_Name: user.faculty_Name || ''
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000
    });

    console.log('✅ Login success:', email);
    return res.json({ ok: true, user: payload });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ ok: false, message: 'Database error', error: err.message });
  }
});
app.post('/logout', (req, res) => {
  res.clearCookie('auth', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  return res.json({ ok: true, message: 'Logged out' });
});



app.get("/testtt", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM testtt"); // ✅ ใช้ await db.query()
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /testtt:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
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




// ✅ API วิชา - ดึงเฉพาะกลุ่มวิชา (distinct group_type)
app.get("/subject-groups", async (req, res) => {
  try {
    const [results] = await db.query("SELECT GroupType_ID, GroupType_Name FROM Group_Type");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /subject-groups:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});



// ✅ API ดึงเกรดทั้งหมด
app.get("/grades", async (req, res) => {
  try {
    const [results] = await db.query("SELECT grade_ID, grade_Name FROM Grade_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /grades:", err);
    res.status(500).json({ ok: false, message: "ดึงเกรดล้มเหลว", error: err.message });
  }
});


// ✅ API วิชาจากกลุ่มที่เลือก
app.get("/subjects/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const [results] = await db.query(
      "SELECT subject_ID, subject_Name FROM Subject WHERE group_type_ID = ?",
      [groupId]
    );
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /subjects:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลความสนใจ
app.get("/interestd", async (req, res) => {
  try {
    const [results] = await db.query("SELECT interest_ID, interest_Name FROM Interestd");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /interestd:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลงานกลุ่ม
app.get("/groupwork", async (req, res) => {
  try {
    const [results] = await db.query("SELECT groupwork_ID, groupwork_Name FROM GroupWork_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /groupwork:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลงานเดี่ยว
app.get("/solowork", async (req, res) => {
  try {
    const [results] = await db.query("SELECT solowork_ID, solowork_Name FROM SoloWork_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /solowork:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลสอบ
app.get("/exam", async (req, res) => {
  try {
    const [results] = await db.query("SELECT exam_ID, exam_Name FROM Exam_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /exam:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลเข้าห้องเรียน
app.get("/attendance", async (req, res) => {
  try {
    const [results] = await db.query("SELECT attendance_ID, attendance_Name FROM Attendance_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /attendance:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลการสอน
app.get("/instruction", async (req, res) => {
  try {
    const [results] = await db.query("SELECT instruction_ID, instruction_Name FROM Instruction_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /instruction:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลการนำเสนอ
app.get("/present", async (req, res) => {
  try {
    const [results] = await db.query("SELECT present_ID, present_Name FROM Present_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /present:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลประสบการณ์ใหม่ๆ
app.get("/experience", async (req, res) => {
  try {
    const [results] = await db.query("SELECT experience_ID, experience_Name FROM Experience_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /experience:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลความท้าทาย
app.get("/challenge", async (req, res) => {
  try {
    const [results] = await db.query("SELECT challenge_ID, challenge_Name FROM Challenge_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /challenge:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});

// ✅ API ดึงข้อมูลเวลา
app.get("/time", async (req, res) => {
  try {
    const [results] = await db.query("SELECT time_ID, time_Name FROM Time_map");
    res.json(results);
  } catch (err) {
    console.error("❌ SQL ERROR /time:", err);
    res.status(500).json({ ok: false, message: "Database Error", error: err.message });
  }
});


// ✅ ต้องแน่ใจว่า pool มาจาก mysql2/promise เช่น
// import mysql from 'mysql2/promise';
// const pool = mysql.createPool({ ... });


app.post("/submit-form", async (req, res) => {
  try {
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

    // ✅ 1) Insert ลง Form_ge ก่อน
    const insertFormGe = `
      INSERT INTO Form_ge (student_ID, faculty_ID, student_level, interestd, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(insertFormGe, [
      student_id,
      faculty,
      student_level,
      interestds,
      timestamp
    ]);

    const formGeId = result.insertId;

    // ✅ 2) Insert ลง Form_review (ใช้ ID จาก Form_ge)
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

    await db.query(insertReview, [
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
    ]);

    console.log("✅ บันทึกข้อมูลเรียบร้อย Form_ge ID =", formGeId);
    res.json({ ok: true, message: "ข้อมูลถูกบันทึกเรียบร้อยแล้ว" });

  } catch (err) {
    console.error("❌ Submit Form Error:", err);
    res.status(500).json({ ok: false, message: "Insert Form ล้มเหลว", error: err.message });
  }
});


// ===== สมัครบัญชี =====
app.post('/register', async (req, res) => {
  try {
    const student_ID = req.body.student_ID ?? req.body.student_id;
    const student_Name = req.body.student_Name ?? req.body.full_name;
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    const student_level = req.body.student_level;
    const faculty = req.body.faculty;

    if (!student_ID || !student_Name || !email || !password || !student_level || !faculty) {
      return res.status(400).json({ ok: false, message: 'กรอกข้อมูลให้ครบ' });
    }

    if (!email.endsWith('@nu.ac.th')) {
      return res.status(400).json({ ok: false, message: 'ต้องใช้อีเมล @nu.ac.th เท่านั้น' });
    }

    // ✅ ตรวจซ้ำว่ามีอยู่แล้วหรือไม่
    const checkSql = `
      SELECT
        (SELECT COUNT(*) FROM Student WHERE student_ID = ?) AS sCount,
        (SELECT COUNT(*) FROM Users   WHERE email      = ?) AS uCount
    `;
    const [checkRows] = await db.query(checkSql, [student_ID, email]);
    const { sCount = 0, uCount = 0 } = checkRows?.[0] || {};
    if (sCount > 0 || uCount > 0) {
      return res.status(409).json({ ok: false, message: 'มีบัญชีนี้อยู่แล้ว' });
    }

    // ✅ เริ่ม transaction
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const hash = await bcrypt.hash(password, 10);

      // 1) Insert Users
      await conn.query(`INSERT INTO Users (email, password) VALUES (?, ?)`, [email, hash]);

      // 2) Insert Student
      await conn.query(
        `INSERT INTO Student (student_ID, student_Name, student_level, faculty_ID, email)
         VALUES (?, ?, ?, ?, ?)`,
        [student_ID, student_Name, student_level, faculty, email]
      );

      await conn.commit();
      conn.release();
      res.json({ ok: true, message: 'สมัครบัญชีสำเร็จ' });
    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error('❌ Register Transaction Error:', err);
      res.status(500).json({ ok: false, message: 'Register failed', error: err.message });
    }
  } catch (err) {
    console.error('❌ Register System Error:', err);
    res.status(500).json({ ok: false, message: 'Database Error', error: err.message });
  }
});





/* ---------- Case-based Reasoning ---------- */

app.post('/cbr-match', async (req, res) => {
  try {
    const input = req.body;
    console.log('📥 /cbr-match payload:', input);

    // 1️⃣ ดึงเคสทั้งหมดจากฐานข้อมูล
    const [cases] = await db.query(`
      SELECT 
        s.Subject_ID,
        s.Subject_Name,
        s.group_type_name,
        s.group_type,
        s.grade_Name,
        s.grade_ID,
        s.review
      FROM Subject AS s
    `);

    // 2️⃣ จำลองการคำนวณ similarity (คุณอาจมีของจริงอยู่แล้ว)
    const results = cases.map(c => {
      const similarity = Math.random() * 100; // ตัวอย่างสุ่ม
      return { ...c, similarity };
    });

    // 3️⃣ เรียงจากมากไปน้อย
    results.sort((a, b) => b.similarity - a.similarity);

    // 4️⃣ ✅ จัดกลุ่มตาม group_type_name
    const grouped = {};
    for (const r of results) {
      const key = r.group_type_name || r.group_type || 'ไม่ระบุหมวด';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }

    // 5️⃣ ✅ แปลงเป็น array สำหรับส่งออก
    const groups = Object.keys(grouped).map(k => ({
      group_type_name: k,
      items: grouped[k]
    }));

    // 6️⃣ ✅ ส่ง response
    res.json({
      ok: true,
      groups,                   // ส่งกลุ่มกลับไป
      top: results.slice(0, 3),  // top 3 วิชา
      all: results               // ทั้งหมด
    });
  } catch (err) {
    console.error('❌ /cbr-match error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});


// ✅ ดึงรีวิวทั้งหมดของวิชานั้น
app.get('/grouped-subjects', async (req, res) => {
  try {
    const sql = `
      SELECT
        g.groupType_ID,
        g.groupType_Name,
        s.subject_ID,
        s.subject_Name
      FROM Group_Type AS g
      LEFT JOIN Subject AS s ON s.group_type_ID = g.groupType_ID   -- ✅ ใช้ชื่อจริงตาม DB
      ORDER BY g.groupType_ID, s.subject_Name
    `;

    const [rows] = await db.query(sql);
    const grouped = [];

    rows.forEach(row => {
      let group = grouped.find(g => g.group_ID === row.groupType_ID);
      if (!group) {
        group = {
          group_ID: row.groupType_ID,
          group_Name: row.groupType_Name,
          subjects: []
        };
        grouped.push(group);
      }

      if (row.subject_ID) {
        group.subjects.push({
          subject_ID: row.subject_ID,
          subject_Name: row.subject_Name
        });
      }
    });

    res.json(grouped);
  } catch (err) {
    console.error('❌ grouped-subjects error (SQL failed):', err.message);
    res.status(500).json({ ok: false, message: 'Database Error', error: err.message });
  }
});



function normalizeSubjectId(x) {
  return String(x || '').replace(/\s+/g, '').toUpperCase().slice(0, 6);
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
