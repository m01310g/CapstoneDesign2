const db = require('../config/db');

// 사용자의 알림 가져오는 api
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

// 새로운 알림 추가 api
exports.addNotification = async (req, res) => {
    const { message } = req.body;
    const userId = req.session.userId;
  
    try {
        await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message]);
        res.status(201).json({ message: '알림이 추가되었습니다.' });
    } catch (error) {
        console.error('알림을 추가하지 못했습니다.:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};