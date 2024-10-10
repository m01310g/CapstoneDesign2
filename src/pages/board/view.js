const boardsStr = localStorage.getItem("boards");
// localStorage에 저장된 item: string 형태로 저장되어 있음 -> parse를 통해 array로 변환
const boardsObj = JSON.parse(boardsStr);

// 쿼리스트링의 객체 불러오기
const params = new URLSearchParams(window.location.search);
const index = params.get("index");

const board = boardsObj[index];

const subjectDiv = document.querySelector("#subject");
const categoryDiv = document.querySelector("#category");
const dateDiv = document.querySelector("#date");
const contentDiv = document.querySelector("#content");
const capacityDiv = document.querySelector("#capacity");

const currentCapacity = board.currentCapacity;  // 현재 인원
const maxCapacity = parseInt(board.maxCapacity); // 최대 인원

categoryDiv.innerText = board.category;
subjectDiv.innerText = board.subject;
dateDiv.innerText = board.date;
contentDiv.innerText = board.content;
capacityDiv.innerHTML = `<span class="current-capacity">${currentCapacity}</span> / ${maxCapacity}`;

const modifyBtn = document.querySelector("#modify");

const handleModifyBtn = (event) => {
    event.preventDefault();
    location.href = "./modify.html?index=" + index;
    backLink.addEventListener("click", () => {
        window.history.back();
    });
}

modifyBtn.addEventListener("click", handleModifyBtn);

// 뒤로 가기 버튼
const backLink = document.querySelector("#back-link");
const category = document.querySelector("#category").innerText;

let selectedCategory = "";

if (category === "택배") {
    selectedCategory = "package";
} else if (category === "배달") {
    selectedCategory = "delibery";
} else if (category === "택시") {
    selectedCategory = "taxi";
}

backLink.setAttribute("href", `../post/${selectedCategory}.html`);

// 삭제 버튼
const deleteBtn = document.querySelector("#delete");
deleteBtn.addEventListener("click", () => {
    boardsObj.splice(index, 1);
    for (let i = 0; i < boardsObj.length; i++) {
        boardsObj[i].index = i;
    }

    const setBoardsStr = JSON.stringify(boardsObj);
    localStorage.setItem("boards", setBoardsStr);
    location.href = `../post/${selectedCategory}.html`;
});

const participationBtn = document.querySelector("#participation");

// YYYY년 MM월 DD일 HH시 mm분을 Date 객체로 변환
const parseDate = (dateStr) => {
    const dateParts = dateStr.match(/(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분/);
    if (!dateParts) return null;
    const [_, year, month, day, hour, minute] = dateParts;

    // Date 객체로 변환
    return new Date(year, month - 1, day, hour, minute);
}


// 페이지 로드 시 참여 버튼 상태
const checkCapacityStatus = () => {
    const currentCapacity = board.currentCapacity;
    const startDate = parseDate(board.startDate);
    const endDate = parseDate(board.endDate);
    const currentDate = new Date();
    const price = (board.price / board.maxCapacity).toFixed(2);

    if (currentDate < startDate) {
        // participationBtn.innerText = "모집 예정";
        participationBtn.innerHTML = `
            <div id="price-container">인당 <span id="price">${price}</span>원씩 부담하면 돼요!</div>
            <div id="participate">모집 예정</div>
        `;
        participationBtn.style.backgroundColor = "grey";
        participationBtn.style.pointerEvents = "none";
        document.querySelector(".current-capacity").style.color = "grey";
    } else if ((currentCapacity >= maxCapacity) || (currentDate > endDate)) {
        // participationBtn.innerText = "모집 완료";
        participationBtn.innerHTML = `<div id="participate">모집 완료</div>`
        participationBtn.style.backgroundColor = "grey";
        participationBtn.style.pointerEvents = "none";

        document.querySelector(".current-capacity").style.color = "red";
    } else {
        // participationBtn.innerText = "참여하기";
        participationBtn.innerHTML = `
            <div id="price-container">인당 <span id="price">${price}</span>원씩 부담하면 돼요!</div>
            <div id="participate">참여하기</div>
        `;
        participationBtn.style.backgroundColor = "#F5AF12";
        participationBtn.style.pointerEvents = "auto";
        document.querySelector(".participation-container").style.padding = "3.75rem"
    }
}

// 로드 시 상태 확인
checkCapacityStatus();

// 참여하기 버튼 클릭 이벤트
participationBtn.addEventListener("click", (event) => {
    event.preventDefault();

    let currentCapacity = board.currentCapacity;

    // 현재 인원 수 증가
    if (currentCapacity < maxCapacity) {
        currentCapacity += 1;
        board.currentCapacity = currentCapacity;
        const updateBoardsObj = boardsObj.map((b, idx) => {
            if (idx === index) {
                return { ...b, currentCapacity: board.currentCapacity };
            }
            return b;
        });

        const setBoardsStr = JSON.stringify(updateBoardsObj);
        localStorage.setItem("boards", setBoardsStr);

        // UI 업데이트
        capacityDiv.innerHTML = `<span class="current-capacity">${board.currentCapacity}</span> / ${maxCapacity}`;

        checkCapacityStatus();
    }
})