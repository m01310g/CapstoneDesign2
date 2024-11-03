const dotenv = require('dotenv')
dotenv.config();
const path = require('path');
const crypto = require('crypto');
const db = require('../config/db');
const nodemailer = require('nodemailer');

// 아이디 찾기 페이지
exports.showForgotIdPage = (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/forgot/forgot-id.html"));
};

// 아이디 찾기 처리
exports.forgotId = async (req, res) => {
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
};

// 비밀번호 찾기 페이지
exports.showForgotPwPage = (req, res) => {
    res.sendFile(path.join(__dirname, "../../src/pages/forgot/forgot-pw.html"));
};

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
};
  
  // 비밀번호 찾기 처리
exports.forgotPw = async (req, res) => {
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

        return res.redirect(`/forgot-pw?message=해당 이메일로 임시 비밀번호가 전송되었습니다.`);
        } else {
        return res.redirect(`/forgot-pw?message=일치하는 회원 정보가 존재하지 않습니다.`);
        }
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
};