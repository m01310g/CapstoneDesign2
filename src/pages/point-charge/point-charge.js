const display = document.querySelector('#display');
    const amountBtns = document.querySelectorAll('.amount');
    const inputField = document.querySelector('#inputField');
    const selfBtn = document.querySelector('#self');

    amountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.innerText; // 클릭한 버튼의 텍스트를 가져옴
            display.textContent = `충전할 금액: ${amount}원`; // 금액 표시 업데이트
            inputField.style.display = 'none'; // 입력 필드 숨김
            selfBtn.style.display = 'block'; // 직접입력 버튼 보이기
        });
    });

    selfBtn.addEventListener('click', () => {
        inputField.style.display = 'block'; // 입력 필드 보이기
        selfBtn.style.display = 'none'; // 직접입력 버튼 숨김
        display.textContent = ''; // 디스플레이 초기화
        inputField.focus(); // 입력 필드에 포커스
    });

    inputField.addEventListener('input', () => {
        const amount = inputField.value; // 입력된 값을 가져옴
        display.textContent = `충전할 금액: ${amount}원`; // 금액 표시 업데이트 
    });