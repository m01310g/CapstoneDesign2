const display = document.querySelector('#display');
const amountBtns = document.querySelectorAll('.amount');
const inputField = document.querySelector('#inputField');
const selfBtn = document.querySelector('#self');
let selectedAmount = 0;

// Function to format numbers with commas
const formatNumberWithCommas = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

// 금액 버튼 클릭 시 동작
amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedAmount = parseInt(btn.innerText.replace(/,/g, '')); // Remove commas and convert to number
        display.textContent = `충전할 금액: ${formatNumberWithCommas(selectedAmount)}원`; // Update display with formatted amount
        inputField.style.display = 'none'; // Hide input field
        selfBtn.style.display = 'block'; // Show self-input button

        // 선택된 금액을 localStorage에 저장하여 다른 파일에서 참조할 수 있도록 함
        localStorage.setItem('selectedAmount', selectedAmount);
    });
});

// 직접입력 버튼 클릭 시 동작
selfBtn.addEventListener('click', () => {
    inputField.style.display = 'block'; // Show input field
    selfBtn.style.display = 'none'; // Hide self-input button
    display.textContent = ''; // Clear display
    inputField.focus(); // Focus on the input field
});

// 직접 입력 필드에 금액 입력 시 동작
inputField.addEventListener('input', () => {
    const amount = inputField.value.replace(/,/g, ''); // Remove commas from the input field value if any
    selectedAmount = parseInt(amount) || 0; // Convert to integer, default to 0 if invalid

    const alertMessage = document.getElementById('alert-message'); // 알림 메시지 요소

    if (selectedAmount < 1000 && selectedAmount !== 0) { // Validate minimum amount
        display.textContent = ''; // Display를 비웁니다
        alertMessage.style.display = 'block'; // 알림 메시지를 표시
        localStorage.removeItem('selectedAmount'); // Remove invalid amount from localStorage
    } else {
        alertMessage.style.display = 'none'; // 알림 메시지를 숨김
        display.textContent = selectedAmount > 0 
            ? `충전할 금액: ${formatNumberWithCommas(selectedAmount)}원` 
            : ''; // Update display with formatted amount or clear it if input is empty
        if (selectedAmount >= 1000) {
            localStorage.setItem('selectedAmount', selectedAmount); // Save valid amount to localStorage
        }
    }
});



// 페이지 로드 시 세션 데이터를 요청하여 사용자 포인트를 표시
window.onload = function() {
    fetch('/api/session/user-info') // API 엔드포인트에 요청
      .then(response => response.json())
      .then(data => {
        // 받은 데이터로 HTML 내용 변경
        document.querySelector("#available-point h5").textContent = `${data.userPoint.toLocaleString()}${" 포인트"}`;
      })
      .catch(error => console.error('Error fetching session data:', error));
};

const fetchUserInfo = async () => {
    try {
        const response = await fetch('/api/session/user-id');
        if (!response.ok) {
            console.error("Response not OK: ", response)
            alert("로그인 되어 있지 않습니다.");
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

// 충전하기 버튼 클릭 시 카카오페이 결제 요청
async function chargePoint() {
    const selectedAmount = parseInt(localStorage.getItem('selectedAmount')) || 0;
    const userInfo = await fetchUserInfo();
    const userId = userInfo.userId;

    if (selectedAmount <= 0) {
        alert('충전하실 금액을 선택하거나 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item_name: '포인트 충전',
                quantity: 1,
                total_amount: selectedAmount,
                userId: userId
            })
        });

        const data = await response.json();

        if (data.url) {
            // 카카오페이 결제 페이지로 리다이렉트
            window.location.href = data.url;
        // } else if (data.successUrl) {
        //     // 결제 성공 시 successUrl로 이동
        //     window.location.href = data.successUrl;
        } else {
            alert('결제 요청에 실패했습니다.');
        }
    } catch (error) {
        console.error('결제 요청 오류:', error);
        alert('결제 요청 중 오류가 발생했습니다.');
    }
}

// '충전하기' 버튼에 이벤트 리스너 추가
document.getElementById('button-container-charge').addEventListener('click', chargePoint);
