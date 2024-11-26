const socketIo = require("socket.io");
const roomTradeStatus = {}; // { roomId: true/false }
const db = require('./config/db');

const updateTradestatus = async (roomId, status) => {
    try {
        await db.query(
            'UPDATE chat_rooms SET is_trade_active = ? WHERE post_index = ?',
            [status, roomId]
        );
    } catch (error) {
        console.error('거래 상태 업데이트 중 오류: ', error);
    }
};

module.exports = (server) => {
    const io = socketIo(server);
    const userSocketMap = {}; // { userId: socketId }

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id);
        
        // 채팅방 입장
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`User joined chat: ${roomId}`);
        });
        
        socket.on("registerUser", ({ userId }) => {
            // 유저 ID와 소켓 ID 매핑
            userSocketMap[userId] = socket.id;
            console.log(`User ${userId} registered with socket ID ${socket.id}`);
        });

        // 채팅 메시지 전송
        socket.on("sendMessage", (data, callback) => {
            try {
                // 받은 데이터
                const messageData = {
                    roomId: data.chat_room_id,
                    userId: data.sender_id,
                    userNickname: data.sender_nickname,
                    message: data.message
                };

                // 해당 채팅방에 메시지 전송
                io.to(data.chat_room_id).emit("message", messageData); 
                console.log('받은 메시지: ', messageData);
                callback({ success: true });
            } catch (error) {
                console.error('메시지 처리 중 오류: ', error);
                callback({ success: false, error: '서버 오류' });
            }
            // io.to(data.roomId).emit('receiveMessage', data);
        });
        
        // 채팅방 나갈 때
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });

        // 채팅방 퇴장
        socket.on("leaveRoom", ({ roomId, userNickname }) => {
            io.to(roomId).emit("userLeft", {message: `${userNickname}님이 채팅방을 나갔습니다.`});

            socket.leave(roomId);
        });

        // 거래 시작 이벤트 처리
        socket.on("tradeStarted", ({ roomId }) => {
            updateTradestatus(roomId, true); // 거래 시작 상태 저장
            io.to(roomId).emit("tradeStarted", { roomId });
            console.log(`거래 시작 이벤트 전송: roomId ${roomId}`);
        });

        // 거래 상태 요청
        socket.on("getTradeStatus",  async ({ roomId }, callback) => {
            try {
                const [result] = await db.query(
                    'SELECT is_trade_active FROM chat_rooms WHERE post_index = ?',
                    [roomId]
                );
                const isTradeStarted = result[0]?.is_trade_active;
                callback(isTradeStarted);
            } catch (error) {
                console.error('거래 상태 요청 처리 중 오류: ', error);
                callback(false);
            }
        });

        // 메세지 전송 시 알림
        socket.on('send-message', async ({ chatRoomId, senderId, senderNickname, message, receiverId }) => {
            try {
                // 메시지 전송
                await db.query(
                    `INSERT INTO chat_message (chat_room_id, sender_id, sender_nickname, message, message_type) 
                     VALUES (?, ?, ?, ?, 'user')`,
                    [chatRoomId, senderId, senderNickname, message]
                );
        
                // 알림 생성
                await db.query(
                    `INSERT INTO notifications (user_id, chat_room_id, type, message, sender_id) 
                     VALUES (?, ?, 'message', ?, ?)`,
                    [receiverId, chatRoomId, `${senderNickname}: ${message}`, senderId]
                );
        
                // 알림 전달
                io.to(receiverId).emit('new-notification', {
                    chatRoomId,
                    type: 'message',
                    message: `${senderNickname}: ${message}`,
                    senderId,
                    createdAt: new Date(),
                });
            } catch (error) {
                console.error('메시지 전송 중 오류:', error);
            }
        });
        
        // 사용자 입장 시 알림
        socket.on('join-room', async ({ chatRoomId, userId, userNickname }) => {
            try {
                // 알림 생성
                await db.query(
                    `INSERT INTO notifications (user_id, chat_room_id, type, message, sender_id) 
                     VALUES (?, ?, 'entry', ?, ?)`,
                    [userId, chatRoomId, `${userNickname}님이 채팅방에 입장했습니다.`, userId]
                );
        
                // 알림 전달
                io.to(chatRoomId).emit('new-notification', {
                    chatRoomId,
                    type: 'entry',
                    message: `${userNickname}님이 채팅방에 입장했습니다.`,
                    senderId: userId,
                    createdAt: new Date(),
                });
            } catch (error) {
                console.error('입장 알림 생성 오류:', error);
            }
        });
    });
    return io;
}