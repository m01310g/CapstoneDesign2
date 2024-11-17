document.getElementById('create-room-btn').addEventListener('click', async () => {
  const roomName = prompt('채팅방 이름을 입력하세요');
  if (roomName) {
    try {
      const response = await fetch('/api/chat/create-room', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomName }),
      });

      const data = await response.json();

      if (data.success) {
          alert('채팅방이 성공적으로 생성되었습니다!');
          addChatRoomToList({ id: data.room_id, name: roomName });
      } else {
          alert(`채팅방 생성 오류: ${data.message}`);
      }
  } catch (error) {
      console.error('채팅방 생성 중 오류가 발생했습니다:', error);
      alert('채팅방 생성 중 오류가 발생했습니다.');
  }
}
});

function addChatRoomToList(room) {
  const chatroomList = document.getElementById('chatroom-list');
  const roomElement = document.createElement('div');
  roomElement.className = 'chatroom';
  roomElement.textContent = room.name;

  
  roomElement.addEventListener('click', () => {
      alert(`채팅방 "${room.name}"로 이동합니다.`);
  });

  chatroomList.appendChild(roomElement);
}
