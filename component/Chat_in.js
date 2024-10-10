let isMenuOpen = false;

document.getElementById('chatInput').addEventListener('focus', function() {
    const bottomMenu = document.getElementById('bottomMenu');
    bottomMenu.style.display = 'none'; // 키패드 올라오면 하단 메뉴 숨김처리
});

function toggleMenu(event) {
    event.stopPropagation();

    const bottomMenu = document.getElementById('bottomMenu');
    const menuIcon = document.getElementById('menuIcon');
    const chatInputArea = document.querySelector('.chat-input-area');

    if (isMenuOpen) {
        bottomMenu.classList.remove('open');
        menuIcon.src = 'https://cdn-icons-png.flaticon.com/512/5135/5135168.png';  // 메뉴 아이콘으로 변경
        chatInputArea.classList.remove('menu-open');
    } else {
        bottomMenu.classList.add('open');
        menuIcon.src = 'https://cdn-icons-png.flaticon.com/512/4013/4013407.png';  // X 아이콘으로 변경
        chatInputArea.classList.add('menu-open');
    }

    isMenuOpen = !isMenuOpen;
}

// 메뉴 버튼 클릭 시 이벤트
document.getElementById('menuButton').addEventListener('click', toggleMenu);

function closeMenu(event) {
    const bottomMenu = document.getElementById('bottomMenu');
    const menuIcon = document.getElementById('menuIcon');
    const chatInputArea = document.querySelector('.chat-input-area');

    // 메뉴 외 다른 화면 클릭시 메뉴 닫기
    if (isMenuOpen && !event.target.closest('.chat-input-area') && !event.target.closest('.bottom-menu')) {
        bottomMenu.classList.remove('open');
        menuIcon.src = 'https://cdn-icons-png.flaticon.com/512/5135/5135168.png';
        isMenuOpen = false;

        chatInputArea.classList.remove('menu-open');
    }
}
document.addEventListener('click', closeMenu);

document.querySelectorAll('.send-button').forEach(item => {
    item.addEventListener('click', function() {
        alert('현재는 메세지 전송이 불가능합니다.');
    });
});

document.querySelector('.back-button').addEventListener('click', function() {
    window.location.href = 'chat_main.html'; // 뒤로가기 버튼 누르면 채팅메인페이지로 이동
});

