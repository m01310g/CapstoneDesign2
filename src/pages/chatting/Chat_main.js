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
  
    const notificationButton = document.querySelector(".notification-button");
    // 알림 버튼 클릭 시 알림 페이지로 이동 및 알림 초기화
    notificationButton.addEventListener("click", async() => {
      try {
        const response = await fetch('/api/notificaions/mark-as-read?userId=${userId}', {
          mothod: 'POST',
        });
        if (response.ok) {
         document.querySelector('.notification-count').textContent = '0';
        } else {
          console.error('Fail to mark notifications as read');
        }
      } catch (error) {
          console.error('Error fetching notification: ', error);
      } finally {   // 알림 초기화가 안되더라도 페이지 변경은 무조건 실행 
          window.location.href = "/notification";
      }
    });
  
    const response = await fetch(`/api/notifications/count-notifications?userId=${userId}`);
    const result = await response.json();
    const count = result.count;
    document.querySelector('.notification-count').textContent = count;

    try {
        const response = await fetch(`/api/chat/get-chat-rooms?userId=${userId}`);
        const chatRooms = await response.json();

        if (chatRooms.length === 0) {
            chatRoomList.innerHTML = `<p id='no-chat'>채팅방이 없습니다.</p>`;
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
                <hr class='divider'>
            `;
            chatRoomList.appendChild(roomElement);
        });
    } catch (error) {
        console.error('Error fetching chat rooms: ', error);
        chatRoomList.innerHTML = '<p>채팅방을 가져오는 중 오류가 발생했습니다.</p>';
    }
});

// const socket = io();

// function updateNotificationBadge(count) {
//     const badge = document.getElementById("notification-badge");
//     if (count > 0) {
//       badge.style.display = "block";
//       badge.textContent = count;
//     } else {
//       badge.style.display = "none";
//     }
//   }

// // 알림 실시간 업데이트
// socket.on('new-notification', (notification) => {
//     const notificationButton = document.querySelector('.notification-button');
//     const notificationCount = notificationButton.querySelector('.notification-count');

//     // 알림 개수 업데이트
//     notificationCount.textContent = parseInt(notificationCount.textContent || '0') + 1;

//     window.onload = updateNotificationCount;

//     // 알림 리스트에 추가 (옵션: UI에 동적으로 표시할 수도 있음)
//     const notificationList = document.getElementById('notification-list');
//     if (notificationList) {
//         const listItem = document.createElement('div');
//         listItem.className = 'notification-item';
//         listItem.textContent = notification.message;
//         notificationList.appendChild(listItem);
//     }
// });