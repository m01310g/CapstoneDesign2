const db = require('../config/db');

// 알림 목록 가져오기
exports.getNotification = async (req, res) => {
    const userId = req.session.userId;
    try {
        const [notifications] = await db.query('SELECT * FROM notifications WHERE user_id = ?', [userId]);
        res.json(notifications); // 알림 목록 반환 
    } catch (error) {
        console.error('알림을 가져오지 못했습니다.:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 알림 추가하기
exports.addNotification = async (req, res) => {
    const { chatRoomId, message, type, senderId } = req.body; // 요청 데이터
    const userId = req.session.userId; // 알림 대상 사용자

    try {
        await db.query(
            `INSERT INTO notifications (user_id, chat_room_id, type, message, sender_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, chatRoomId, type, message, senderId]
        );

        // 알림을 클라이언트에 실시간으로 전송
        req.io.to(userId).emit('new-notification', {
            chatRoomId,
            type,
            message,
            senderId,
            createdAt: new Date(),
        });

        res.status(201).json({ message: '알림이 추가되었습니다.' });
    } catch (error) {
        console.error('알림 추가 오류:', error);
        res.status(500).json({ message: '알림 추가 중 오류 발생.' });
    }
};

exports.markNotificationsAsRead = async (req, res) => {
    const userId = req.session.userId;

    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        res.status(200).json({ message: '알림이 읽음 처리되었습니다.' });
    } catch (error) {
        console.error('알림 읽음 처리 오류:', error);
        res.status(500).json({ message: '알림 읽음 처리 중 오류 발생.' });
    }
};