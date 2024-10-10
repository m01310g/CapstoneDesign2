// 채팅방 전송 버튼 기능 예시
document.querySelector('.send-button').addEventListener('click', () => {
    const messageInput = document.querySelector('.chat-input input');
    if (messageInput.value.trim() !== '') {
        console.log("전송된 메시지: ", messageInput.value);
        messageInput.value = ''; // 입력 필드 초기화
    }
});

// 채팅방 클릭하면 입장
document.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', function() {
        const chatName = this.querySelector('.chat-name').textContent;

        if (chatName === "길동이") {
            // 길동이 채팅방 클릭 -> 채팅방 입장
            window.location.href = 'Chat_in.html';
        } else {
            alert('현재는 채팅방 입장이 불가능합니다.');
        }
    });
});
