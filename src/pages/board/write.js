const recordDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    month = (month > 9 ? "" : 0) + month;
    day = (day > 9 ? "" : 0) + day;

    return `${year}년 ${month}월 ${day}일`;
}

class Board {
    constructor(indexNum, subjectStr, contentStr) {
        this.index = indexNum;
        this.Subject = subjectStr;
        this.Content = contentStr;
        this.date = recordDate();
        this.views = 0;
    }

    set Subject(value) {
        if (value.length === 0) throw new Error("제목을 입력해주세요.");
        this.subject = value;
    }

    set Content(value) {
        if (value.length === 0) throw new Error("내용을 입력해주세요.");
        this.content = value;
    }
}

const writeFrm = document.querySelector("#writeFrm");

const handleSubmit = (event) => {
    event.preventDefault();

    const subject = event.target.subject.value;
    const content = event.target.content.value;

    try {
        // boards 가져오기
        const boardsObj = JSON.parse(localStorage.getItem("boards"));

        // 객체 추가
        const index = boardsObj.length;
        const instance = new Board(index, subject, content);
        boardsObj.push(instance);

        // boards 저장
        const boardsStr = JSON.stringify(boardsObj);
        localStorage.setItem("boards", boardsStr);
        location.href = "/board/view.html?index=" + index;
    } catch (err) {
        // 예외 발생 시 처리
        alert(err.message);
        console.error(err);
    }
}

writeFrm.addEventListener("submit", handleSubmit);