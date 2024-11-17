const db = require('../config/db');
const axios = require('axios');

// 현재 활성화 된 채팅방 관리
let activeChats = {};  

// 채팅방 생성 함수 (예시)
const createChatRoom = async (userId, roomName) => {
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

exports.createChatRoom = async (req, res) => {
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
};

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


// 메시지 전송 api
exports.sendMessage = async (req, res) => {
    const { chatId, userId, message } = req.body; 

    try {
        // 채팅 메시지 저장
        const [result] = await db.query('INSERT INTO chat_messages (chat_id, user_id, message, sent_at) VALUES (?, ?, ?, NOW())', [chatId, userId, message]);

        // 메시지가 정상적으로 저장되었으면 응답
        if (result.affectedRows > 0) {
            const io = req.app.get('socketio');
            io.to(chatId).emit('newMessage', {userId, message});
            res.status(200).json({ message: '메시지가 전송되었습니다.' });
        } else {
            res.status(400).json({ message: '메시지 전송 실패' });
        }
    } catch (error) {
        console.error('메시지 전송 오류:', error);
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
    const userId = req.params.userId;

    const checkQuery = "SELECT * FROM participations WHERE post_id = ? AND user_id = ?";

    try {
        const [existingParticipation] = await db.query(checkQuery, [postId, userId]);
        console.log(existingParticipation);
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

// exports.createChatRoom = async (req, res) => {
//     const { roomName } = req.body;

//     if (!roomName) {
//         return res.status(400).json({ success: false, message: '채팅방 이름이 필요합니다.' });
//     }

//     try {
//         // Insert new chat room into the database
//         const [result] = await db.query(
//             'INSERT INTO chat_rooms (room_name, created_by, participant_ids) VALUES (?, ?, ?)',
//             [roomName, 'system', '', JSON.stringify([])] // Assume 'system' as the creator for now
//         );

//         if (result.affectedRows > 0) {
//             const newRoomId = result.insertId;
//             res.json({ success: true, room_id: newRoomId });
//         } else {
//             res.status(500).json({ success: false, message: '채팅방 생성 실패' });
//         }
//     } catch (error) {
//         console.error('채팅방 생성 오류:', error);
//         res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
//     }
// };

// 채팅방 목록 가져오기
exports.getChatRooms = async (req, res) => {
    try {
        // DB에서 채팅방 목록 가져오기
        const [chatRooms] = await db.query('SELECT id, room_name, participant_ids, last_activity FROM chat_rooms');

        // 채팅방 목록 응답
        res.json(chatRooms);
    } catch (error) {
        console.error('채팅방 목록을 가져오지 못했습니다.', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};



// 채팅방 참여
exports.joinChatRoom = async (req, res) => {
    const { chatId, userId } = req.body; // 채팅방 ID와 사용자 ID 받아오기

    try {
        // 채팅방 참여자 목록에 사용자 ID 추가
        const [result] = await db.query('UPDATE chat_rooms SET participant_ids = JSON_ARRAY_APPEND(participant_ids, "$", ?) WHERE id = ?', 
        [userId, chatId]);

        // 성공적으로 업데이트되면
        if (result.affectedRows > 0) {
            res.status(200).json({ message: '채팅방에 참가하였습니다.' });
        } else {
            res.status(400).json({ message: '채팅방 참가 실패' });
        }
    } catch (error) {
        console.error('채팅방 참가 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
