const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const cors = require("cors");
const axios = require("axios"); // Axios 추가
const app = express();
const port = 3000;

app.use(cors());

// .env의 kakao map api key 가져오기
app.get('/api/kakao-map-key', async (req, res) => {
  try {
    if (process.env.KAKAO_MAP_API_KEY) {
      res.json({ KAKAO_MAP_API_KEY: process.env.KAKAO_MAP_API_KEY });
    } else {
      res.status(404).json({ message: "API key not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
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

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, "..", "src")));
app.use(express.static(path.join(__dirname, "..", "src", "pages"))); // html파일에 연결된 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "login"))); // login 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "forgot"))); // forgot 페이지 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "board"))); // 게시물 관련 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "post"))); // 게시물 관련 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "notification"))); // 알림 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "chatting"))); // 채팅 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "category"))); // 카테고리 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "my-page"))); // 마이 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "point-charge")));
app.use(express.static(path.join(__dirname, "..", "src", "pages", "point-exchange"))); 
app.use(express.static(path.join(__dirname, "..", "src", "pages", "sign-up"))); // 회원가입 페이지의 js로드 안되는 문제 해결
app.use(express.static(path.join(__dirname, "..", "src", "pages", "chatting")));

// 라우터 설정
const authRouter = require('./routes/auth');
const forgotRouter = require('./routes/forgot');
const postRouter = require('./routes/post');
const pageRouter = require('./routes/pageRouter');
const notificationRouter = require('./routes/notification');
const chatRouter = require('./routes/chat');
const pointRouter = require('./routes/point');

app.use('/', pageRouter);
app.use('/', authRouter);
app.use('/', forgotRouter);
app.use('/', postRouter);
app.use('/', notificationRouter);
app.use('/', chatRouter);
app.use('/', pointRouter);

/*
assets/img에 있는 이미지 html에서 사용 시
<img class="logo" src="../../../assets/img/logo.jpg" />
<img class="logo" src="/img/logo.jpg" />
2번째 태그와 같이 사용할 것
*/
app.use(express.static(path.join(__dirname, "..", "assets")));

app.listen(port, () => {
  console.log("http://localhost:3000");
});