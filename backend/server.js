const dotenv = require("dotenv");
dotenv.config();

const db = require('./config/db');
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const cors = require("cors");
const axios = require("axios"); // Axios 추가
const app = express();

const server = http.createServer(app);
const io = socketIo(server);
app.set('socketio', io);
const port = 3000;

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

// 현재 활성화 된 채팅방 관리
let activeChats = {};  


app.post('/create-chat-room', async (req, res) => {
  const userId = req.session.userId; // 세션에서 사용자 ID 가져오기
  const { roomName } = req.body; // 

  try {
    // 사용자 ID나 채팅방 이름이 없으면 에러 응답
    if (!userId || !roomName) {
      return res.status(400).json({ error: 'User ID and room name are required' });
    }

    // 채팅방 생성 함수 호출
    const chatRoom = await createChatRoom(userId, roomName); 

    // 생성된 채팅방 정보를 클라이언트에 응답
    res.status(201).json(chatRoom);
  } catch (error) {
    // 오류가 발생하면 에러 메시지 반환
    res.status(500).json({ error: error.message });
  }
});

// 채팅방 생성 함수 (예시)
async function createChatRoom(userId, roomName) {
  if (!roomName) {
    throw new Error('Room name is required');
  }

  // DB에 채팅방을 삽입하는 코드
  const result = await db.query('INSERT INTO chat_rooms (userId, roomName) VALUES (?, ?)', [userId, roomName]);

  if (!result) {
    throw new Error('Failed to create chat room');
  }

  return { userId, roomName, createdAt: new Date() }; // 채팅방 생성 후 반환
}


io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // 채팅방 입장
  socket.on("joiRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined chat: ${roomId}`);
  });

  // 채팅 메시지 전송
  socket.on("sendMessage", (data) => {
    // 해당 채팅방에 메시지 전송
    io.to(data.roomId).emit("message", {
      user: 'User',
      message: data.message
    }); 
  });

  // 채팅방 나갈 때
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

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
app.use(express.static(path.join(__dirname, "..", "src", "pages", "my-info-change"))); // 회원 정보 및 비밀번호 변경 페이지의 js로드 안되는 문제 해결


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