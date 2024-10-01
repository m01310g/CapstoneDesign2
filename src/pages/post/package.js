const boardsStr = localStorage.getItem("boards") || [];
const boardsObj = JSON.parse(boardsStr);

const subCategory = document.querySelector(".btn-select");
const listItems = document.querySelectorAll(".list-member li");
const iframe = document.querySelector("iframe");

const ON_CLASS_NAME = "on";

subCategory.addEventListener("click", () => {
    subCategory.classList.toggle(ON_CLASS_NAME);
});

// 카테고리 버튼 클릭 이벤트
listItems.forEach(item => {
    item.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        subCategory.innerText = category; // 선택된 카테고리 표시
        subCategory.classList.remove(ON_CLASS_NAME);

        const iframeSrc = `../board/list.html?category=package&subCategory=${encodeURIComponent(category)}`;
        iframe.src = iframeSrc;
    });
});

const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search");
const searchResult = document.querySelector(".search-result");

searchBtn.addEventListener("click", () => {
    const keyword = searchInput.value.trim();   // 검색어 가져오기
    const subCategoryText = subCategory.innerText;

    searchResult.innerText = `"${keyword}"(으)로 검색한 결과`;

    const iframeSrc = `../board/list.html?category=package&subCategory=${subCategoryText}&search=${encodeURIComponent(keyword)}`;
    iframe.src = iframeSrc;
});