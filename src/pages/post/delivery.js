const boardsStr = localStorage.getItem("boards");
const boardsObj = boardsStr ? JSON.parse(boardsStr) : [];

const subCategory = document.querySelector(".btn-select");
const listItems = document.querySelectorAll(".list-member li");
const iframe = document.querySelector("iframe");

const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search");
const searchResult = document.querySelector(".search-result");

const ON_CLASS_NAME = "on";
const HIDDEN_CLASS_NAME = "hidden";

const setIframeAndSaveState = (iframeSrc) => {
    iframe.src = iframeSrc;
    history.pushState({iframeSrc}, "", iframeSrc);
}

// 뒤로 가기/앞으로 가기 시 발생 이벤트
window.addEventListener("popstate", (event) => {
    if (event.state && event.state.iframeSrc) {
        iframe.src = event.state.iframeSrc; // iframe 내용 복원
    }

    // 검색창 초기화
    searchInput.value = "";

    // 검색 결과 div 숨기기
    searchResult.classList.add(HIDDEN_CLASS_NAME);

    const savedSubCategory = localStorage.getItem("selectedSubCategory");
    if (savedSubCategory) {
        subCategory.innerText = savedSubCategory;
        localStorage.removeItem("selectedSubCategory");
    }
});

subCategory.addEventListener("click", () => {
    subCategory.classList.toggle(ON_CLASS_NAME);
});

document.addEventListener("DOMContentLoaded", () => {
    // 검색창 초기화
    searchInput.value = "";

    // 검색 결과 div 숨기기
    searchResult.classList.add(HIDDEN_CLASS_NAME);
    
    const savedSubCategory = localStorage.getItem("selectedSubCategory");
    if (savedSubCategory) {
        subCategory.innerText = savedSubCategory;
        localStorage.removeItem("selectedSubCategory")
    }
});

listItems.forEach(item => {
    item.addEventListener("click", () => {
        subCategory.classList.remove(ON_CLASS_NAME);
    });
});

// 카테고리 버튼 클릭 이벤트
listItems.forEach(item => {
    item.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        subCategory.innerText = category; // 선택된 카테고리 표시
        searchResult.classList.add(HIDDEN_CLASS_NAME);
        searchInput.value = "";

        // localStorage에 선택된 subCategory 저장
        localStorage.setItem("selectedSubCategory", category);

        const iframeSrc = `../board/list.html?category=delivery&subCategory=${encodeURIComponent(category)}`;
        iframe.src = iframeSrc;

        setIframeAndSaveState(iframeSrc);  // 상태 저장 및 iframe 설정(뒤로 가기 용도)
    });
});

searchBtn.addEventListener("click", () => {
    const keyword = searchInput.value.trim();   // 검색어 가져오기
    const subCategoryText = subCategory.innerText;

    if (keyword === "") {   // 검색어 입력 안 할 시 검색 불가
        alert("검색어를 입력해주세요.");
        searchInput.value = "";
        searchResult.classList.add(HIDDEN_CLASS_NAME);

        const iframeSrc = `../board/list.html?category=delivery&subCategory=${subCategoryText}`;
        iframe.src = iframeSrc;
        setIframeAndSaveState(iframeSrc);  // 상태 저장 및 iframe 설정(뒤로 가기 용도)

    } else {
        searchResult.classList.remove(HIDDEN_CLASS_NAME);

        searchResult.innerText = `"${keyword}"(으)로 검색한 결과`;

        const iframeSrc = `../board/list.html?category=delivery&subCategory=${subCategoryText}&search=${encodeURIComponent(keyword)}`;
        iframe.src = iframeSrc;
        setIframeAndSaveState(iframeSrc);  // 상태 저장 및 iframe 설정(뒤로 가기 용도)
    }
});