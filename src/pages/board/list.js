// let boardsStr = localStorage.getItem("boards");

// if (boardsStr === null) {
//     const listStr = JSON.stringify([]);
//     localStorage.setItem("boards", listStr);
//     boardsStr = listStr;
// }

// // localStorage에서 저장된 데이터 불러오기
// const boardsObj = JSON.parse(boardsStr);

// const template = (index, objValue) => {
//     return `
//     <a href="./view.html?index=${objValue.index}" target="_top">
//         <div id="subject">${objValue.subject}</div>
//         <div id="date">작성일: ${objValue.date}</div>
//         <div id="due">모집 기한: ${objValue.startDate} ~ ${objValue.endDate}</div>
//     </a>
//     <hr>        
//     `
// }

// const board = document.querySelector(".board");

// for (let i = 0; i < boardsObj.length; i++) {
//     board.innerHTML += template(i, boardsObj[i]);
// }

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
    return `
    <a href="./view.html?index=${index}" target="_top">
        <div id="subject">${objValue.subject}</div>
        <div id="date">작성일: ${objValue.date}</div>
        <div id="due">모집 기한: ${objValue.startDate} ~ ${objValue.endDate}</div>
    </a>
    <hr>        
    `;
}

// const filteredBoards = selectedSubCategory !== "전체"
//     ? boardsObj.filter(board => board.category === category && board.subCategory === selectedSubCategory)
//     : boardsObj.filter(board => board.category === category);

// 게시글 필터링
const filteredBoards = selectedSubCategory === "전체"
    ? boardsObj.filter(board => board.category === category)
    : boardsObj.filter(board => board.category === category && board.subCategory === selectedSubCategory); // 필터링

const board = document.querySelector(".board");

// 게시글 표시
if (filteredBoards.length === 0) {
    board.innerHTML = '<div class="delibery-post">해당 카테고리의 게시글이 없습니다.</div>';
} else {
    filteredBoards.forEach((objValue, index) => {
        board.innerHTML += template(index, objValue);
    });
}