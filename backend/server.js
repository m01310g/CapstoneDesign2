const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const cors = require("cors");
const app = express();
const crypto = require("crypto");
const port = 3000;

const mysql = require('mysql2/promise');
// const db = await mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'Capstone2@',
//   database : 'co_n'
// });
async function initializeDatabase() {
  db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Capstone2@',
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
  secret: "1868cc469dc47695069aa7c6324f41e4eef1e34b1afa9a", // 키값 숨길 것
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
app.use(express.static(path.join(__dirname, "..", "src")));
app.use(express.static(path.join(__dirname, "..", "src", "pages"))); // html파일에 연결된 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "login"))); // login페이지의 js로드 안되는 문제 해결


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
// app.post("/login", (req, res) => {
//   const loginId = req.body["login-id"];
//   const loginPw = req.body["login-pw"];

//   const query = "SELECT user_pw, user_salt FROM user_info WHERE user_id = ?";

//   if (loginId && loginPw) {
//     db.query(query, [loginId], (err, result) => {
//       if (err) {
//         // 로그인 실패 시
//         res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');
//       }
//       if (result.length > 0) {       // db에서의 반환값이 있으면 salt와 해쉬
//         const user = result[0];
//         const userSalt = user.user_salt;
//         const hashedPw = crypto.createHash("sha256").update(loginPw + userSalt).digest("hex");
//           if (hashedPw === user.user_pw) {
//             req.session.isLogined = true; // 세션 정보 갱신: 로그인 상태
//             req.session.userId = loginId; // 세션 정보 갱신: 유저 아이디
//             req.session.save(() => {
//               // 로그인 성공 시 메인 페이지로 redirect
//               res.redirect("/home/home.html");
//             });
//           } else {              
//             res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');  
//           }
//       } else {              
//         res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');  
//       }
//     });
//   } else {              
//     res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');  
//   }
// });

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
app.post("/sign-up/user-id-availability", (req, res) => {
  const userId = req.body["user-id"];
  const query = "SELECT COUNT(*) AS count FROM user_info WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send("Server error");
    }

    const isAvailable = results[0].count === 0;
    res.json({ available: isAvailable });
  });
});

// 회원가입 처리
app.post("/sign-up/user-info", (req, res) => {
  const userId = req.body["user-id"];
  const userName = req.body["user-name"];
  const userNickname = req.body["user-nickname"];
  const userTel = req.body["user-tel"];
  const userAddress = req.body["user-address"];
  const userSalt = crypto.randomBytes(16).toString('base64');
  const userPw = crypto.createHash("sha256").update(req.body["user-pw"] + userSalt).digest("hex");
  const userEmailPre = req.body["user-email-pre"];
  const userEmailPost = req.body["user-email-post"];
  let userEmail;
  // 아이디, 비밀번호 찾기도 input, select 부분 pre, post로 잘라서 아래 코드로 판별 후 userEmail 완성 후 query

  if (userEmailPost) {
    userEmail = `${userEmailPre}${userEmailPost}`;
  } else {
    userEmail = userEmailPre;
  }

  const query = "INSERT INTO user_info (user_id, user_pw, user_name, user_nickname, user_tel, user_email, user_address, user_salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  
  db.query(query, [userId, userPw, userName, userNickname, userTel, userEmail, userAddress, userSalt], (err, result) => {
    if (err) {
      return res.redirect(`/sign-up/sign-up.html?error=${encodeURIComponent('회원가입에 실패했습니다. 다시 시도해주세요.')}`);
    }

    res.redirect('/?message=회원가입이 완료되었습니다!'); // 회원 가입 완료 시 로그인 페이지로
  });
});

// 아이디 찾기 페이지
app.get("/forgot/forgot-id.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "forgot", "forgot-id.html"));
});

// 비밀번호 찾기 페이지
app.get("/forgot/forgot-pw.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "forgot", "forgot-pw.html"));
});

// 메인 페이지
app.get("/home/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "home", "home.html"));
});

// 마이 페이지
app.get("/my-page/my-page.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "my-page", "my-page.html"));
});

// 회원 정보 변경 페이지
app.get("/my-info-change/my-info-change.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "my-info-change", "my-info-change.html"));
});

// 회원 정보 변경 처리
app.post("/my-info-change", (req, res) => {
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

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("DB 쿼리 오류: ", err);
      return res.redirect("/my-info-change/my-info-change.html?fault_message=변경에 실패했습니다.");
    }

    if (result.affectedRows === 0) {
      return res.redirect("/my-info-change/my-info-change.html?fault_message=변경 사항이 없습니다.");
    }

    res.redirect('/my-page/my-page.html?message=변경이 완료되었습니다.');
  });
});

// 비밀번호 변경 페이지
app.get("/my-info-change/change-pw.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "my-info-change", "change-pw.html"));
});

// 비밀번호 변경 처리
app.post("/change-pw", (req, res) => {
  const currentPw = req.body["current-pw"];
  const newPw = req.body["new-pw"];
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("User not authenticated");
  }

  const query = "SELECT user_pw, user_salt FROM user_info WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data: ", err);
      return res.status(500).send("Server error");
    }

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
      db.query(updateQuery, [newHashedPw, userId], (updateErr) => {
        if (updateErr) {
          console.error("Error updating password: ", updateErr);
          return res.status(500).send("Server error during password update");
        }
        return res.redirect('/my-page/my-page.html?message=변경이 완료되었습니다.');
      });
    } else {
      // 현재 비밀번호가 일치하지 않는 경우
      return res.status(400).send("Current password is incorrect");
    }
  });
});

// 카테고리 페이지
app.get("/category/category.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "category", "category.html"));
});

// 세션에서 유저 정보 가져오기
app.get('/api/session/user-info', (req, res) => {
  if (req.session.isLogined) {
    // 로그인 상태라면
    // 세션 데이터에서 필요한 값을 가져오기
    const query = 'SELECT user_nickname, user_address, user_point FROM user_info WHERE user_id = ?';
    db.query(query, [req.session.userId], (err, result) => {
      if (result.length > 0) {
        // result[0]은 user_info 테이블에서 user_id에 대응되는 데이터 row
        // user_nickname, user_address, user_point는 테이블의 포인트 속성명
        const userNickname = result[0].user_nickname; 
        const userAddress = (result[0].user_address).split(" ")[1]; // 경기 수원시 ~~ 값을 -> 수원시만 할당되도록
        const userPoint = result[0].user_point;

        // JSON 형태로 응답
        res.json({
          userNickname: userNickname,
          userAddress: userAddress,
          userPoint: userPoint
        });
      }
    });
  }
});

app.listen(port);