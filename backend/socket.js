const socketIo = require("socket.io");

module.exports = (server) => {
    const io = socketIo(server);

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id);
        
        // 채팅방 입장
        socket.on("joiRoom", (roomId) => {
            socket.join(roomId);
            console.log(`User joined chat: ${roomId}`);
        });
        
        // 채팅 메시지 전송
        socket.on("sendMessage", (data) => {
            // 해당 채팅방에 메시지 전송
            io.to(data.roomId).emit("message", {
            user: 'User',
            message: data.message
            }); 
        });
        
        // 채팅방 나갈 때
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
        });
    return io;
}