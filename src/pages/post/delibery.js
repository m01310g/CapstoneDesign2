const boardsStr = localStorage.getItem("boards") || [];
const boardsObj = JSON.parse(boardsStr);

const subCategory = document.querySelector(".btn-select");
const listItems = document.querySelectorAll(".list-member li");
const iframe = document.querySelector("iframe");

// 카테고리 버튼 클릭 이벤트
listItems.forEach(item => {
    item.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        // const selectedSubCategory = subCategory.innerText;
        subCategory.innerText = category; // 선택된 카테고리 표시

        const iframeSrc = `../board/list.html?category=delibery&subCategory=${encodeURIComponent(category)}`;
        iframe.src = iframeSrc;
    });
});