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