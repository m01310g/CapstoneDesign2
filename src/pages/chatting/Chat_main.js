const fetchUserInfo = async () => {
    try {
        const response = await fetch('/api/session/user-id');
        if (!response.ok) {
            console.error("Response not OK: ", response)
            alert("로그인 되어 있지 않습니다.");
            window.location.href = '/';
            return null;
        }
        const userInfo = await response.json();
        return userInfo;
    } catch (error) {
        console.error('Error fetching user info: ', error);
        window.location.href = '/';
        return null;
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    const chatRoomList = document.querySelector('#chatroom-list');
    const getUserId = await fetchUserInfo();
    const userId = getUserId.userId;

    try {
        const response = await fetch(`/api/chat/get-chat-rooms?userId=${userId}`);
        const chatRooms = await response.json();

        if (chatRooms.length === 0) {
            chatRoomList.innerHTML = '<p>채팅방이 없습니다.</p>';
            return;
        }

        chatRooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'chatroom-item';
            roomElement.innerHTML = `
                <a href="/chat?index=${room.room_id}">
                    <div class="chatroom-title">
                        <h3>${room.title}</h3>
                        <p class="participants-count">${room.participants_count}</p>
                    </div>
                    <div class="chatroom-info">
                        <p class="recent-message">${room.recent_message || '채팅 메시지가 없습니다.'}</p>
                    </div>
                </a>
                <hr>
            `;
            chatRoomList.appendChild(roomElement);
        });
    } catch (error) {
        console.error('Error fetching chat rooms: ', error);
        chatRoomList.innerHTML = '<p>채팅방을 가져오는 중 오류가 발생했습니다.</p>';
    }
});