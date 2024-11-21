const roomId = new URLSearchParams(window.location.search).get('index');
const messageInput = document.querySelector('.chat-input')
const sendMessageBtn = document.querySelector('.send-button')
const chatBox = document.querySelector('.chat-area');
const userCount = document.querySelector('.user-count');
const chatTitle = document.querySelector('.chat-title');
const leaveBtn = document.querySelector('.leave-room-btn');
const menuButton = document.querySelector('.menu-button');
const chatInputArea = document.querySelector('.chat-input-area');
const bottomMenu = document.querySelector('.bottom-menu');
const confirmBtn = document.querySelector('.confirm-button');

const fetchUserCount = async () => {
  try {
    const response = await fetch(`/api/chat/get-user-count?postId=${roomId}`);
    if (!response.ok) {
      console.error('Response not Ok:', response);
      return null;
    }
    const data = await response.json();
    return data.userCount;
  } catch (error) {
    console.error('Error fetching user count: ', error);
    return null;
  }
};

const fetchUserId = async () => {
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

const fetchUserInfo = async () => {
  try {
      const response = await fetch('/api/session/user-info');
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

const fetchPostById = async () => {
  try {
    const response = await fetch(`/api/post/view/${roomId - 1}`);
    if (!response.ok) {
      console.error('Failed to fetch post: ', response.error);
      return [];
    }
    const post = await response.json();
    return post;
  } catch (error) {
    console.error('Error fetching post: ', error);
    return [];
  }
};

const startTrade = async () => {
  try {
    const response = await fetch('/api/chat/start-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId })
    });

    if (response.ok) {
      const systemMessage = document.createElement('div');
      systemMessage.classList.add('message', 'system-message');
      systemMessage.innerText = '거래가 시작됩니다.';
      chatBox.appendChild(systemMessage);
      chatBox.scrollTop = chatBox.scrollHeight;

      const tradeBtn = document.querySelector('.trade-button');
      tradeBtn.disabled = true;

      socket.emit('tradeStarted', { roomId });
    } else {
      console.error('거래 시작 실패: ', await response.text());
    }
  } catch (error) {
    console.error('Error starting trade: ', error);
  }
};

const updateReservationButton = async () => {
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;
  const getPostInfo = await fetchPostById();
  const writerId = getPostInfo.user_id;
  const HIDDEN_CLASS_NAME = 'hidden';

  const tradeBtn = document.querySelector('.trade-button');

  const checkReservationStatus = async () => {
    const response = await fetch(`/api/chat/check-reservation?roomId=${roomId}&userId=${userId}`);
    const { reserved } = await response.json();
    return reserved;
  };

  const getReservationCount = async () => {
    const response = await fetch(`/api/chat/get-reservation-count?roomId=${roomId}`);
    const { count } = await response.json();
    return count;
  }

  if (writerId === userId) {
    const reservationCount = await getReservationCount();
    const currentCapacity = getPostInfo.current_capacity;

    if (reservationCount + 1 === currentCapacity) {
      tradeBtn.classList.remove(HIDDEN_CLASS_NAME);
      tradeBtn.innerText = '거래 진행';
      tradeBtn.onclick = async () => {
        await startTrade();
      };
    } else {
      tradeBtn.classList.add(HIDDEN_CLASS_NAME);
    }

    leaveBtn.classList.add(HIDDEN_CLASS_NAME);
  } else {
    const isReserved = await checkReservationStatus();
    
    if (isReserved) {
      tradeBtn.innerText = '예약 취소';
      leaveBtn.classList.add(HIDDEN_CLASS_NAME);
      tradeBtn.onclick = async () => {
        const response = await fetch('/api/chat/cancel-reservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, userId })
        });

        if (response.ok) {
          await updateReservationButton();
        }
      };
    } else {
      tradeBtn.innerText = '거래 예약';
      leaveBtn.classList.remove(HIDDEN_CLASS_NAME);
      tradeBtn.onclick = async () => {
        const response = await fetch('/api/chat/reserve-trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, userId })
        });

        if (response.ok) {
          await updateReservationButton();
        }
      };
    }
  }
};

const syncTradeStatus = async () => {
  socket.emit("getTradeStatus", { roomId }, (isTradeStarted) => {
      const tradeBtn = document.querySelector('.trade-button');
      if (isTradeStarted) {
          // 거래 진행 상태일 경우 버튼 비활성화
          if (tradeBtn) tradeBtn.disabled = true;
          leaveBtn.classList.add("hidden"); // 나가기 버튼 숨기기
      } else {
          // 거래 미진행 상태일 경우 버튼 활성화
          if (tradeBtn) tradeBtn.disabled = false;
          leaveBtn.classList.remove("hidden"); // 나가기 버튼 보이기
      }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const getUserCount = await fetchUserCount();
  userCount.innerText = getUserCount;
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;

  chatTitle.innerText = (await fetchPostById()).title;

  const messages = await fetchMessages();
  messages.forEach((message) => {
    if (message.message_type === 'system') {
      // 시스템 메시지 렌더링
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'system-message');
      messageElement.innerText = message.message;
      chatBox.appendChild(messageElement);
    } else if (userId === message.sender_id) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'message-sended');
      messageElement.innerText = message.message;
      chatBox.appendChild(messageElement);
    } else {
      const messageElement = document.createElement('div');
      const nicknameElement = document.createElement('div');
      messageElement.classList.add('message', 'message-received');
      messageElement.innerText = message.message;
      nicknameElement.classList.add('nickname');
      nicknameElement.innerText = message.sender_nickname;
      chatBox.appendChild(nicknameElement);
      chatBox.appendChild(messageElement);
    }
  });

  chatBox.scrollTop = chatBox.scrollHeight;
  await syncTradeStatus(); // 거래 상태 동기화
  await updateReservationButton();
});

const socket = io(); // 소켓 초기화 (서버 연결)

socket.emit('joinRoom', roomId); // 해당 채팅방 입장

sendMessageBtn.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;
  const getUserInfo = await fetchUserInfo();
  const userNickname = getUserInfo.userNickname;


  if (message) {
    const messageData = {
      chat_room_id: roomId,
      sender_id: userId,
      sender_nickname: userNickname,
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

        socket.emit('sendMessage', { roomId, userId, userNickname, message });
        messageInput.value = ''; // 입력창 초기화
      } else {
        console.error('Failed to save message: ', response.statusText);
      }
    } catch (error) {
      console.error('Error saving message: ', error);
    }
  } 
});

menuButton.addEventListener('click', () => {
  const HIDDEN_CLASS_NAME = "hidden";
  const MENU_OPEN_CLASS_NAME = "menu-open";
  const isMenuOpen = bottomMenu.classList.contains(HIDDEN_CLASS_NAME);

  if (isMenuOpen) {
    bottomMenu.classList.remove(HIDDEN_CLASS_NAME);
    chatInputArea.classList.add(MENU_OPEN_CLASS_NAME);
    document.querySelector('#menuIcon').classList.add('x-icon');
    const bottomMenuHeight = bottomMenu.offsetHeight;
    // 메뉴 보이기
    bottomMenu.style.transform = 'translateY(0)';
    chatInputArea.style.transform = `translateY(-${bottomMenuHeight}px)`; // chat-input-area 이동
  } else {
    bottomMenu.classList.add(HIDDEN_CLASS_NAME);
    chatInputArea.classList.remove(MENU_OPEN_CLASS_NAME);
    document.querySelector('#menuIcon').classList.remove('x-icon');
    // 메뉴 숨기기
    bottomMenu.style.transform = 'translateY(100%)';
    chatInputArea.style.transform = 'translateY(0)'; // 원래 위치로 복구
  }
})

// Enter 키로 메시지 전송
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessageBtn.click();
  }
});

leaveBtn.addEventListener('click', async () => {
  const confirmLeave = confirm('채팅방을 나가시겠습니까?');
  if (!confirmLeave) return;

  try {
    const getUserId = await fetchUserId();
    const userId = getUserId.userId;
    const getUserInfo = await fetchUserInfo();
    const userNickname = getUserInfo.userNickname;

    socket.emit('leaveRoom', { roomId, userNickname });

    const response = await fetch('/api/chat/leave-chat-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, userId })
    });

    const result = await response.json();
    if (result.success) {
      window.location.href = '/chat/main';
    }
  } catch (error) {
    console.error('Error leaving chat room: ', error);
    alert('서버 오류가 발생했습니다.');
  }
});

socket.on('userLeft', ({ message }) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'system-message');
  messageElement.innerText = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('tradeStarted', ({ roomId }) => {
  // const systemMessage = document.createElement('div');
  // systemMessage.classList.add('message', 'system-messsage');
  // systemMessage.innerText = '거래가 시작됩니다.';
  // chatBox.appendChild(systemMessage);
  // chatBox.scrollTop = chatBox.scrollHeight;
  // console.log(document.querySelector('.trade-button'));

  if (document.querySelector('.trade-button')) document.querySelector('.trade-button').disabled = true;
});