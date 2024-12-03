const db = require('../config/db');

exports.deleteNotification = async (req, res) => {
    const notificationId = req.params.id;

    try {
        // 데이터베이스에서 알림 삭제
        const [result] = await db.query('DELETE FROM notification WHERE id = ?', [notificationId]);
        
        if (result.affectedRows > 0) {
            // 알림 삭제 성공
            res.status(200).json({ message: 'Notification deleted' });
        } else {
            // 알림을 찾을 수 없음
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        // 오류 처리
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 알림 개수 API
exports.getNotificationCount = async (req, res) => {
    const userId = req.query.userId; // 쿼리 파라미터로 userId 받기

    try {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM notification WHERE user_id = ? AND is_read = 0', [userId]);
        
        // 결과 반환
        res.status(200).json({ count: rows[0].count });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// 알림 목록 가져오기
exports.getNotification = async (req, res) => {
    const userId = req.query.userId;
    try {
        const [notifications] = await db.query(
            // `SELECT distinct n.id, n.user_id, n.chat_room_id, n.type, n.message, n.sender_id, n.created_at, n.is_read
            // FROM notification n
            // JOIN participations p ON n.chat_room_id = p.post_id
            // WHERE n.user_id = ?
            // AND n.created_at > p.participated_at
            // ORDER BY n.created_at DESC;`,
            'SELECT * FROM notification WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
      
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};


// 알림 추가하기
exports.addNotification = async (req, res) => {
    const { chatRoomId, message, type, senderId } = req.body;
    const userId = req.user.userId; 

    try {
        await db.query(
            `INSERT INTO notification (user_id, chat_room_id, type, message, sender_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, chatRoomId, type, message, senderId]
        );

        // 알림을 클라이언트에 실시간으로 전송
        req.io.to(userId).emit('new-notification', {
            type,
            chatRoomId,
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
    const userId = req.user.userId;

    try {
        await db.query('UPDATE notification SET is_read = 1 WHERE user_id = ?', [userId]);
        res.status(200).json({ message: '알림이 읽음 처리되었습니다.' });
    } catch (error) {
        console.error('알림 읽음 처리 오류:', error);
        res.status(500).json({ message: '알림 읽음 처리 중 오류 발생.' });
    }
};

exports.notifications = async (req, res) => {
    const userId = req.query.userId; // 사용자 ID
    const notifications = await db.query(
        'SELECT * FROM notification WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
    );
    res.json(notifications);
};

exports.countNotifications = async (req, res) => {
    const userId = req.query.userId; // 사용자 ID
    const [countResult] = await db.query(
        'SELECT COUNT(*) AS count FROM notification WHERE user_id = ?',
        [userId]
    );
    res.json({ count: countResult[0].count });
};
