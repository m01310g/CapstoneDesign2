const socketIo = require("socket.io");

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
    });
    return io;
}