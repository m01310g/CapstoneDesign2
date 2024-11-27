// 알림 실시간 업데이트
const socket = io();

socket.on('new-notification', (notification) => {
    const notificationList = document.getElementById('notification-list');
    const listItem = document.createElement('div');
    listItem.className = 'notification-item';
    listItem.textContent = notification.message;
    notificationList.appendChild(listItem);

    // 알림 버튼 옆에 숫자 갱신
    const notificationCount = document.querySelector('.notification-count');
    const currentCount = parseInt(notificationCount.textContent, 10);
    notificationCount.textContent = currentCount + 1;
});

// 알림 버튼 클릭시 개수 0으로 초기화
document.getElementById('notification-button').addEventListener('click', async () => {
    try {
        // 서버에서 알림 목록 가져오기
        const response = await fetch('/notifications');
        const notifications = await response.json();

        const notificationList = document.getElementById('notification-list');
        notificationList.innerHTML = ''; // 기존 알림 목록 초기화

        // 알림 목록 생성
        notifications.forEach((notification) => {
            const listItem = document.createElement('li');
            listItem.textContent = notification.message;
            notificationList.appendChild(listItem);
        });

        // 알림 읽음 처리 요청
        await fetch('/notifications/mark-as-read', { method: 'POST' });

        // 알림 개수를 0으로 설정
        document.getElementById('notification-count').textContent = '0';
    } catch (error) {
        console.error('알림 데이터를 가져오거나 읽음 처리하는 중 오류 발생:', error);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 서버에서 알림 목록 가져오기
        const response = await fetch('/api/notifications');
        const notifications = await response.json();

        const notificationList = document.querySelector('.notification-list');
        notificationList.innerHTML = ''; // 기존 알림 목록 초기화

        // 알림 목록 동적 생성
        notifications.forEach((notification) => {
            const listItem = document.createElement('div');
            listItem.className = 'notification-item';
            listItem.textContent = notification.message;
            notificationList.appendChild(listItem);
        });

        // 알림 읽음 처리 요청
        await fetch('/notifications/mark-as-read', { method: 'POST' });

        // 알림 개수 초기화
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) notificationCount.textContent = '0';
    } catch (error) {
        console.error('알림 데이터를 가져오는 중 오류 발생:', error);
    }
});

