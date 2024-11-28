const roomId = new URLSearchParams(window.location.search).get('index');
const messageInput = document.querySelector('.chat-input');
const sendMessageBtn = document.querySelector('.send-button');
const chatBox = document.querySelector('.chat-area');
const userCount = document.querySelector('.user-count');
const chatTitle = document.querySelector('.chat-title');
const leaveBtn = document.querySelector('.leave-room-btn');
const menuButton = document.querySelector('.menu-button');
const chatInputArea = document.querySelector('.chat-input-area');
const bottomMenu = document.querySelector('.bottom-menu');
const confirmButton = document.querySelector('.confirm-button');
const memberButton = document.querySelector('.member-button');
const memberListContainer = document.querySelector('#memberListContainer');
const memberList = document.querySelector('#memberList');

const fetchUserCount = async () => {
  try {
    const response = await fetch(`/api/chat/get-user-count?postId=${roomId}`);
    if (!response.ok) {
      console.error('Response not Ok:', response);
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

const showAdditionalPriceButton = async () => {
  const getPostInfo = await fetchPostById();
  const writerId = getPostInfo.user_id;
  const category = getPostInfo.category;
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;
  
  const hasConfirmed = await checkAnyConfirmed();
  const additionalPriceBtn = document.querySelector('.additional-price-btn');

  if (category !== '택시') {
    additionalPriceBtn.classList.add('hidden');
    return;
  }

  // 글 작성자인 경우에만 추가 금액 버튼 보이도록 설정
  if (userId === writerId) {
    additionalPriceBtn.classList.remove('hidden');
    // 참여자 중 한명이라도 확인 버튼을 누를 경우
    if (hasConfirmed) {
      additionalPriceBtn.disabled = true;
    } else {
      additionalPriceBtn.disabled = false;
      additionalPriceBtn.addEventListener('click', updateAdditionalPrice);
      document.querySelector('.bottom-menu').appendChild(additionalPriceBtn);
    }
  }
};

const checkReservationStatus = async () => {
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;
  const response = await fetch(`/api/chat/check-reservation?roomId=${roomId}&userId=${userId}`);
  const result = await response.json();
  return result;
};

const updateReservationButton = async () => {
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;
  const getPostInfo = await fetchPostById();
  const writerId = getPostInfo.user_id;
  const HIDDEN_CLASS_NAME = 'hidden';

  const tradeBtn = document.querySelector('.trade-button');

  const getReservationCount = async () => {
    const response = await fetch(`/api/chat/get-reservation-count?roomId=${roomId}`);
    const { count } = await response.json();
    return count;
  }

  if (writerId === userId) {
    const reservationCount = await getReservationCount();
    const currentCapacity = getPostInfo.current_capacity;

    if ((reservationCount + 1 === currentCapacity) && currentCapacity !== 1) {
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
    console.log(isReserved.reserved);
    
    if (isReserved.reserved) {
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
      tradeBtn.disabled = false;
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
  const getPostInfo = await fetchPostById();
  const writerId = getPostInfo.user_id;
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;

  try {
    const response = await fetch(`/api/chat/check-trade-status?roomId=${roomId}`);
    if (!response.ok) {
      console.error('Failed to fetch trade status: ', response.statusText);
      return null;
    }
    const isTradeStarted = await response.json();
    const tradeBtn = document.querySelector('.trade-button');
    if (isTradeStarted.isTradeStarted) {
      // 거래 진행 상태일 경우 버튼 비활성화
      if (tradeBtn) tradeBtn.disabled = true;
      if (writerId !== userId) confirmButton.classList.remove('hidden');
      leaveBtn.classList.add("hidden"); // 나가기 버튼 숨기기
      await showAdditionalPriceButton();
    } else {
      // 거래 미진행 상태일 경우 버튼 활성화
      if (tradeBtn) tradeBtn.disabled = false;
      confirmButton.classList.add('hidden');
      leaveBtn.classList.remove("hidden"); // 나가기 버튼 보이기
    }
  } catch (error) {
    console.error('Error fetching trade status: ', error);
    return null;
  }
};

const toggleConfirmedStatus = async () => {
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;
  const getAmount = await checkReservationStatus();
  const additionalAmount = getAmount.additionalAmount;
  const originalAmount = getAmount.originalAmount;

  try {
    const confirmInput = confirm(`${additionalAmount}원이 추가되어 총 ${parseInt(originalAmount + additionalAmount)}포인트가 차감됩니다. `);
    if (!confirmInput) return;
    const response = await fetch('/api/chat/toggle-confirmed-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, userId })
    });

    if (!response.ok) {
      return;
    }

    const { success, confirmed, allConfirmed } = await response.json();
  
    if (success) {
      if (confirmed) {
        confirmButton.innerText = '확인 취소';
        alert('결제를 확인했습니다.');
      } else {
        confirmButton.innerText = '확인';
        alert('취소되었습니다.');
      }
    }

    confirmButton.disabled = allConfirmed;

    // confirmButton.disabled = false;
  } catch (error) {
    console.error('Error toggling confirmed status: ', error);
  }
};

const updateAdditionalPrice = async () => {
  const additionalPrice = parseInt(prompt('추가 금액을 입력하세요: '));
  if (isNaN(additionalPrice)) {
    alert('유효한 금액을 입력하세요.');
    return;
  }

  const confirmInput = confirm(`입력한 추가 금액은 ${additionalPrice}원입니다. 적용하시겠습니까?`);
  if (!confirmInput) {
    alert('추가 금액 입력이 취소되었습니다.');
    return;
  }

  try {
    const response = await fetch('/api/chat/update-reservation-amounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, additionalPrice: parseInt(additionalPrice, 10) })
    });
    const result = await response.json();
    if (!response.ok) {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error updating addtional price: ', error);
  }
};

const checkAnyConfirmed = async () => {
  try {
    const response = await fetch(`/api/chat/check-any-confirmed?roomId=${roomId}`);
    if (!response.ok) {
      console.error('Failed to check confirmed status: ', response.statusText);
      return false;
    }
    const { hasConfirmed } = await response.json();
    return hasConfirmed;
  } catch (error) {
    console.error('Error checking confirmed status: ', error);
    return false;
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const getUserCount = await fetchUserCount();
  userCount.innerText = getUserCount;
  const getUserId = await fetchUserId();
  const userId = getUserId.userId;
  const getPostInfo = await fetchPostById();
  const writerId = getPostInfo.user_id;

  chatTitle.innerText = (await fetchPostById()).title;

  const userResponse = await fetch(`/api/chat/user-confirmed?roomId=${roomId}&userId=${userId}`);
  if (userResponse.ok) {
    const result = await userResponse.json();
    if (result.userConfirmed === 1) {
      confirmButton.classList.remove('hidden');
      confirmButton.disabled = true;
    }
  }

  confirmButton.addEventListener('click', toggleConfirmedStatus);

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
      if (message.sender_id = writerId) {
        nicknameElement.style.color = '#F5AF12';
        nicknameElement.style.fontWeight = 'bold';
      }
      chatBox.appendChild(nicknameElement);
      chatBox.appendChild(messageElement);
    }
  });

  const modal = document.querySelector('#reportModal');

  modal.style.display = "none"; // 초기 상태에서 모달 숨김

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
        socket.emit('sendMessage', messageData, (response) => {
          if (response?.success) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'message-sended');
            messageElement.innerText = message;
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
            messageInput.value = '';
          }
        });

        // socket.emit('sendMessage', { roomId, userId, userNickname, message });
        // messageInput.value = ''; // 입력창 초기화
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
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // 기본 Enter 동작 방지
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

// 사용자 등록
socket.on("connect", () => {
  console.log("Connected to socket server with ID:", socket.id);

  fetchUserId().then(({ userId }) => {
    // 서버로 유저 정보 전달
    socket.emit("registerUser", { userId });
  });
});

socket.on('message', (messageData) => {
  fetchUserId().then(({ userId }) => {
  // 본인이 보낸 메시지 무시
    if (messageData.userId === userId) return;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'message-received');
    messageElement.innerText = messageData.message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }).catch(error => {
    console.error('Error fetching userId: ', error);
  });
});

// 소켓으로 시스템 메시지를 수신
socket.on('systemMessage', ({ message }) => {
  const systemMessageElement = document.createElement('div');
  systemMessageElement.classList.add('message', 'system-message');
  systemMessageElement.innerText = message;
  chatBox.appendChild(systemMessageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // 최신 메시지로 스크롤
});

socket.on('userLeft', ({ message }) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'system-message');
  messageElement.innerText = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('tradeStarted', ({ roomId }) => {
  if (document.querySelector('.trade-button')) document.querySelector('.trade-button').disabled = true;
});

socket.on('kickedFromRoom', ({ message }) => {
  alert(message);
  window.location.href = '/chat/main'; // 메인 화면으로 리다이렉트
});

memberButton.addEventListener('click', async () => {
  try {
    const response = await fetch(`/api/chat/get-participations?roomId=${roomId}`);
    if (!response.ok) {
      console.error('Failed to fetch participants');
      return;
    }
    const { participants, hostId } = await response.json();

    const reservationResponse = await fetch(`/api/chat/get-reservations?roomId=${roomId}`);
    const reservations = await reservationResponse.json();

    const userId = (await fetchUserId()).userId;

    const reservedUsers = reservations.map(reservation => reservation.user_id);
    const reservedParticipants = participants.filter(participant => reservedUsers.includes(participant.user_id));
    const nonReservedParticipants = participants.filter(
      participant => !reservedUsers.includes(participant.user_id) && participant.user_id !== hostId
    );

    const hostParticipant = participants.find(participant => participant.user_id === hostId);

    memberList.innerHTML = '';

    // 방장 추가
    if (hostParticipant) {
      const hostItem = document.createElement('li');
      hostItem.textContent = `${hostParticipant.user_nickname}`;
      hostItem.style.color = '#f5af12'; // 방장 색상
      hostItem.style.fontWeight = 'bold';
      hostItem.style.height = '2.5rem';
      memberList.appendChild(hostItem);

      // 신고하기 버튼 (자기 자신 제외)
      if (hostParticipant.user_id !== userId) {
        const reportButton = document.createElement('button');
        reportButton.textContent = '신고';
        reportButton.style.marginLeft = '10px';
        reportButton.style.padding = '5px 10px';
        reportButton.style.backgroundColor = 'transparent';
        reportButton.style.color = 'grey';
        reportButton.style.border = '1px solid grey';
        reportButton.style.borderRadius = '4px';
        reportButton.style.cursor = 'pointer';
        reportButton.dataset.userId = hostParticipant.user_id; // 유저 ID 추가
        reportButton.classList.add('report-btn');

        // 신고하기 버튼 클릭 이벤트
        reportButton.addEventListener('click', async () => {
          const confirmReport = confirm(`${hostParticipant.user_nickname}님을 신고하시겠습니까?`);
          if (!confirmReport) return;
        });

        hostItem.appendChild(reportButton);
      }
    }

    // 예약 중인 참여자 추가
    if (reservedParticipants.length > 0) {
      const reservedHeader = document.createElement('li');
      reservedHeader.textContent = '거래 예약 중';
      reservedHeader.style.fontWeight = 'bold';
      memberList.appendChild(reservedHeader);

      reservedParticipants.forEach(participant => {
          const listItem = document.createElement('li');
          listItem.textContent = participant.user_nickname;
          if (participant.user_id === hostId) {
              listItem.style.color = '#f5af12'; // 방장 색상
              listItem.style.fontWeight = 'bold';
          }

          // 신고하기 버튼 (자기 자신 제외)
          if (participant.user_id !== userId) {
            const reportButton = document.createElement('button');
            reportButton.textContent = '신고';
            reportButton.style.marginLeft = '10px';
            reportButton.style.padding = '5px 10px';
            reportButton.style.backgroundColor = 'transparent';
            reportButton.style.color = 'grey';
            reportButton.style.border = '1px solid grey';
            reportButton.style.borderRadius = '4px';
            reportButton.style.cursor = 'pointer';
            reportButton.classList.add('report-btn');
            reportButton.dataset.userId = participant.user_id; // 유저 ID 추가

            // 신고하기 버튼 클릭 이벤트
            reportButton.addEventListener('click', async () => {
              const confirmReport = confirm(`${participant.user_nickname}님을 신고하시겠습니까?`);
              if (!confirmReport) return;
            });

            listItem.appendChild(reportButton);
          }
          memberList.appendChild(listItem);
      });
    }

    // 대기 중인 참여자 추가
    if (nonReservedParticipants.length > 0) {
      const nonReservedHeader = document.createElement('li');
      nonReservedHeader.textContent = '대기 중';
      nonReservedHeader.style.fontWeight = 'bold';
      memberList.appendChild(nonReservedHeader);

      nonReservedParticipants.forEach(participant => {
        const listItem = document.createElement('li');
        listItem.style.display = "flex";
        listItem.style.justifyContent = 'space-between';
        listItem.style.alignItems = 'center';
        listItem.style.height = '2.5rem';
        listItem.id = `#participant-${participant.user_nickname}`

        // 닉네임 추가
        const nicknameSpan = document.createElement('span');
        nicknameSpan.textContent = participant.user_nickname;
        listItem.appendChild(nicknameSpan);

        // 신고하기 버튼 (자기 자신 제외)
        if (participant.user_id !== userId) {
          const reportButton = document.createElement('button');
          reportButton.textContent = '신고';
          reportButton.style.marginLeft = '10px';
          reportButton.style.padding = '5px 10px';
          reportButton.style.backgroundColor = 'transparent';
          reportButton.style.color = 'grey';
          reportButton.style.border = '1px solid grey';
          reportButton.style.borderRadius = '4px';
          reportButton.style.cursor = 'pointer';
          reportButton.classList.add('report-btn');
          reportButton.dataset.userId = participant.user_id; // 유저 ID 추가

          listItem.appendChild(reportButton);
        }

        // 강제 퇴장 버튼 추가 (방장만 보이도록)
        if (userId === hostId) {
          const kickButton = document.createElement('button');
          kickButton.classList.add('kick-btn');
          kickButton.textContent = '강제 퇴장';
          kickButton.style.marginLeft = '10px';
          kickButton.style.backgroundColor = 'red';
          kickButton.style.color = 'white';
          kickButton.style.border = 'none';
          kickButton.style.padding = '5px';
          kickButton.style.borderRadius = '4px';
          kickButton.style.cursor = 'pointer';

          // 강제 퇴장 이벤트
          kickButton.addEventListener('click', async () => {
            if (confirm(`${participant.user_nickname}님을 강제 퇴장시키겠습니까?`)) {
              try {
                const kickResponse = await fetch('/api/chat/kick-participant', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId, userId: participant.user_id })
                });

                if (kickResponse.ok) {
                  alert(`${participant.user_nickname}님을 퇴장시켰습니다.`);
                  // UI 업데이트
                  listItem.remove();
                } else {
                  alert('퇴장 요청에 실패했습니다.');
                }
              } catch (error) {
                console.error('Error kicking participant: ', error);
                alert('서버 오류로 인해 퇴장 요청에 실패했습니다.');
              }
            }
          });
          listItem.appendChild(kickButton);
        }
        memberList.appendChild(listItem);
      });
    }

    // UI 표시
    memberListContainer.classList.toggle('hidden');
  } catch (error) {
    console.error('Error fetching participants: ', error);
  }
});

// 신고 버튼 이벤트 위임
memberList.addEventListener('click', (event) => {
  const modal = document.querySelector('#reportModal');
  const closeModal = document.querySelector('#closeModal');
  const submitReport = document.querySelector('#submitReport');
  const additionalReasonInput = document.querySelector('#additionalReason');
  const reportForm = document.querySelector('#reportForm');

  if (event.target.classList.contains('report-btn')) {
    const button = event.target;
    const reportedUserId = button.dataset.userId; // 신고 대상 ID
    modal.dataset.reportedUserId = reportedUserId; // 모달에 대상 ID 저장
    modal.classList.remove('hidden'); // 모달 표시
    modal.style.display = 'flex';
  }

  closeModal.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.style.display = 'none';
  });

  // "기타" 선택 시 텍스트 박스 표시
  reportForm.addEventListener('change', (event) => {
    if (event.target.name === 'reason' && event.target.value === '기타') {
      additionalReasonInput.classList.remove('hidden');
    } else {
      additionalReasonInput.classList.add('hidden');
    }
  });

  // 신고 제출
  submitReport.addEventListener('click', async () => {
    const reportedUserId = modal.dataset.reportedUserId; // 신고 대상 ID
    const selectedReason = reportForm.reason.value; // 선택된 신고 사유
    const additionalReason = additionalReasonInput.value.trim(); // 추가 사유

    const reason = selectedReason === '기타' ? additionalReason : selectedReason;

    if (!reason) {
      alert('신고 사유를 입력하거나 선택하세요.');
      return;
    }

    try {
      const response = await fetch('/api/chat/report-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          reportedUserId,
          reportReason: reason,
        }),
      });

      if (response.ok) {
        alert('신고가 접수되었습니다.');
        modal.classList.add('hidden'); // 모달 닫기
      } else {
        alert('신고 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('신고 처리 중 서버 오류가 발생했습니다.');
    }
  });
});

// 클릭 시 닫기
document.addEventListener('click', (event) => {
  if (!memberButton.contains(event.target) && !memberListContainer.contains(event.target)) {
      memberListContainer.classList.add('hidden');
  }
});