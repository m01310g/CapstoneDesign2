const buttons = document.querySelectorAll("button");
const operators = document.querySelectorAll(".operator");
const displayElement = document.querySelector(".input");
const result = document.querySelector(".result");

let operatorOn = '';    // 연산자 입력
let previousNum = '';   // 이전 값 저장
let recentNum = '';     // 최근 값 저장

let calculate = (num1, op, num2) => {
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
        case "+/-":
            
        default:
            break;
    }
    return String(result);
}

let calculator = () => {
    let isFirstDigit = true;    // 첫 번째 숫자 여부 판단
    buttons.forEach((item) => {
        item.addEventListener("click", (e) => {
            let action = e.target.classList[0];
            let click = e.target.innerHTML;
            console.log(e);

            // 연산자 클릭시
            if (action === "operator") {
                operatorOn = click;
                previousNum = displayElement.textContent;
                displayElement.textContent = "";
                isFirstDigit = true;
                // 연산자 클릭시 다음 숫자는 첫 번째 숫자
            }
             
            // 숫자 클릭시
            if (action === "numBtn") {
                if (isFirstDigit && click === "0") {
                    // 첫 번째 숫자이고 입력된 값이 0인 경우
                    return ;
                }

                if (displayElement.textContent === "" && operatorOn === "") {
                    // 창이 비어 있고 연산자를 누르지 않은 경우
                    displayElement.textContent = click;
                    previousNum = displayElement.textContent;
                } else if (displayElement.textContent !== "" && operatorOn === "") {
                    // 창이 비어 있지 않고 연산자를 눌렀을 경우
                    displayElement.textContent = displayElement.textContent + click;
                    previousNum = displayElement.textContent;
                } else if (displayElement.textContent === "" && operatorOn !== "") {
                    // 창이 비어 있고 연산자를 눌렀을 경우
                    displayElement.textContent = click;
                    recentNum = displayElement.textContent;
                } else if (displayElement.textContent !== "" && operatorOn !== "") {
                    //  창이 비어 있지 않고 연산자를 누르지 않은 경우
                    displayElement.textContent = displayElement.textContent + click;
                    recentNum = displayElement.textContent;
                }
                // 첫 번째 숫자가 입력되면 false로 전환
                isFirstDigit = false;
            }

            // = 클릭시 calculate 함수 실행
            if (action === "result") {
                displayElement.textContent = calculate(previousNum, operatorOn, recentNum);
                // 결과 표시 후 다음 숫자는 첫 번째 숫자가 됨
                isFirstDigit = true;
            }

            if (action === "clear") {
                displayElement.textContent = "";
                previousNum = "";
                operatorOn = "";
                recentNum = "";
                // 할당 초기화 후 다음 숫자는 첫 번째 숫자가 됨
                isFirstDigit = true;
            }
        });
    });
}

calculator();