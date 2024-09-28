let boardsStr = localStorage.getItem("boards");

if (boardsStr === null) {
    const listStr = JSON.stringify([]);
    localStorage.setItem("boards", listStr);
    boardsStr = listStr;
}

// localStorage에서 저장된 데이터 불러오기
const boardsObj = JSON.parse(boardsStr);

const template = (index, objValue) => {
    return `
    <a href="./view.html?index=${objValue.index}">
        <div id="subject">${objValue.subject}</div>
        <div id="date">작성일: ${objValue.date}</div>
        <div id="due">종료 기한: ~${objValue.due}</div>
        <div id="views">조회수: ${objValue.views}</div>
    </a>
    <hr>        
    `
}

const board = document.querySelector(".board");

for (let i = 0; i < boardsObj.length; i++) {
    board.innerHTML += template(i, boardsObj[i]);
}