const boardsStr = localStorage.getItem("boards");
// localStorage에 저장된 item: string 형태로 저장되어 있음 -> parse를 통해 array로 변환
const boardsObj = JSON.parse(boardsStr);

// 쿼리스트링의 객체 불러오기
const params = new URLSearchParams(window.location.search);
const index = params.get("index");

const board = boardsObj[index];

const viewFrm = document.querySelectorAll("#viewFrm > div");

// 각 id에 맞는 정보 불러오기
for (let i = 0; i < viewFrm.length; i++) {
    const id = viewFrm[i].id;
    viewFrm[i].innerText = board[id];
}

const modifyBtn = document.querySelector("#modify");

const handleModifyBtn = () => {
    location = "./modify.html?index=" + index;
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