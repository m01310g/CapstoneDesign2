const db = require('../config/db');

// 채팅 메세지 가져오는 api
exports.getChatMessage = async (req, res) => {
    const chatId = req.params.chatId;
  
    try {
        const [messages] = await db.query('SELECT * FROM chat_messages WHERE chat_id = ?', [chatId]);
        res.json(messages); // 채팅방 메세지 목록 반환
    } catch (error) {
        console.error('채팅 메시지를 가져오지 못했습니다.:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 메세지 전송 api
exports.sendMessage = async (req, res) => {
    const chatId = req.params.chatId;
    const { userId, message } = req.body;  // 사용자 id와 메세지 반환
  
    try {
        await db.query('INSERT INTO chat_messages (chat_id, user_id, message) VALUES (?, ?, ?)', [chatId, userId, message]);
        res.status(201).json({ message: '메시지가 전송되었습니다.' });
    } catch (error) {
        console.error('메시지를 전송하지 못했습니다.:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

exports.checkParticipation = async (req, res) => {
    const postId = parseInt(req.params.postId) + 1;
    const { userId } = req.query;
    const query = "SELECT * FROM participations WHERE post_id = ? AND user_id = ?"
    try {
        const [rows] = await db.query(query, [postId, userId]);
        if (rows.length > 0) {
            return res.json({ participated: true });
        } else {
            return res.json({ participated: false });
        }
    } catch (error) {
        console.error("Error checking pariticipation: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updateParticipateStatus = async (req, res) => {
    const postId = parseInt(req.params.postId) + 1;
    console.log(postId);
    const userId = req.params.userId;

    const checkQuery = "SELECT * FROM participations WHERE post_id = ? AND user_id = ?";

    try {
        const [existingParticipation] = await db.query(checkQuery, [postId, userId])
        if (existingParticipation.length > 0) {
            return res.status(400).json({ participated: true });
        }

        const insertQuery = "INSERT INTO participations (user_id, post_id) VALUES (?, ?)";
        const [result] = await db.query(insertQuery, [userId, postId]);
        if (result.affectedRows > 0) {
            res.status(201).send("Particiption added");
        } else {
            res.status(400).send("Failed to add participation");
        }
    } catch (error) {
        console.error("Error adding participation: ", error);
        res.status(500).send("Internal Server Error");
    }
};