
const roomId = new URLSearchParams(window.location.search).get('roomId');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatBox = document.getElementById('chatBox');

const socket = io(); // 소켓 초기화 (서버 연결)

socket.emit('joinRoom', roomId); // 해당 채팅방 입장

// 서버로부터 메시지를 받으면 화면에 표시
socket.on('message', (data) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerText = `${data.user}: ${data.message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // 스크롤 하단으로 유지
});

// 메시지 전송
sendMessageBtn.addEventListener('click', () => {
  const message = messageInput.value;
  if (message.trim()) {
    socket.emit('sendMessage', { roomId, message });
    messageInput.value = ''; // 입력창 초기화
  }
});

// Enter 키로 메시지 전송
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessageBtn.click();
  }
});
