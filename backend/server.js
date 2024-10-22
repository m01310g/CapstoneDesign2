const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const cors = require("cors"); //
const app = express();
const port = 3000;

const mysql = require('mysql'); //
const db = mysql.createConnection({ //
  host     : 'localhost',
  user     : 'root',
  password : 'Capstone2@',
  database : 'co_n'
});
db.connect();

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
app.post("/login", (req, res) => {
  const loginId = req.body["login-id"];
  const loginPw = req.body["login-pw"];

  const query = "SELECT * FROM user_info WHERE user_id = ? AND user_pw = ?";

  if (loginId && loginPw) {
    db.query(query, [loginId, loginPw], (err, result) => {
      if (err) {
        // 로그인 실패 시
        res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');
      }
      if (result.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
        req.session.isLogined = true; // 세션 정보 갱신: 로그인 상태
        req.session.userId = loginId; // 세션 정보 갱신: 유저 아이디
        req.session.save(() => {
          // 로그인 성공 시 메인 페이지로 redirect
          res.redirect("/home/home.html");
        });
      } else {              
        res.redirect('/?fault_message=로그인 정보가 일치하지 않습니다.');  
      }
    })
  }
});

// 회원가입 페이지
app.get("/sign-up/sign-up.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "pages", "sign-up", "sign-up.html"));
});

// 회원가입 처리
app.post("/sign-up/user-info", (req, res) => {
  const userId = req.body["user-id"];
  const userPw = req.body["user-pw"];
  const userName = req.body["user-name"];
  const userNickname = req.body["user-nickname"];
  const userTel = req.body["user-tel"];
  const userEmail = `${req.body["user-email"][0]}${req.body["user-email"][1]}`;
  const userAddress = req.body["user-address"];

  const query = "INSERT INTO user_info (user_id, user_pw, user_name, user_nickname, user_tel, user_email, user_address) VALUES (?, ?, ?, ?, ?, ?, ?)";
  
  db.query(query, [userId, userPw, userName, userNickname, userTel, userEmail, userAddress], (err, result) => {
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

app.listen(port);