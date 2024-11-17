const roomId = new URLSearchParams(window.location.search).get('index');
const messageInput = document.querySelector('.chat-input')
const sendMessageBtn = document.querySelector('.send-button')
const chatBox = document.querySelector('.chat-area');
const userCount = document.querySelector('.user-count');

const fetchUserCount = async () => {
  try {
    const response = await fetch(`/api/chat/get-user-count?postId=${roomId}`);
    if (!response.ok) {
      console.error('Response not Ok:', response);
      return null;
    }
    const data = await response.json();
    console.log(data);
    return data.userCount;
  } catch (error) {
    console.error('Error fetching user count: ', error);
    return null;
  }
};

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

const fetchMessages = async () => {
  try {
    const response = await fetch(`/api/chat/get-message?roomId=${roomId}`);
    if (!response.ok) {
      console.error('Failed to fetch messages: ', response.statusText);
      return [];
    }

    const messages = await response.json();
    return messages;
  } catch (error) {
    console.error('Error fetching messages: ', error);
    return [];
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const getUserCount = await fetchUserCount();
  userCount.innerText = getUserCount;
  const getUserId = await fetchUserInfo();
  const userId = getUserId.userId;

  const messages = await fetchMessages();
  messages.forEach((message) => {
    if (userId === message.sender_id) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'message-sended');
      messageElement.innerText = message.message;
      chatBox.appendChild(messageElement);
    } else {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'message-received');
      messageElement.innerText = message.message;
      chatBox.appendChild(messageElement);
    }
  })
})

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
// sendMessageBtn.addEventListener('click', () => {
//   const message = messageInput.value;
//   if (message.trim()) {
//     const ownMessageElement = document.createElement('div');
//     ownMessageElement.classList.add('message', 'message-sended');
//     ownMessageElement.innerText = message;
//     chatBox.appendChild(ownMessageElement);
//     chatBox.scrollTop = chatBox.scrollHeight;

//     socket.emit('sendMessage', { roomId, message });
//     messageInput.value = ''; // 입력창 초기화
//   }
// });

sendMessageBtn.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  const getUserInfo = await fetchUserInfo();
  const userId = getUserInfo.userId;
  if (message) {
    const messageData = {
      chat_room_id: roomId,
      sender_id: userId,
      message
    };

    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const ownMessageElement = document.createElement('div');
        ownMessageElement.classList.add('message', 'message-sended');
        ownMessageElement.innerText = message;
        chatBox.appendChild(ownMessageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        socket.emit('sendMessage', { roomId, message });
        messageInput.value = ''; // 입력창 초기화
      } else {
        console.error('Failed to save message: ', response.statusText);
      }
    } catch (error) {
      console.error('Error saving message: ', error);
    }
  } 
});

// Enter 키로 메시지 전송
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessageBtn.click();
  }
});
