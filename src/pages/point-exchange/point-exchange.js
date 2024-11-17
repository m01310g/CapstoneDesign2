const exchangeButton = document.getElementById('exchangeButton');
const inputField = document.getElementById('inputField');

// 숫자에 콤마 추가
const formatNumberWithCommas = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

// 환전 버튼 클릭 시, 입력란 표시 또는 환전 요청 실행
exchangeButton.addEventListener('click', async () => {
    // if (inputField.style.display === 'none' || inputField.style.display === '') {
    //     inputField.style.display = 'block';
    //     inputField.focus();
    //     exchangeButton.textContent = '확인';
    // } else {
        const amount = inputField.value.replace(/,/g, '');
        if (amount) {
            localStorage.setItem('selectedAmount', amount); // 입력된 금액을 localStorage에 저장
            // await exchangePoint(); // 환전 요청 실행
            // location.reload(); // 페이지 새로고침
        } else {
            alert('환전할 금액을 입력하세요.');
        }
    // }
});

// 페이지 로드 시 세션 데이터 요청
window.onload = async function() {
    try {
        const response = await fetch('/api/session/user-info');
        const data = await response.json();
        document.querySelector("#available-point h5").textContent = `${data.userPoint.toLocaleString()} 포인트`;
    } catch (error) {
        console.error('세션 데이터 요청 오류:', error);
    }
};

const exchangePoint = async (userId, selectedAmount) => {
    if (selectedAmount <= 0) {
        alert('환전할 금액을 입력하세요.');
        return;
    }

    try {
        const response = await fetch('/exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, selectedAmount })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`송금 완료: ${data.message}`);
            window.location.href = '/point-exchange/success'
        } else {
            alert(data.message || '송금 요청에 실패했습니다.');
            console.error(data.error);
        }
    } catch (error) {
        console.error('송금 요청 오류:', error);
        alert('송금 요청 중 오류가 발생했습니다.');
    }
};

// 사용자의 아이디를 가져오는 비동기 함수
const fetchUserId = async () => {
    const response = await fetch('/api/session/user-id');
    return response.json();
}

const fetchUserInfo = async () => {
    const response = await fetch('/api/session/user-info');
    return response.json();
}

// 환전 버튼 클릭 이벤트 리스너
document.getElementById('exchangeButton').addEventListener('click', async () => {
    const selectedAmount = parseInt(localStorage.getItem('selectedAmount')) || 0;
    console.log(selectedAmount)
    const getUserId = await fetchUserId();
    const userId = getUserId.userId;
    console.log(userId)
    const getUserInfo = await fetchUserInfo();
    const userPoint = getUserInfo.userPoint;


    if (selectedAmount > 0) {
        exchangePoint(userId, selectedAmount);
        localStorage.clear();
    } else if (userPoint < selectedAmount) {
        alert("환전할 금액이 충전되어 있는 금액보다 많을 수 없습니다. 다시 입력해 주세요.");
    } else {
        alert("유효한 금액을 입력하세요.");
    }
});

window.addEventListener("unload", () => localStorage.clear());