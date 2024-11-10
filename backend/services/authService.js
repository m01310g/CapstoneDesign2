const crypto = require('crypto');
const db = require('../config/db');
const nodemailer = require('nodemailer');

// 로그인 처리
exports.login = async (req, res) => {
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
            res.redirect("/home");
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
};

// 로그아웃 처리
exports.logout = (req, res) => {
  // 세션 삭제
  req.session.destroy((err) => {
    // 로그아웃 시 로그인 페이지로 이동
    res.redirect("/");
  });
};

// 회원가입 처리
exports.signUp = async (req, res) => {
  const userId = req.body["user-id"];
  const userName = req.body["user-name"];
  const userNickname = req.body["user-nickname"];
  const userTel = req.body["user-tel"];
  // const userAddress = req.body["user-address"];
  const userSalt = crypto.randomBytes(16).toString('base64');
  const userPw = crypto.createHash("sha256").update(req.body["user-pw"] + userSalt).digest("hex");
  const userEmailPre = req.body["user-email-pre"];
  const userEmailPost = req.body["user-email-post"];
  const checkAuthn = req.body["email-authn"];
  let userEmail;
  // const location = JSON.stringify({ lat, lng });

  if (authnCode !== checkAuthn) {
    return res.redirect(`/sign-up?error=${encodeURIComponent('인증번호 불일치로 회원가입에 실패했습니다.')}`);
  }

  if (userEmailPost) {
    userEmail = `${userEmailPre}${userEmailPost}`;
  } else {
    userEmail = userEmailPre;
  }

  const query = "INSERT INTO user_info (user_id, user_pw, user_name, user_nickname, user_tel, user_email, user_salt) VALUES (?, ?, ?, ?, ?, ?, ?)";

  try {
    await db.query(query, [userId, userPw, userName, userNickname, userTel, userEmail, userSalt]);
    res.redirect('/?message=회원가입이 완료되었습니다!'); // 회원 가입 완료 시 로그인 페이지로
  } catch (err) {
    console.error("회원가입 오류:", err);
    return res.redirect(`/sign-up?error=${encodeURIComponent('회원가입에 실패했습니다. 다시 시도해주세요.')}`);
  }
};

let authnCode = "";
function generateAuthnCode() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 인증번호: 1000 이상 9999 이하의 숫자 생성
}

exports.emailAuth = async (req, res) => {
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
};

exports.checkId = async (req, res) => {
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
};
  
// user nickname 중복 검사
exports.checkNickname = async (req, res) => {
  const userNickname = req.body["user-nickname"];
  const query = "SELECT COUNT(*) AS count FROM user_info WHERE user_nickname = ?";

  try {
      const [results] = await db.query(query, [userNickname]);
      const isAvailable = results[0].count === 0;
      res.json({ available: isAvailable });
  } catch (err) {
      console.error("Database error:", err);
      res.status(500).send("Server error");
  }
};

// 회원 정보 변경 처리
exports.myInfoChange = async (req, res) => {
  const userNickname = req.body["user-nickname"];
  const userTel = req.body["user-tel"];
  // const userAddress = req.body["user-address"];
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

  // 업데이트할 필드가 없으면 바로 리턴
  if (updates.length === 0) {
    return res.redirect("/my-info-change?fault_message=변경할 내용이 없습니다.");
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
      return res.redirect("/my-info-change?fault_message=변경 사항이 없습니다.");
    }

    res.redirect('/my-page?message=변경이 완료되었습니다.');
  } catch (err) {
    console.error("DB 쿼리 오류: ", err);
    return res.redirect("/my-info-change?fault_message=변경에 실패했습니다.");
  }
};

// 비밀번호 변경 처리
exports.changePw = async (req, res) => {
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

      return res.redirect('/my-page?message=변경이 완료되었습니다.');
    } else {
      // 현재 비밀번호가 일치하지 않는 경우
      return res.redirect('/change-pw?message=현재 비밀번호와 일치하지 않습니다.');
    }
  } catch (err) {
    console.error("Error processing request: ", err);
    return res.status(500).send("Server error");
  }
};

// 세션에서 유저 아이디 가져오는 api
exports.getSessionUserId = async (req, res) => {
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
};

// 세션에서 유저 정보 가져오기
exports.getSessionUserInfo = async (req, res) => {
  if (req.session.isLogined) {
    // 로그인 상태라면
    const query = 'SELECT user_nickname, user_point, user_penalty FROM user_info WHERE user_id = ?';

    try {
      const [result] = await db.query(query, [req.session.userId]);

      if (result.length > 0) {
        // result[0]은 user_info 테이블에서 user_id에 대응되는 데이터 row
        const userNickname = result[0].user_nickname; 
        const userPoint = result[0].user_point;
        const userPenalty = result[0].user_penalty;

        // JSON 형태로 응답
        res.json({
          userNickname,
          userPoint,
          userPenalty
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
};