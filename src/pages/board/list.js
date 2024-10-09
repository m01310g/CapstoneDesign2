let boardsStr = localStorage.getItem("boards") || "[]"; // default to empty array string
const boardsObj = JSON.parse(boardsStr);

const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get("category");
const selectedSubCategory = params.get("subCategory") || "전체";

let category = "";

if (selectedCategory === "delibery") {
    category = "배달";
} else if (selectedCategory === "package") {
    category = "택배";
} else if (selectedCategory === "taxi") {
    category = "택시";
}

// YYYY년 MM월 DD일 HH시 mm분을 Date 객체로 변환
const parseDate = (dateStr) => {
    const dateParts = dateStr.match(/(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분/);
    if (!dateParts) return null;
    const [_, year, month, day, hour, minute] = dateParts;

    // Date 객체로 변환
    return new Date(year, month - 1, day, hour, minute);
}

// 게시글 템플릿
const template = (index, objValue) => {
    const currentDate = new Date();
    const startDate = parseDate(objValue.startDate);
    const endDate = parseDate(objValue.endDate);

    const currentCapacity = objValue.currentCapacity;
    const maxCapacity = parseInt(objValue.maxCapacity);

    console.log(startDate);

    let statusText = "";
    let statusClass = "";

    if (currentDate < startDate) {
        statusText = "모집 예정";
        statusClass = "status-pending";
    } else if ((currentDate >= startDate && currentDate <= endDate) && (currentCapacity < maxCapacity)) {
        statusText = "모집 중";
        statusClass = "status-active";
    } else if ((currentDate > endDate) || (currentCapacity === maxCapacity)) {
        statusText = "모집 완료";
        statusClass = "status-closed";
    }

    if (category === "택시") {
        return `
        <a class="board-link" href="./view.html?index=${index}&category=${category}&subCategory=${selectedSubCategory}" target="_top">
            <div id="content-container">
                <div id="subject">${objValue.subject}</div>
                <div id="route">${objValue.departure.address} ➡️ ${objValue.destination.address}</div>
                <div id="status" class="${statusClass}">${statusText}</div>
                <div id="date">${objValue.date}</div>
            </div>
            <div id="capacity-container">
                <span class="${statusClass}">${objValue.currentCapacity}</span>
                / ${objValue.maxCapacity}
            </div>
        </a>
        <hr>        
        `;
    } else {
    
        return `
        <a class="board-link" href="./view.html?index=${index}&category=${category}&subCategory=${selectedSubCategory}" target="_top">
            <div id="content-container">
                <div id="subject">${objValue.subject}</div>
                <div id="status" class="${statusClass}">${statusText}</div>
                <div id="date">${objValue.date}</div>
            </div>
            <div id="capacity-container">
                <span class="${statusClass}">${objValue.currentCapacity}</span>
                / ${objValue.maxCapacity}
            </div>
        </a>
        <hr>        
        `;
    }
}

// 게시글 필터링
const filterBoards = () => {
    let filteredBoards =  selectedSubCategory === "전체"
    ? boardsObj.filter(board => board.category === category)
    : boardsObj.filter(board => board.category === category && board.subCategory === selectedSubCategory); // 필터링

    const searchKeyword = params.get("search") || "";

    // 검색 키워드로 필터링
    if (searchKeyword) {
        filteredBoards = filteredBoards.filter(board => board.subject.includes(searchKeyword));
    }

    filteredBoards.sort((a, b) => b.index - a.index);

    const board = document.querySelector(".board");
    board.innerHTML = "";   // 기존 게시글 목록 초기화

    // 게시글 표시
    if (filteredBoards.length === 0) {
        if (searchKeyword) {
            board.innerHTML = `<div class="post">"${searchKeyword}"에 대한 검색 결과가 없습니다.</div>`;
        } else {
            board.innerHTML = '<div class="post">해당 카테고리의 게시글이 없습니다.</div>';
        }
    } else {
        filteredBoards.forEach((objValue) => {
            const index = boardsObj.findIndex(board => board === objValue);
            board.innerHTML += template(index, objValue);
        });
    }
}

// 첫 화면 로딩 시 전체 게시글 표시
filterBoards("");