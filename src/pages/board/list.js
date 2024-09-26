let boardsStr = localStorage.getItem("boards");

if (boardsStr === null) {
    const listStr = JSON.stringify([]);
    localStorage.setItem("boards", listStr);
    boardsStr = listStr;
}

// localStorage에서 저장된 데이터 불러오기
const boardsObj = JSON.parse(boardsStr);

const template = (objValue) => {
    return `
    <div>
        <div id="subject">${objValue.subject}</div>
        <div id="date">작성일: ${objValue.date}</div>
        <div id="views">조회수: ${objValue.views}</div>
        <hr>
    </div>        
    `
}

const board = document.querySelector(".board");

for (let i = 0; i < boardsObj.length; i++) {
    board.innerHTML += template(boardsObj[i]);
}