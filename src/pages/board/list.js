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

// 게시글 템플릿
const template = (index, objValue) => {
    if (category === "택시") {
        return `
        <a href="./view.html?index=${index}&category=${category}&subCategory=${selectedSubCategory}" target="_top">
            <div id="subject">${objValue.subject}</div>
            <div id="route">${objValue.departure} ➡️ ${objValue.destination}</div>
            <div id="date">작성일: ${objValue.date}</div>
            <div id="due">모집 기한: ${objValue.startDate} ~ ${objValue.endDate}</div>
        </a>
        <hr>        
        `;
    } else {
    
        return `
        <a href="./view.html?index=${index}&category=${category}&subCategory=${selectedSubCategory}" target="_top">
            <div id="subject">${objValue.subject}</div>
            <div id="date">작성일: ${objValue.date}</div>
            <div id="due">모집 기한: ${objValue.startDate} ~ ${objValue.endDate}</div>
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

// const writeBtn = document.querySelector("#write-btn");
// writeBtn.addEventListener("click", () => {
//     writeBtn.href = `./write.html?index=${boardsObj.length}`;
// })