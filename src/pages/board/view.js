// 쿼리스트링의 객체 불러오기
const params = new URLSearchParams(window.location.search);
const index = params.get("index");
const viewCategory = params.get("category");

let post;

// db에 저장된 게시물 정보 가져오기
const fetchBoardDetails = async () => {
    try {
        const response = await fetch(`/api/post/view/${index}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        renderBoardDetails(data);
    } catch (error) {
        console.error("게시물 정보를 가져오는 중 오류 발생: ", error);
    }
};

// 게시물 정보 DOM에 렌더링
const renderBoardDetails = (data) => {
    post = data;
    const subjectDiv = document.querySelector("#subject");
    const categoryDiv = document.querySelector("#category");
    const dateDiv = document.querySelector("#date");
    const contentDiv = document.querySelector("#content");
    const capacityDiv = document.querySelector("#capacity");
    const locationDiv = document.querySelector("#location-container");

    subjectDiv.innerText = data.title;
    categoryDiv.innerText = data.category;
    dateDiv.innerText = `${data.start_date} ~ ${data.end_date}`;
    contentDiv.innerText = data.content;
    capacityDiv.innerHTML = `<span class="current-capacity">${data.current_capacity}</span> / <span class="max-capacity">${data.max_capacity}</span>`;

    if (viewCategory === "택시") {
        const departureText = JSON.parse(data.departure).address;
        const destinationText = JSON.parse(data.destination).address;
        locationDiv.innerText = `${departureText} ➡️ ${destinationText}`;
    } else {
        const locationText = JSON.parse(data.location).address;
        locationDiv.innerText = `수령지: ${locationText}`;
    }
};

const modifyBtn = document.querySelector("#modify");

const handleModifyBtn = (event) => {
    event.preventDefault();
    location.href = `/post/modify?index=${index}`;
    backLink.addEventListener("click", () => {
        window.history.back();
    });
};

modifyBtn.addEventListener("click", handleModifyBtn);

// 뒤로 가기 버튼
const backLink = document.querySelector("#back-link");
const category = document.querySelector("#category").innerText;

let selectedCategory = "";

if (category === "택배") {
    selectedCategory = "package";
} else if (category === "배달") {
    selectedCategory = "delivery";
} else if (category === "택시") {
    selectedCategory = "taxi";
}

backLink.setAttribute("href", `/category/${selectedCategory}`);

// // 삭제 버튼
// const deleteBtn = document.querySelector("#delete");
// deleteBtn.addEventListener("click", () => {
//     boardsObj.splice(index, 1);
//     for (let i = 0; i < boardsObj.length; i++) {
//         boardsObj[i].index = i;
//     }

//     const setBoardsStr = JSON.stringify(boardsObj);
//     localStorage.setItem("boards", setBoardsStr);
//     location.href = `../post/${selectedCategory}.html`;
// });

const participationBtn = document.querySelector("#participation");

// YYYY년 MM월 DD일 HH시 mm분을 Date 객체로 변환
const parseDate = (dateStr) => {
    const dateParts = dateStr.match(/(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분/);
    if (!dateParts) return null;
    const [_, year, month, day, hour, minute] = dateParts;

    // Date 객체로 변환
    return new Date(year, month - 1, day, hour, minute);
};

// 페이지 로드 시 참여 버튼 상태 확인
const checkCapacityStatus = async () => {
    try {
        const response = await fetch(`/api/post/view/${index}`);
        const data = await response.json();
        const currentCapacity = data.current_capacity;
        const maxCapacity = data.max_capacity;
        const startDate = parseDate(data.start_date);
        const endDate = parseDate(data.end_date);
        const currentDate = new Date();
        const price = (data.price / data.max_capacity).toFixed(2);
        const [intPart, decPart] = price.split(".");
        const formattedIntPart = parseInt(intPart, 10).toLocaleString();
        const formattedPrice = `${formattedIntPart}.${decPart}`;

        if (currentDate < startDate) {
            // participationBtn.innerText = "모집 예정";
            participationBtn.innerHTML = `
                <div id="price-container">인당 <span id="price">${formattedPrice}</span>원씩 부담하면 돼요!</div>
                <div id="participate">모집 예정</div>
            `;
            participationBtn.style.backgroundColor = "grey";
            participationBtn.style.pointerEvents = "none";
            document.querySelector(".current-capacity").style.color = "grey";
        } else if ((currentCapacity >= maxCapacity) || (currentDate > endDate)) {
            // participationBtn.innerText = "모집 완료";
            participationBtn.innerHTML = `<div id="participate">모집 완료</div>`
            participationBtn.style.backgroundColor = "grey";
            participationBtn.style.pointerEvents = "none";

            document.querySelector(".current-capacity").style.color = "red";
        } else {
            // participationBtn.innerText = "참여하기";
            participationBtn.innerHTML = `
                <div id="price-container">인당 <span id="price">${formattedPrice}</span>원씩 부담하면 돼요!</div>
                <div id="participate">참여하기</div>
            `;
            participationBtn.style.backgroundColor = "#F5AF12";
            participationBtn.style.pointerEvents = "auto";
            document.querySelector(".participation-container").style.padding = "3.75rem"
        }
    } catch (error) {
        console.error("참여 버튼 상태 확인 중 오류 발생: ", error);
    }
}

// 로드 시 상태 확인
checkCapacityStatus();

// 참여하기 버튼 클릭 이벤트
participationBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const capacityDiv = document.querySelector("#capacity");

    const response = await fetch(`/api/post/view/${index}`);
    const updatedData = await response.json();

    const currentCapacity = updatedData.current_capacity;
    const maxCapacity = updatedData.max_capacity;

    // 현재 인원 수 증가
    if (currentCapacity < maxCapacity) {
        try {
            console.log(currentCapacity + 1);
            const response = await fetch(`/api/post/update-capacity/${index}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ current_capacity: currentCapacity + 1 })
            });

            if (!response.ok) {
                throw new Error("Failed to update capacity");
            }

            const updatedPost = await response.json();
            // UI 업데이트
            capacityDiv.innerHTML = `<span class="current-capacity">${updatedPost.current_capacity}</span> / ${maxCapacity}`;

            // 상태 업데이트
            checkCapacityStatus();
        } catch (error) {
            console.error("참여하기 버튼 클릭 오류: ", error);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchBoardDetails().then(() => {
        checkCapacityStatus();
        participationBtn.removeEventListener("click", handleParticipation);
        participationBtn.addEventListener("click", handleParticipation);
    });
});

const handleParticipation = async (event) => {
    event.preventDefault();
    const capacityDiv = document.querySelector("#capacity");

    const updatedData = await fetchBoardDetails();

    const currentCapacity = updatedData.current_capacity;
    const maxCapacity = updatedData.max_capacity;

    if (currentCapacity < maxCapacity) {
        try {
            const response = await fetch(`/api/post/update-capacity/${index}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ current_capacity: currentCapacity + 1 })
            });

            if (!response.ok) {
                throw new Error("Failed to update capacity");
            }

            const updatedPost = await response.json();
            // UI 업데이트
            capacityDiv.innerHTML = `<span class="current-capacity">${updatedPost.current_capacity}</span> / ${maxCapacity}`;

            // 상태 업데이트
            checkCapacityStatus();
        } catch (error) {
            console.error("참여하기 버튼 클릭 오류: ", error);
        }
    }
};