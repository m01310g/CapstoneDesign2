const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../config/db');

// 로그인 페이지
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/login/login.html"));
});

// 회원 가입 페이지
router.get("/sign-up", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/sign-up/sign-up.html"));
});

// 회원 정보 변경 페이지
router.get("/my-info-change", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/my-info-change/my-info-change.html"));
});

// 메인 페이지
router.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/home/home.html"));
});

// 마이 페이지
router.get("/my-page", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/my-page/my-page.html"));
});

// 비밀번호 변경 페이지
router.get("/change-pw", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/my-info-change/change-pw.html"));
});

// 카테고리 페이지
router.get("/category", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/category/category.html"));
});

// 포인트 충전
router.get("/point-charge", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/point-charge/point-charge.html"));
});


// 포인트 환전
router.get("/point-exchange", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/point-exchange/point-exchange.html"));
});

// 충전 성공
router.get("/point-charge/success", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/point-charge/charge-success.html"));
});

// 환전 성공
router.get("/point-exchange/success", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/point-exchange/exchange-success.html"));
});



// 카테고리 별 라우팅
router.get("/category/:categoryName", (req, res) => {
    const categoryName = req.params.categoryName;


    /* .js 파일 요청 차단
    req.params.categoryName을 콘솔에 출력해보면 두 개가 나오는데,
    .js 파일 요청이 함께 되면서 충돌 발생 */

    if (categoryName.endsWith(".js")) {
        return res.status(404).send("Not found");
    }

    const filePath = categoryName === "calculator"
        ? path.join(__dirname, `../../src/pages/category/${categoryName}.html`)
        : path.join(__dirname, `../../src/pages/post/${categoryName}.html`);

    res.sendFile(filePath, (err) => {
        if (err) {
        console.error(err);
        res.status(err.status).end();
        }
    });
});

// 게시물 작성 엔드포인트
router.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/board/write.html"));
});

router.get('/post/view', (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/board/view.html"));
  });
  
router.get('/post/list', (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/board/list.html"));
});

// 수정 페이지
router.get("/post/modify", (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/board/modify.html"));
});

// 알림 페이지
router.get('/notification', (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/notification/Notification_page.html"));
});

// 채팅 페이지
router.get('/chat/main', (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/chatting/Chat_main.html"));
})

router.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/chatting/Chat_in.html"));
});

module.exports = router;