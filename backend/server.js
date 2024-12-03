const dotenv = require("dotenv");
dotenv.config();

const db = require('./config/db');
const express = require("express");
const http = require("http");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const cors = require("cors");
const axios = require("axios"); // Axios 추가
const app = express();
const socketSetup = require("./socket");

const server = http.createServer(app);
const port = 3000;

const io = socketSetup(server);
app.set("socketio", io)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
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
  store: new FileStore({
    path: './sessions',
    retries: 2,
    ttl: 3600,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 3, // 3시간 유지
    secure: false, // true: https에서만 동작
    httpOnly: true
  }
}));

app.use(express.static(path.join(__dirname, "public")));


// body parser: 아래 코드 2줄 없으면 form 제출 시 오류 발생
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, "..", "src")));
app.use(express.static(path.join(__dirname, "..", "backend")));

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

server.listen(port, () => {
  console.log("http://localhost:3000");
});