const buttons = document.querySelectorAll("button");
const displayElement = document.querySelector(".input");
const plusMinus = document.querySelector(".plus-minus");
const percentage = document.querySelector(".percentage");
const miniDisplayElement = document.querySelector(".mini-display"); // 미니 디스플레이 추가

let operatorOn = "";    // 연산자 입력
let previousNum = "";   // 이전 값 저장
let recentNum = "";     // 최근 값 저장
let isFirstDigit = true; // 첫 번째 숫자 여부 판단
let hasCalculated = false; // "=" 클릭 후 계산 결과가 표시되었는지 여부
let shouldMultiply = false; // +/- 또는 % 후에 곱셈을 해야 하는지 여부

// 계산 함수
const calculate = (num1, op, num2) => {
    let result = 0;
    switch(op) {
        case "+":
            result = Number(num1) + Number(num2);
            break;
        case "-":
            result = Number(num1) - Number(num2);
            break;
        case "x":
            result = Number(num1) * Number(num2);
            break;
        case "/":
            result = Number(num1) / Number(num2);
            break;
        default:
            break;
    }
    return String(result);
}

// 미니 디스플레이 업데이트 함수
const updateMiniDisplay = () => {
    // 계산 후 결과가 나왔을 경우에는 미니 디스플레이 업데이트를 중지
    if (!hasCalculated) {
        let displayText = `${formatNumberWithParentheses(previousNum)} ${operatorOn} ${formatNumberWithParentheses(recentNum)}`;
        miniDisplayElement.textContent = displayText.trim(); // 미니 디스플레이에 표시
    }
}

// 숫자 클릭 시 처리 함수
const handleNumberClick = (click) => {
    if (isFirstDigit && (click === "0" || click === "00")) {
        return; // 처음 숫자가 0으로 시작하지 않도록
    }

    // +/- 또는 % 후에 숫자를 입력하면 곱셈 처리
    if (shouldMultiply) {
        if (operatorOn === "") {
            operatorOn = "x"; // 연산자가 없을 때 곱셈 연산자를 자동으로 추가
        }
        shouldMultiply = false; // 곱셈 플래그 초기화
    }

    if (hasCalculated) {
        // 계산이 완료된 후 새로 입력하면 화면을 초기화하고 시작
        displayElement.textContent = "";
        miniDisplayElement.textContent = "";
        hasCalculated = false;
        previousNum = "";
        recentNum = "";
    }

    displayElement.textContent += click; // 숫자 클릭에 따라 화면에 표시

    if (operatorOn === "") {
        previousNum = displayElement.textContent; // 연산자 없으면 이전 숫자에 저장
    } else {
        recentNum = displayElement.textContent; // 연산자 클릭 후 두 번째 숫자에 저장
    }
    isFirstDigit = false;
    updateMiniDisplay(); // 미니 디스플레이 업데이트
}

// 연산자 클릭 시 처리 함수
const handleOperatorClick = (click) => {
    if (previousNum !== "") {
        if (recentNum === "") {
            operatorOn = click; // 연산자 저장, 이전 연산자는 덮어씀
        } else {
            // 최근 숫자가 입력된 상태에서 연산자를 클릭하면 계산을 먼저 실행
            previousNum = calculate(previousNum, operatorOn, recentNum); // 이전 결과 계산 후 저장
            recentNum = "";
            operatorOn = click; // 새로운 연산자로 덮어쓰기
        }
        displayElement.textContent = ""; // 화면 초기화 후 다음 숫자 입력 대기
        isFirstDigit = true; // 첫 번째 숫자 플래그 리셋
        updateMiniDisplay(); // 미니 디스플레이 업데이트
    }
}

// "=" 버튼 클릭 시 처리 함수
const handleResultClick = () => {
    if (previousNum !== "" && recentNum !== "") {
        const result = calculate(previousNum, operatorOn, recentNum);
        displayElement.textContent = result; // 결과 출력
        // 미니 디스플레이에 수식만 남기고 "=" 기호는 추가하지 않음
            miniDisplayElement.textContent = `${formatNumberWithParentheses(previousNum)} ${operatorOn} ${formatNumberWithParentheses(recentNum)}`;
        previousNum = result; // 결과를 이전 숫자에 저장
        recentNum = "";
        operatorOn = "";
        isFirstDigit = true;
        hasCalculated = true; // 계산 완료 플래그 설정
    }
}


// "C" 버튼 클릭 시 초기화 함수
const clearAll = () => {
    displayElement.textContent = "";
    miniDisplayElement.textContent = ""; // 미니 디스플레이도 초기화
    previousNum = "";
    recentNum = "";
    operatorOn = "";
    isFirstDigit = true;
    hasCalculated = false; // 초기화 시 계산 완료 상태도 해제
}

// +/- 버튼 클릭 시 부호 변경 함수
const handlePlusMinusClick = () => {
    if (operatorOn === "") {
        // 연산자가 입력되지 않은 경우 이전 숫자의 부호 변경
        if (previousNum !== "") {
            previousNum = String(Number(previousNum) * -1); // 부호 변경
            displayElement.textContent = formatNumberWithParentheses(previousNum); // 부호에 따라 괄호로 감싸서 표시
        }
    } else {
        // 연산자가 입력된 경우 최근 숫자의 부호 변경
        if (recentNum !== "") {
            recentNum = String(Number(recentNum) * -1); // 부호 변경
            displayElement.textContent = formatNumberWithParentheses(recentNum); // 부호에 따라 괄호로 감싸서 표시
        }
    }
    updateMiniDisplay(); // 미니 디스플레이 업데이트
    shouldMultiply = true; // 다음 숫자 입력 시 곱셈 처리
}

// 부호에 따라 숫자를 괄호로 감싸는 함수
const formatNumberWithParentheses = (num) => {
    return Number(num) < 0 ? `(${num})` : num; // 음수일 때 괄호로 감쌈
}

// % 버튼 클릭 시 처리 함수
const handlePercentageClick = () => {
    if (operatorOn === "") {
        // 연산자가 입력되지 않은 경우 이전 숫자의 백분율 계산
        if (previousNum !== "") {
            previousNum = String(Number(previousNum) / 100);
            displayElement.textContent = formatNumberWithParentheses(previousNum);
        }
    } else {
        // 연산자가 입력된 경우 최근 숫자의 백분율 계산
        if (recentNum !== "") {
            recentNum = String(Number(recentNum) / 100);
            displayElement.textContent = formatNumberWithParentheses(recentNum);
        }
    }
    updateMiniDisplay(); // 미니 디스플레이 업데이트
    shouldMultiply = true; // 다음 숫자 입력 시 곱셈 처리
}

// 버튼 클릭 이벤트 처리 함수
const handleButtonClick = (e) => {
    const target = e.target;
    let action = target.classList[0];
    let click = target.innerHTML;

    if (action === "numBtn") {
        handleNumberClick(click);
    } else if (action === "operator") {
        handleOperatorClick(click);
    } else if (action === "result") {
        handleResultClick();
    } else if (action === "clear") {
        clearAll();
    } else if (action === "plus-minus") { // +/- 버튼 클릭 시 부호 변경 처리
        handlePlusMinusClick();
    } else if (action === "percentage") {
        handlePercentageClick();
    }
}

// 계산기 초기화 함수
const calculator = () => {
    buttons.forEach((item) => {
        item.addEventListener("click", handleButtonClick);
    });
}

// 계산기 실행
calculator();