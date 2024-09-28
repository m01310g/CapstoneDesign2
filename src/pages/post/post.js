const selectBtn = document.querySelector(".btn-select");
const objTypes = document.querySelector(".list-member");

const searchBtn = document.querySelector(".search-btn");

const searchResult = document.querySelector(".post");
const HIDDEN_CLASS_NAME = "hidden"

const handleBtnClick = () => {
    selectBtn.classList.toggle("on");
}

const handleContentClick = (event) => {
    if (event.target.nodeName === "LI") {
        selectBtn.innerText = event.target.innerText;
        selectBtn.classList.remove("on");
    }
}

selectBtn.addEventListener("click", handleBtnClick);
objTypes.addEventListener("click", handleContentClick);

searchBtn.addEventListener("click", () => {
    searchResult.classList.remove(HIDDEN_CLASS_NAME);
})