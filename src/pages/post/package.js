const posts = [
    { id: 1, title: "건강식품 게시글", category: "건강식품" },
    { id: 2, title: "문구ㆍ도서 게시글", category: "문구ㆍ도서" },
    { id: 3, title: "반려동물용품 게시글", category: "반려동물용품" },
    { id: 4, title: "생활용품 게시글", category: "생활용품" },
    { id: 5, title: "식품 게시글", category: "식품" },
    { id: 6, title: "의류 게시글", category: "의류" },
    { id: 7, title: "화장품 게시글", category: "화장품" },
];

const postContainer = document.getElementById('post-container');
const listItems = document.querySelectorAll('.list-member li');
const btnSelect = document.querySelector('.btn-select');

const ON_CLASS_NAME = "on";

// 게시글 필터링 함수
function filterPosts(category) {
    postContainer.innerHTML = ''; // 기존 게시글 제거
    const filteredPosts = category === "전체" 
        ? posts 
        : posts.filter(post => post.category === category);

    if (filteredPosts.length === 0) {
        postContainer.innerHTML = '<div class="package-post">해당 카테고리의 게시글이 없습니다.</div>';
    } else {
        filteredPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'package-post';
            postElement.innerText = post.title;
            postContainer.appendChild(postElement);
        });
    }
}

// 처음 페이지 로드 시 전체 게시글 보여주기
filterPosts('전체');

// 카테고리 버튼 클릭 이벤트
listItems.forEach(item => {
    item.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        btnSelect.innerText = category; // 선택된 카테고리 표시
        filterPosts(category); // 게시글 필터링
        btnSelect.classList.remove(ON_CLASS_NAME);
    });
});