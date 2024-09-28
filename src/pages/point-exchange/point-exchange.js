const exchangeButton = document.getElementById('exchangeButton');
const inputField = document.getElementById('inputField');

exchangeButton.addEventListener('click', () => {
    const amount = inputField.value;
    if (amount) {
        alert(`환전할 금액: ${amount}원`); // 환전할 금액을 알림으로 표시
        // 페이지 새로고침
        location.reload();
    } else {
        alert('환전할 금액을 입력하세요.'); // 입력이 없을 경우 경고
    }
});