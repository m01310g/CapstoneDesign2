const base64ToUtf8 = (str) => {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// 쿼리스트링의 객체 불러오기
const params = new URLSearchParams(window.location.search);
const index = parseInt(params.get("index"));
const viewCategory = base64ToUtf8(params.get("category"));

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
        return data;
    } catch (error) {
        console.error("게시물 정보를 가져오는 중 오류 발생: ", error);
    }
};

const fetchUserId = async () => {
    try {
        const response = await fetch('/api/session/user-id');
        if (!response.ok) {
            console.error("Response not OK: ", response)
            alert("로그인 되어 있지 않습니다.");
            window.location.href = '/';
            return null;
        }
        const userInfo = await response.json();
        return userInfo;
    } catch (error) {
        console.error('Error fetching user info: ', error);
        window.location.href = '/';
        return null;
    }
  };

const formatDate = (dateString) => {
    const dateParts = dateString.match(/(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분/);
    if (!dateParts) return null;

    const [_, year, month, day, hour, minute] = dateParts;
    return `${month}월 ${day}일 ${hour}시 ${minute}분`;
}

// 게시물 정보 DOM에 렌더링
const renderBoardDetails = async (data) => {
    post = data;

    const getUserId = await fetchUserId();
    const userId = getUserId.userId;
    if (userId !== post.user_id) {
        document.querySelector(".button-container").innerHTML = "";
    }

    const subjectDiv = document.querySelector("#subject");
    const categoryDiv = document.querySelector("#category");
    const dateDiv = document.querySelector("#date");
    const contentDiv = document.querySelector("#content");
    const capacityDiv = document.querySelector("#capacity");
    const locationDiv = document.querySelector("#location-container");

    subjectDiv.innerText = data.title;
    categoryDiv.innerText = data.category;
    dateDiv.innerText = `${formatDate(data.start_date)} \n~ ${formatDate(data.end_date)}`;
    contentDiv.innerText = data.content;
    capacityDiv.innerHTML = `<span class="current-capacity">${data.current_capacity}</span> / <span class="max-capacity">${data.max_capacity}</span>`;

    if (viewCategory === "택시") {
        const departureText = data.departure.replace(/"/g,"");
        const destinationText = data.destination.replace(/"/g,"");
        locationDiv.innerText = `${departureText} ➡️ ${destinationText}`;
    } else {
        const locationText = data.location.replace(/"/g,"");
        console.log(locationText);
    }
};

const modifyBtn = document.querySelector("#modify");

const handleModifyBtn = async (event) => {
    event.preventDefault();
    await fetchUserId();
    location.href = `/post/modify?index=${index}`;
    backLink.addEventListener("click", () => {
        window.history.back();
    });
};

modifyBtn.addEventListener("click", handleModifyBtn);

// 뒤로 가기 버튼
const backLink = document.querySelector("#back-link");

let selectedCategory = "";

if (viewCategory === "택배") {
    selectedCategory = "package";
} else if (viewCategory === "배달") {
    selectedCategory = "delivery";
} else if (viewCategory === "택시") {
    selectedCategory = "taxi";
}

backLink.setAttribute("href", `/category/${selectedCategory}`);

// 삭제 버튼
const deleteBtn = document.querySelector("#delete");
deleteBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    await fetchUserId();
    let category;
    if (post.category === "택배") {
        category = "package";
    } else if (post.category === "배달") {
        category = "delivery";
    } else if (post.category === "택시") {
        category = "taxi";
    }

    const confirmed = confirm("이 글을 삭제하시겠습니까?");
    if (confirmed) {
        const response = await fetch(`/api/post/delete/${index}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("게시물 삭제 실패");
        
        window.location.href = `/category/${category}`;
        // window.history.back();
    } else {
        await fetchBoardDetails();
        await checkCapacityStatus();
    }
});

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
            participationBtn.innerHTML = `
                <div id="price-container">인당 <span id="price">${formattedPrice}</span>원씩 부담하면 돼요!</div>
                <div id="participate">모집 예정</div>
            `;
            participationBtn.style.backgroundColor = "grey";
            participationBtn.style.pointerEvents = "none";
            document.querySelector(".current-capacity").style.color = "grey";
        } else if ((currentCapacity >= maxCapacity) || (currentDate > endDate)) {
            participationBtn.innerHTML = `<div id="participate">모집 마감</div>`
            participationBtn.style.backgroundColor = "grey";
            participationBtn.style.pointerEvents = "none";

            document.querySelector(".current-capacity").style.color = "red";
        } else {
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
};

document.addEventListener("DOMContentLoaded", () => {
    fetchBoardDetails().then(() => {
        checkCapacityStatus();    // 로드 시 상태 확인
        participationBtn.removeEventListener("click", handleParticipation);
        participationBtn.addEventListener("click", handleParticipation);
    });
});

const fetchUserInfo = async () => {
    try {
        const response = await fetch('/api/session/user-id');
        if (!response.ok) {
            console.error("Response not OK: ", response)
            alert("로그인 되어 있지 않습니다.");
            return null;
        }
        const userInfo = await response.json();
        return userInfo.userId;
    } catch (error) {
        console.error('Error fetching user info: ', error);
        window.location.href = '/';
        return null;
    }
};

const handleParticipation = async (event) => {
    event.preventDefault();
    const capacityDiv = document.querySelector("#capacity");

    const userId = await fetchUserInfo();
    const response = await fetch(`/api/chat/check-participation/${index}?userId=${userId}`);
    const data = await response.json();

    // 이미 참여 상태인 경우, 더 진행하지 않음
    if (data.participated) {
        window.location.href = `/chat?index=${index}`;
        return;
    };

    const updatedData = await fetchBoardDetails();

    const currentCapacity = updatedData.current_capacity;
    const maxCapacity = updatedData.max_capacity;

    if (currentCapacity < maxCapacity) {
        try {
            const updateCapacityResponse = await fetch(`/api/post/update-capacity/${index}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ current_capacity: currentCapacity + 1 })
            });

            if (!updateCapacityResponse.ok) {
                throw new Error("Failed to update capacity");
            }

            if (userId !== updatedData.userId) {
                await fetch(`/api/chat/create-room/${index}/${userId}`, {
                    method: 'POST'
                });
            }

            await fetch(`/api/chat/update-participation-status/${index}/${userId}`, {
                method: 'POST'
            });

            const updatedPost = await updateCapacityResponse.json();
            // UI 업데이트
            capacityDiv.innerHTML = `<span class="current-capacity">${updatedPost.current_capacity}</span> / ${maxCapacity}`;

            // 상태 업데이트
            checkCapacityStatus();

            window.location.href = `/chat?index=${index}`;
        } catch (error) {
            console.error("참여하기 버튼 클릭 오류: ", error);
        }
    }
};