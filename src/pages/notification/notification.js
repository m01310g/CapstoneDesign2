const socket = io();

  
// socket.on('newNotification', async ({ type, chatRoomId, message, createdAt }) => {
//     const notificationList = document.getElementById('notification-list');
//     const newNotification = document.createElement('div');
//     newNotification.classList.add('notification-item');
//     newNotification.innerHTML = `
//       <p>${message}</p>
//       <span>${new Date(createdAt).toLocaleString()}</span>
//       <button class="delete-notification">x</button>
//     `;
//     notificationList.prepend(newNotification); // 최신 알림 위로 추가

//     const deleteButton = newNotification.querySelector(".delete-notification");
//     deleteButton.addEventListener("click", () => {
//         newNotification.remove();
//     });

//     // 알림 버튼 옆에 숫자 갱신
//     const notificationCount = document.querySelector('.notification-count');
//     const currentCount = parseInt(notificationCount.textContent, 10);
//     notificationCount.textContent = currentCount + 1;
// });


document.addEventListener('DOMContentLoaded', async () => {
    let userId;
    fetch('/api/session/user-id') // API 엔드포인트에 요청
    .then(response => response.json())
    .then(data => {
        console.log(`asd: ${data.userId}`);
        userId = `${data.userId}`;
        
        // 알림 데이터 불러오기
        const fetchNotifications = async () => {
            const response = await fetch(`/api/notifications?userId=${userId}`);
            const notifications = await response.json();
            return notifications;
        };

        // 알림 목록 렌더링
        const renderNotifications = async () => {
            const notifications = await fetchNotifications();
            notificationList.innerHTML = notifications.map((notif) => `
                <a class="notification-item" data-notification-id="${notif.id}" href='/chat?index=${notif.chat_room_id}'>
                    <p>${notif.message}</p>
                    <span class="notification-date">${new Date(notif.created_at).toLocaleString()}</span>                    
                    <button class="delete-notification">x</button>
                </a>
                
            `).join('');
            updateNotificationCount();

            document.querySelectorAll('.delete-notification').forEach((button) => {
                button.addEventListener('click', (event) => {
                    const notificationItem = event.target.closest('.notification-item');
                    const notificationId = notificationItem.getAttribute('data-notification-id');
                    event.preventDefault();  // a 태그의 기본 동작인 링크 이동을 막음
                    event.stopPropagation(); // 이벤트 버블링을 막음
                    
                    // console.log(notificationId);
                    // 알림을 데이터베이스에서 삭제 요청
                    deleteNotification(notificationId)
                        .then(() => {
                            notificationItem.remove(); // HTML에서 알림 삭제
                            // 알림 갯수 갱신 로직 추가 (optional)
                            updateNotificationCount(); 
                        })
                        .catch(error => console.error('Error deleting notification:', error));
                    });
                    updateNotificationCount();
            });
        };
        renderNotifications();
        // getNotificationCount();
        // updateNotificationCount();
    })
    .catch(error => console.error('Error fetching session data:', error));
    const notificationList = document.getElementById('notification-list');
});

// 알림 삭제 요청 함수
async function deleteNotification(notificationId) {
    const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete notification');
    }
}

function updateNotificationCount() {
    const notificationItems = document.querySelectorAll('.notification-item');
    const notificationCount = document.querySelector('.notification-count');
    notificationCount.textContent = notificationItems.length; // notification-item의 개수로 알림 개수 표시
}