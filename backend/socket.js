const socketIo = require("socket.io");
const roomTradeStatus = {}; // { roomId: true/false }
const db = require('./config/db');
const activeUsersInRooms = {}; // { roomId: Set([userIds]) } 형태로 방 관리

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

// const sendNotificationToClient = (io, userId, notification) => {
//     io.to(userId).emit('new-notification', notification);
// };
const userSocketMap = {}; // { userId: socketId }

module.exports = (server) => {
  const io = socketIo(server);  
  
  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    // 채팅방 입장
    socket.on("joinRoom", ({ roomId }, callback) => {
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        socket.join(roomId);

        if (callback) callback();
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

            sendNotificationToClient(io, data.receiverId, {
              message: '${data.sender_nickname}님이 새 메세지를 보냈습니다.',
              chatRoomId: data.chat_room_id,
              type: 'message',
              senderId: data.sender_id,
              senderNickname: data.sender_nickname,

            });
        } catch (error) {
            console.error('메시지 처리 중 오류: ', error);
            callback({ success: false, error: '서버 오류' });
        }
    });
        
    // 채팅방 나갈 때
    socket.on("disconnect", () => {
        // console.log("User disconnected");
        const userId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
        for (const roomId in activeUsersInRooms) {
            activeUsersInRooms[roomId].delete(socket.id);
        }
        if (userId) {
            delete userSocketMap[userId];
            console.log(`User ${userId} disconnected`);
        }
    });

    // 채팅방 퇴장
    socket.on("leaveRoom", ({ roomId, userNickname }) => {
        socket.leave(roomId);
        // 참여 중인 사용자를 목록에서 제거
//         if (activeUsersInRooms[roomId]) {
//             activeUsersInRooms[roomId].delete(socket.id);

//             // 방에 남은 사용자가 없으면 Set 삭제
//             if (activeUsersInRooms[roomId].size === 0) {
//                 delete activeUsersInRooms[roomId];
//             }
//         }
      
        // io.to(roomId).emit("systemMessage", { systemMessage: `${userNickname} 님이 채팅방을 나갔습니다.` });
        console.log(`System message sent to room ${roomId}: ${userNickname} 님이 채팅방을 나갔습니다.`);
    });

    // 거래 시작 이벤트 처리
    socket.on("tradeStarted", ({ roomId, userId }) => {
        updateTradestatus(roomId, true); // 거래 시작 상태 저장
        io.to(roomId).emit("tradeStarted", { roomId });
        console.log(`거래 시작 이벤트 전송: roomId ${roomId}`);

        sendNotificationToClient(io, userId, {
          message: '거래가 시작되었습니다.',
          chatRoomId: roomId,
          type: 'trade',
          senderId: userId,
          
        });
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
    
    socket.on('sendSystemMessage', ({ roomId, systemMessage }, callback) => {
        // 특정 방에 시스템 메시지 전달
        io.to(roomId).emit('systemMessage', { systemMessage });
        console.log(`System message sent to room ${roomId}: ${systemMessage}`);
        if (callback) callback();
    });
    
    socket.on('kickParticipant', async ({ roomId, userId }) => {
        try {
            // 퇴장 대상 사용자의 소켓 ID를 가져오기
            const targetSocketId = userSocketMap[userId]; // userSocketMap은 userId와 socket.id 매핑 객체

            if (targetSocketId) {
                // 대상 사용자에게 알림 보내기
                io.to(targetSocketId).emit('kickedFromRoom', {
                    message: '강제 퇴장되었습니다.'
                });
                console.log(`User with ID ${userId} was removed from room ${roomId}.`);

                // callback({ success: true });
            } else {
                console.error(`Socket ID for user ${userId} not found.`);
                // callback({ success: false, message: 'User not found.' });
            }
        } catch (error) {
            console.error('Error kicking participant:', error);
            // callback({ success: false, message: 'Server error.' });
        }
    });
      
    const sendNotificationToClient = (io, userId, {message, chatRoomId, type, senderId}) => {
      const socketId = userSocketMap[userId];
      if (socketId) {
        io.to(socketId).emit('new-notification', {
          message,
          chatRoomId,
          type,
          senderId,
          createdAt: new Date(),
        });
      }
    };
  });
  return io;
}

module.exports.userSocketMap = userSocketMap;