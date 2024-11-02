const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const cors = require("cors");
const app = express();
const crypto = require("crypto");
const port = 3000;

const mysql = require('mysql2/promise');

let db;

async function initializeDatabase() {
  db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'co_n'
  });
}
// db.connect();
initializeDatabase().catch(err => {
  console.error("DB 연결 오류: ", err);
  process.exit(1); // 연결 실패 시 서버 종료
});

// 세션 설정
app.use(session({
  secret: process.env.SESSION_KEY, // 키값 숨길 것
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
  cookie: {
    maxAge: 1000 * 60 * 60 * 3, // 3시간 유지
    secure: false, // true: https에서만 동작
    httpOnly: true
  }
}));

// body parser: 아래 코드 2줄 없으면 form 제출 시 오류 발생
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());
app.use(express.static(path.join(__dirname, "..", "assets")));
/*
assets/img에 있는 이미지 html에서 사용 시
<img class="logo" src="../../../assets/img/logo.jpg" />
<img class="logo" src="/img/logo.jpg" />
2번째 태그와 같이 사용할 것
*/

const nodemailer = require('nodemailer');

let authnCode = "";
function generateAuthnCode() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 인증번호: 1000 이상 9999 이하의 숫자 생성
}

app.post('/send-authn', async (req, res) => {
  const { email } = req.body;

  authnCode = generateAuthnCode();

  const transporter = nodemailer.createTransport({
      service: 'naver',
      auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD
      }
  });

  const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: 'CO/N 이메일 인증 번호',
      text: `인증 번호: ${authnCode}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: '인증 코드가 발송되었습니다.' }); // JSON 응답
  } catch (error) {
      res.status(500).json({ message: '이메일 발송에 실패했습니다.' }); // JSON 응답
  }
});

app.use(express.static(path.join(__dirname, "..", "src")));
app.use(express.static(path.join(__dirname, "..", "src", "pages"))); // html파일에 연결된 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "login"))); // login페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "board"))); // 게시물 관련 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "post"))); // 게시물 관련 페이지의 js로드 안되는 문제 해결

// 로그인 페이지
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "login", "login.html"));
});

// 로그인 처리
app.post("/login", async (req, res) => {
  const loginId = req.body["login-id"];
  const loginPw = req.body["login-pw"];
  const query = "SELECT user_pw, user_salt FROM user_info WHERE user_id = ?";

  if (loginId && loginPw) {
    try {
      const [result] = await db.query(query, [loginId]);
      if (result.length > 0) {
        const user = result[0];
        const userSalt = user.user_salt;
        const hashedPw = crypto.createHash("sha256").update(loginPw + userSalt).digest("hex");
        if (hashedPw === user.user_pw) {
          req.session.isLogined = true;
          req.session.userId = loginId;
          req.session.save(() => {
            res.redirect("/home/home.html");
          });
        } else {
          res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');
        }
      } else {
        res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');
      }
    } catch (err) {
      console.error("Login error:", err);
      res.redirect('/?fault_message=서버 오류가 발생했습니다.');
    }
  } else {
    res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');
  }
});

// 로그아웃 처리
app.get("/logout", (req, res) => {
  // 세션 삭제
  req.session.destroy((err) => {
    // 로그아웃 시 로그인 페이지로 이동
    res.redirect("/");
  });
});

// 회원가입 페이지
app.get("/sign-up/sign-up.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "sign-up", "sign-up.html"));
});

// user id 중복 검사
app.post("/sign-up/user-id-availability", async (req, res) => {
  const userId = req.body["user-id"];
  const query = "SELECT COUNT(*) AS count FROM user_info WHERE user_id = ?";

  try {
    const [results] = await db.query(query, [userId]);
    const isAvailable = results[0].count === 0;
    res.json({ available: isAvailable });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Server error");
  }
});

// 회원가입 처리
app.post("/sign-up/user-info", async (req, res) => {
  const userId = req.body["user-id"];
  const userName = req.body["user-name"];
  const userNickname = req.body["user-nickname"];
  const userTel = req.body["user-tel"];
  const userAddress = req.body["user-address"];
  const userSalt = crypto.randomBytes(16).toString('base64');
  const userPw = crypto.createHash("sha256").update(req.body["user-pw"] + userSalt).digest("hex");
  const userEmailPre = req.body["user-email-pre"];
  const userEmailPost = req.body["user-email-post"];
  const checkAuthn = req.body["email-authn"];
  let userEmail;

  if (authnCode !== checkAuthn) {
    return res.redirect(`/sign-up/sign-up.html?error=${encodeURIComponent('인증번호 불일치로 회원가입에 실패했습니다.')}`);
  }

  if (userEmailPost) {
    userEmail = `${userEmailPre}${userEmailPost}`;
  } else {
    userEmail = userEmailPre;
  }

  const query = "INSERT INTO user_info (user_id, user_pw, user_name, user_nickname, user_tel, user_email, user_address, user_salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    await db.query(query, [userId, userPw, userName, userNickname, userTel, userEmail, userAddress, userSalt]);
    res.redirect('/?message=회원가입이 완료되었습니다!'); // 회원 가입 완료 시 로그인 페이지로
  } catch (err) {
    console.error("회원가입 오류:", err);
    return res.redirect(`/sign-up/sign-up.html?error=${encodeURIComponent('회원가입에 실패했습니다. 다시 시도해주세요.')}`);
  }
});

// 아이디 찾기 페이지
app.get("/forgot/forgot-id.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "forgot", "forgot-id.html"));
});

// 아이디 찾기 처리
app.post("/forgot-id", async (req, res) => {
  const userName = req.body["forgot-id-user-name"];
  const userEmailPre = req.body["forgot-id-user-email-pre"];
  const userEmailPost = req.body["forgot-id-user-email-post"];
  let userEmail;

  if (userEmailPost) {
    userEmail = `${userEmailPre}${userEmailPost}`;
  } else {
    userEmail = userEmailPre;
  }

  const query = 'SELECT user_id FROM user_info WHERE user_name = ? AND user_email = ?';

  try {
    const [results] = await db.query(query, [userName, userEmail]);
    if (results.length > 0) {
      const userId = results[0].user_id;

      const transporter = nodemailer.createTransport({
        service: 'naver',
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASSWORD
        }
      });
  
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: userEmail,
        subject: 'CO/N 회원 아이디',
        text: `아이디: ${userId}`
      };

      await transporter.sendMail(mailOptions);

      return res.redirect(`/forgot/forgot-id.html?message=해당 이메일로 아이디가 전송되었습니다.`);
    } else {
      return res.redirect(`/forgot/forgot-id.html?message=일치하는 회원 정보가 존재하지 않습니다.`);
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 비밀번호 찾기 페이지
app.get("/forgot/forgot-pw.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "forgot", "forgot-pw.html"));
});

// 임시 비밀번호 생성 함수
function generateTemporaryPassword() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*';

  // 각 그룹에서 최소 한 글자씩 뽑아 배열에 추가
  let result = [
    letters[Math.floor(Math.random() * letters.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)]
  ];

  const allChars = letters + numbers + specialChars;

  // 총 8글자가 되도록 나머지 글자를 추가
  for (let i = 0; i < 5; i++) {
    const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
    result.push(randomChar);
  }

  // 배열을 섞어서 순서가 랜덤하게 나오도록 함
  result = result.sort(() => Math.random() - 0.5);

  // 랜덤 임시 비밀번호 반환
  return result.join('');
}

// 비밀번호 찾기 처리
app.post("/forgot-pw", async (req, res) => {
  const userName = req.body["forgot-pw-user-name"];
  const userId = req.body["forgot-pw-user-id"];
  const userEmailPre = req.body["forgot-pw-user-email-pre"];
  const userEmailPost = req.body["forgot-pw-user-email-post"];
  let userEmail;

  if (userEmailPost) {
    userEmail = `${userEmailPre}${userEmailPost}`;
  } else {
    userEmail = userEmailPre;
  }

  const query = 'SELECT user_salt FROM user_info WHERE user_name = ? AND user_email = ? AND user_id = ?';

  try {
    const [results] = await db.query(query, [userName, userEmail, userId]);
    if (results.length > 0) {
      const userSalt = results[0].user_salt;
      const temporaryPassword = generateTemporaryPassword();

      // 임시 비밀번호 이메일로 발송
      const transporter = nodemailer.createTransport({
        service: 'naver',
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASSWORD
        }
      });
  
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: userEmail,
        subject: 'CO/N 회원 임시 비밀번호',
        text: `임시 비밀번호: ${temporaryPassword}`
      };

      await transporter.sendMail(mailOptions);

      // 임시 비밀번호, 기존 userSalt 조합으로 db 업데이트
      const newHashedPw = crypto.createHash("sha256").update(temporaryPassword + userSalt).digest("hex"); // 새로운 비밀번호 해시 생성

      const updateQuery = "UPDATE user_info SET user_pw = ? WHERE user_id = ?";
      await db.query(updateQuery, [newHashedPw, userId]);

      return res.redirect(`/forgot/forgot-pw.html?message=해당 이메일로 임시 비밀번호가 전송되었습니다.`);
    } else {
      return res.redirect(`/forgot/forgot-pw.html?message=일치하는 회원 정보가 존재하지 않습니다.`);
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 메인 페이지
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "home", "home.html"));
});

// 마이 페이지
app.get("/my-page", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "my-page", "my-page.html"));
});

// 회원 정보 변경 페이지
app.get("/my-info-change/my-info-change.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "my-info-change", "my-info-change.html"));
});

// 회원 정보 변경 처리
app.post("/my-info-change", async (req, res) => {
  const userNickname = req.body["user-nickname"];
  const userTel = req.body["user-tel"];
  const userAddress = req.body["user-address"];
  const userId = req.session.userId;

  // 업데이트할 필드와 값을 저장할 배열
  const updates = [];
  const values = [];

  // 입력된 값에 따라 업데이트할 필드를 동적으로 추가
  if (userNickname) {
    updates.push("user_nickname = ?");
    values.push(userNickname);
  }
  if (userTel) {
    updates.push("user_tel = ?");
    values.push(userTel);
  }
  if (userAddress) {
    updates.push("user_address = ?");
    values.push(userAddress);
  }

  // 업데이트할 필드가 없으면 바로 리턴
  if (updates.length === 0) {
    return res.redirect("/my-info-change/my-info-change.html?fault_message=변경할 내용이 없습니다.");
  }

  // WHERE 절에 user_id를 추가
  values.push(userId);

  const query = `
    UPDATE user_info
    SET ${updates.join(", ")}
    WHERE user_id = ?
  `;

  try {
    const [result] = await db.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.redirect("/my-info-change/my-info-change.html?fault_message=변경 사항이 없습니다.");
    }

    res.redirect('/my-page/my-page.html?message=변경이 완료되었습니다.');
  } catch (err) {
    console.error("DB 쿼리 오류: ", err);
    return res.redirect("/my-info-change/my-info-change.html?fault_message=변경에 실패했습니다.");
  }
});

// 비밀번호 변경 페이지
app.get("/my-info-change/change-pw.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "my-info-change", "change-pw.html"));
});

// 비밀번호 변경 처리
app.post("/change-pw", async (req, res) => {
  const currentPw = req.body["current-pw"];
  const newPw = req.body["new-pw"];
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("User not authenticated");
  }

  const query = "SELECT user_pw, user_salt FROM user_info WHERE user_id = ?";

  try {
    const [results] = await db.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).send("User not found");
    }

    const userPw = results[0].user_pw; // db에 저장되어 있는 pw
    const userSalt = results[0].user_salt; // db에 저장되어 있는 salt
    const hashedPw = crypto.createHash("sha256").update(currentPw + userSalt).digest("hex"); // 사용자가 입력한 현재 pw

    if (hashedPw === userPw) {
      // 현재 비밀번호가 일치할 경우
      const newHashedPw = crypto.createHash("sha256").update(newPw + userSalt).digest("hex"); // 새로운 비밀번호 해시 생성

      const updateQuery = "UPDATE user_info SET user_pw = ? WHERE user_id = ?";
      await db.query(updateQuery, [newHashedPw, userId]);

      return res.redirect('/my-page/my-page.html?message=변경이 완료되었습니다.');
    } else {
      // 현재 비밀번호가 일치하지 않는 경우
      return res.status(400).send("Current password is incorrect");
    }
  } catch (err) {
    console.error("Error processing request: ", err);
    return res.status(500).send("Server error");
  }
});

// 카테고리 페이지
app.get("/category", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "category", "category.html"));
});

// 카테고리 별 라우팅
app.get("/category/:categoryName", (req, res) => {
  const categoryName = req.params.categoryName;

  
  /* .js 파일 요청 차단
  req.params.categoryName을 콘솔에 출력해보면 두 개가 나오는데,
  .js 파일 요청이 함께 되면서 충돌 발생 */
  
  if (categoryName.endsWith(".js")) {
    return res.status(404).send("Not found");
  }

  const filePath = categoryName === "calculator"
    ? path.join(__dirname, "..", "src", "pages", "category", `${categoryName}.html`)
    : path.join(__dirname, "..", "src", "pages", "post", `${categoryName}.html`);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(err.status).end();
    }
  });
});

// 게시물 작성 엔드포인트
app.get('/post', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "board", "write.html"));
});

// 세션에서 유저 아이디 가져오는 api
app.get('/api/session/user-id', async (req, res) => {
  if (req.session.isLogined) {
    const query = 'SELECT user_id FROM user_info WHERE user_id = ?';
    try {
      const [result] = await db.query(query, [req.session.userId]);

      if (result.length > 0) {
        const userId = result[0].user_id;
        res.json({ userId: userId });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      console.error("Database query error: ", err);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(401).json({ message: '로그인 되어 있지 않습니다.' });
  }
});

// 게시물 작성 api
app.post('/api/post', async (req, res) => {
  try {
    const { subject, content, category, subCategory, departure, destination, loc, price, startDate, endDate, currentCapacity, maxCapacity, user_id } = req.body;
    
    // 필수 필드 검증
    if (category === "택시") {
      if (!subject || !content || !category || !departure || !destination || !price || !startDate || !endDate || !maxCapacity) {
        return res.status(400).json({ success: false, error: "모든 필드를 입력해 주세요." });
      }
    } else if (category === "택배" || category === "배달") {
      if (!subject || !content || !category || !subCategory || !loc || !price || !startDate || !endDate || !maxCapacity) {
        return res.status(400).json({ success: false, error: "모든 필드를 입력해 주세요." });
      }
    } else {
      return res.status(400).json({ success: false, error: "유효하지 않은 카테고리입니다." });
    }

    const query = "INSERT INTO post_list (title, content, category, sub_category, departure, destination, location, price, start_date, end_date, current_capacity, max_capacity, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      subject, 
      content, 
      category, 
      subCategory || null, 
      JSON.stringify(departure || null), 
      JSON.stringify(destination || null), 
      JSON.stringify(loc || null), 
      price, 
      startDate, 
      endDate, 
      currentCapacity, 
      maxCapacity, 
      user_id
    ];
    const result = await db.query(query, values);
    if (result[0] && result[0].insertId) {
      res.json({ success: true, postId: result[0].insertId });
    } else {
      res.json({ success: false, error: "게시물 작성 실패" });
    }
  } catch (error) {
    console.error("DB 오류: ", error);
    res.status(500).json({ success: false, error: "DB 처리 중 오류 발생" });
  }
});

// 게시물 목록 반환
app.get('/api/post', async (req, res) => {
  const { category, subCategory } = req.query;

  let query = `SELECT * FROM post_list WHERE category = ?`;
  let params = [category];

  if (subCategory !== '전체') {
    query += ' AND subCategory = ?';
    params.push(subCategory);
  }
  
  try {
    const [result] = await db.query(query, params);
    res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Database query error");
  }
});

app.get('/post/view', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "board", "view.html"));
});

app.get('/post/list', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "board", "list.html"));
});

// id에 맞는 게시물 데이터 반환
app.get('/api/post/view/:id', async (req, res) => {
  const postId = parseInt(req.params.id) + 1;
  const query = 'SELECT * FROM post_list WHERE post_index = ?';

  try {
    const [result] = await db.execute(query, [postId]);

    // 결과가 없을 경우 처리
    if (result.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ error: 'Database query error' });
  }
});

// 참여 버튼 클릭시 게시물의 current_capacity 업데이트하는 엔드포인트
app.post('/api/post/update-capacity/:id', async (req, res) => {
  const index = parseInt(req.params.id) + 1;
  const currentCapacity = req.body.current_capacity;

  console.log("current capacity: ", currentCapacity);

  const query = 'UPDATE post_list SET current_capacity = ? WHERE post_index = ?';

  try {
    const [result] = await db.query(query, [currentCapacity, index]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }

    res.status(200).json({ current_capacity: currentCapacity });
  } catch (error) {
    console.error('현재 인원 업데이트 중 오류 발생: ', error);
    res.status(500).json({ error: "현재 인원 업데이트 중 오류가 발생했습니다." });
  }
});

// 수정 페이지
app.get("/post/modify", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "board", "modify.html"));
});

// 게시물 수정 업데이트 엔드포인트
app.put("/api/post/modify/:id", async (req, res) => {
  const postId = parseInt(req.params.id + 1, 10);
  const { subject, content, category, subCategory, departure, destination, loc, price, startDate, endDate, currentCapacity, maxCapacity } = req.body;

  try {
    const query = `
      UPDATE post_list
      SET title = ?, content = ?, category = ?, sub_category = ?, 
      departure = ?, destination = ?, location = ?, price = ?, 
      start_date = ?, end_date = ?, current_capacity = ?, max_capacity = ?
      WHERE post_index = ?
    `;

    const values = [
      subject, 
      content, 
      category, 
      subCategory || null, 
      // JSON.stringify(departure || null), 
      // JSON.stringify(destination || null), 
      // JSON.stringify(loc || null), 
      departure || null,
      destination || null,
      loc || null,
      price, 
      startDate, 
      endDate, 
      currentCapacity, 
      parseInt(maxCapacity), 
    ];

    const [result] = await db.execute(query, [...values, postId]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "게시글이 수정되었습니다.", postId });
    } else {
      res.status(404).json({ success: false, message: "해당 게시글을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});


// 사용자의 알림 가져오는 api
app.get('/api/notifications', async (req, res) => {
  const userId = req.session.userId;
  try {
      const [notifications] = await db.query('SELECT * FROM notifications WHERE user_id = ?', [userId]);
      res.json(notifications); // 알림 목록 반환 
  } catch (error) {
      console.error('알림을 가져오지 못했습니다.:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 새로운 알림 추가 api
app.post('/api/notifications', async (req, res) => {
  const { message } = req.body;
  const userId = req.session.userId;

  try {
      await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message]);
      res.status(201).json({ message: '알림이 추가되었습니다.' });
  } catch (error) {
      console.error('알림을 추가하지 못했습니다.:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 채팅 메세지 가져오는 api
app.get('/api/chat/:chatId', async (req, res) => {
  const chatId = req.params.chatId;

  try {
      const [messages] = await db.query('SELECT * FROM chat_messages WHERE chat_id = ?', [chatId]);
      res.json(messages); // 채팅방 메세지 목록 반환
  } catch (error) {
      console.error('채팅 메시지를 가져오지 못했습니다.:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 메세지 전송 api
app.post('/api/chat/:chatId', async (req, res) => {
  const chatId = req.params.chatId;
  const { userId, message } = req.body;  // 사용자 id와 메세지 반환

  try {
      await db.query('INSERT INTO chat_messages (chat_id, user_id, message) VALUES (?, ?, ?)', [chatId, userId, message]);
      res.status(201).json({ message: '메시지가 전송되었습니다.' });
  } catch (error) {
      console.error('메시지를 전송하지 못했습니다.:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 세션에서 유저 정보 가져오기
app.get('/api/session/user-info', async (req, res) => {
  if (req.session.isLogined) {
    // 로그인 상태라면
    const query = 'SELECT user_nickname, user_address, user_point FROM user_info WHERE user_id = ?';

    try {
      const [result] = await db.query(query, [req.session.userId]);

      if (result.length > 0) {
        // result[0]은 user_info 테이블에서 user_id에 대응되는 데이터 row
        const userNickname = result[0].user_nickname; 
        const userAddress = result[0].user_address.split(" ")[1]; // 경기 수원시 ~~ 값을 -> 수원시만 할당되도록
        const userPoint = result[0].user_point;

        // JSON 형태로 응답
        res.json({
          userNickname,
          userAddress,
          userPoint
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      console.error("Database query error: ", err);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(401).json({ message: "User not logged in" });
  }
});

app.listen(port);