const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get("category");
const selectedSubCategory = params.get("subCategory") || "전체";
const searchKeyword = params.get("search");

let category = "";

if (selectedCategory === "delivery") {
    category = "배달";
} else if (selectedCategory === "package") {
    category = "택배";
} else if (selectedCategory === "taxi") {
    category = "택시";
}

const encodeToBase64 = (str) => {
    return btoa(encodeURIComponent(str));
}

// YYYY년 MM월 DD일 HH시 mm분을 Date 객체로 변환
const parseDate = (dateStr) => {
    const dateParts = dateStr.match(/(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분/);
    if (!dateParts) return null;
    const [_, year, month, day, hour, minute] = dateParts;

    // Date 객체로 변환
    return new Date(year, month - 1, day, hour, minute);
};

const formatDate = (dateStr) => {
    const match = dateStr.match(/\d{2}월 \d{2}일 \d{2}시 \d{2}분/);
    return match ? match[0] : '';
};

const fetchData = async () => {
    try {
        const response = await fetch(`/api/post?category=${encodeToBase64(category)}&subCategory=${encodeToBase64(selectedSubCategory)}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const postData = await response.json();
        // 데이터를 가져온 후 게시글 필터링 및 표시
        filterPosts(postData);
    } catch (error) {
        console.error("Fetch error: ", error);
    }
};

// 게시글 템플릿
const template = (objValue) => {
    const currentDate = new Date();
    const startDate = parseDate(objValue.start_date);
    const endDate = parseDate(objValue.end_date);

    const currentCapacity = objValue.current_capacity;
    const maxCapacity = parseInt(objValue.max_capacity);

    const startDateFormatted = formatDate(objValue.start_date);
    const endDateFormatted = formatDate(objValue.end_date);

    let statusText = "";
    let statusClass = "";

    if (currentDate < startDate) {
        statusText = "모집 예정";
        statusClass = "status-pending";
    } else if ((currentDate >= startDate && currentDate <= endDate) && (currentCapacity < maxCapacity)) {
        statusText = "모집 중";
        statusClass = "status-active";
    } else if ((currentDate > endDate) || (currentCapacity === maxCapacity)) {
        statusText = "모집 완료";
        statusClass = "status-closed";
    }

    if (category === "택시") {
        return `
        <a class="board-link" href="/post/view?index=${objValue.post_index - 1}&category=${encodeToBase64(category)}&subCategory=${encodeToBase64(selectedSubCategory)}" target="_top">
            <div id="content-container">
                <div id="subject">${objValue.title}</div>
                <div id="route">${objValue.departure.replace(/"/g,"")} ➡️ ${objValue.destination.replace(/"/g,"")}</div>
                <div id="date">${startDateFormatted} ~ ${endDateFormatted}</div>
                <div id="status" class="${statusClass}">${statusText}</div>
            </div>
            <div id="capacity-container">
                <span class="${statusClass}">${objValue.current_capacity}</span>
                / ${objValue.max_capacity}
            </div>
        </a>
        <hr>        
        `;
        // <div id="date">${startDateFormatted} ~ ${endDateFormatted}</div>
    } else {
        return `
        <a class="board-link" href="/post/view?index=${objValue.post_index - 1}&category=${encodeToBase64(category)}&subCategory=${encodeToBase64(selectedSubCategory)}" target="_top">
            <div id="content-container">
                <div id="subject">${objValue.title}</div>
                <div id="location">수령지: ${objValue.location.replace(/"/g,"")}</div>
                <div id="status" class="${statusClass}">${statusText}</div>
            </div>
            <div id="capacity-container">
                <span class="${statusClass}">${objValue.current_capacity}</span>
                / ${objValue.max_capacity}
            </div>
        </a>
        <hr>        
        `;
    }
};

// 게시글 필터링
const filterPosts = (data) => {
    let filteredData = data.filter(item => {
        return selectedCategory !== "전체"
            ? item.category === category
            : item.category === category && item.sub_category === selectedSubCategory;
    });

    if (searchKeyword) {
        filteredData = filteredData.filter(item => item.title.includes(searchKeyword));
    }

    filteredData.sort((a, b) => b.post_index - a.post_index);

    const board = document.querySelector(".board");
    board.innerHTML = "";   // 기존 게시글 목록 초기화

    // 게시글 표시
    if (filteredData.length === 0) {
        board.innerHTML = selectedSubCategory === "전체"
        ? board.innerHTML = '<div class="post">해당 카테고리의 게시글이 없습니다.</div>'
        : board.innerHTML = `<div class="post">${selectedSubCategory}에 대한 게시글이 없습니다.</div>`;
    } else {
        filteredData.forEach((objValue, index) => {
            board.innerHTML += template(objValue);
        });
    }
};

// 첫 화면 로딩 시 전체 게시글 표시
document.addEventListener("DOMContentLoaded", fetchData);