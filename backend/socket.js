const socketIo = require("socket.io");
const roomTradeStatus = {}; // { roomId: true/false }
const db = require('./config/db');

// 포인트를 방장에게 업데이트하는 함수
const updatePoints = async (hostId, points) => {
    try {
        await db.query('UPDATE user_info SET user_point = user_point + ? WHERE user_id = ?', [points, hostId]);
        console.log(`포인트 ${points}이(가) 방장 ${hostId}에게 전달되었습니다.`);
    } catch (error) {
        console.error('포인트 전달 오류:', error);
    }
};

// 모든 참여자가 확인했는지 체크
const isAllConfirmed = async (roomId) => {
    try {
        const [result] = await db.query(
        'SELECT COUNT(*) AS total, SUM(confirmed) AS confirmed FROM participations WHERE post_id = ?',
        [roomId]
        );
        return result[0].total === result[0].confirmed;
    } catch (error) {
        console.error('모든 참여자 확인 상태 체크 중 오류:', error);
        return false;
    }
};

// 방장 ID 가져오기
const getHostId = async (roomId) => {
    try {
        const [result] = await db.query(
        'SELECT user_id FROM post_list WHERE post_index = ?',
        [roomId]
        );
        return result[0].user_id;
    } catch (error) {
        console.error('방장 ID 가져오기 실패:', error);
        return null;
    }
};

// 포인트 계산하기
const calculatePoints = async (roomId) => {
    try {
        const [result] = await db.query(
        'SELECT price FROM post_list WHERE post_index = ?',
        [roomId]
        );
        return result[0].price;
    } catch (error) {
        console.error('포인트 계산 실패:', error);
        return 0;
    }
};

module.exports = (server) => {
    const io = socketIo(server);

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id);
        
        // 채팅방 입장
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`User joined chat: ${roomId}`);
        });
        
        // 채팅 메시지 전송
        socket.on("sendMessage", (data) => {
            // 받은 데이터
            const messageData = {
                roomId: data.roomId,
                userId: data.userId,
                userNickname: data.userNickname,
                message: data.message
            };

            // 해당 채팅방에 메시지 전송
            io.to(data.roomId).emit("message", messageData); 
            console.log('받은 메시지: ', messageData);
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
            roomTradeStatus[roomId] = true; // 거래 시작 상태 저장
            io.to(roomId).emit("tradeStarted", { roomId });
            console.log(`거래 시작 이벤트 전송: roomId ${roomId}`);
        });

        // 거래 상태 요청
        socket.on("getTradeStatus", ({ roomId }, callback) => {
            const isTradeStarted = roomTradeStatus[roomId] || false;
            callback(isTradeStarted);
        });
    });
    return io;
}