const exchangeButton = document.getElementById('exchangeButton');
const inputField = document.getElementById('inputField');

const formatNumberWithCommas = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

exchangeButton.addEventListener('click', () => {
    // Check if the input field is currently hidden
    if (inputField.style.display === 'none' || inputField.style.display === '') {
        inputField.style.display = 'block'; // Show the input field
        inputField.focus(); // Set focus to the input field for better user experience
        exchangeButton.textContent = '확인'; // Change button text to '확인'
    } else {
        const amount = inputField.value.replace(/,/g, '');
        if (amount) {
            const formattedAmount = formatNumberWithCommas(amount); 
            alert(`환전할 금액: ${formattedAmount}원`); 
            location.reload(); // Reload the page
        } else {
            alert('환전할 금액을 입력하세요.');
        }
    }
});

// 페이지 로드 시 세션 데이터를 요청
window.onload = function() {
    fetch('/api/session/user-info') // API 엔드포인트에 요청
      .then(response => response.json())
      .then(data => {
        // 받은 데이터로 HTML 내용 변경
        document.querySelector("#available-point h5").textContent = `${data.userPoint.toLocaleString()}${" 포인트"}`;
      })
      .catch(error => console.error('Error fetching session data:', error));
};