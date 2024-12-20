class BottomNav extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const icons = {
            category: {
                on: '/img/category-on.png',
                off: '/img/category-off.png'
            },
            chatting: {
                on: '/img/chatting-on.png',
                off: '/img/chatting-off.png'
            },
            home: {
                on: '/img/home-on.png',
                off: '/img/home-off.png'
            },
            notification: {
                on: '/img/notification-on.png',
                off: '/img/notification-off.png'
            },
            myPage: {
                on: '/img/my-on.png',
                off: '/img/my-off.png'
            }
        };

        const style = document.createElement("style");
        style.textContent = `
            a {
                text-decoration: none;
                color: #000;
                font-weight: 600;
            }

            a:visited,
            a:focus,
            a:hover,
            a:active {
                color: #000;
            }

            #bottom-nav-bar {
                max-width: 37rem;
                width: 100%;
                margin: 0 auto;
                position: fixed;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                font-size: 0.725rem;
                font-weight: 600;
                justify-content: space-between;
                align-items: center;
                background-color: #FFFFFF;
                padding-top: 1rem;
                /*border-top: 1px solid #ccc;*/
                box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1); /* 그림자 위쪽 (-4px) */
            }

            #bottom-nav-bar img {
                height: 1.5rem;
            }

            #bottom-nav-bar div {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            #bottom-nav-bar div div {
                margin-top: 0.3rem;
                font-size: 0.8rem;
            }

            nav {
                width: 100%;
            }
        `;

        const nav = document.createElement("nav");
        nav.setAttribute("id", "bottom-nav-bar");

        nav.innerHTML = `
            <div id="category-icon-container">
                <a href="/category">
                    <img class="category-icon" src="${icons.category.off}">
                    <div>카테고리</div>
                </a>  
            </div>
            <div id="chatting-icon-container">
                <a href="/chat/main">
                    <img class="chatting-icon" src="${icons.chatting.off}">
                    <div>채팅</div>
                </a>  
            </div>
            <div id="home-icon-container">
                <a href="/home">
                    <img class="home-icon" src="${icons.home.off}">
                    <div>홈</div>
                </a>
            </div>
            <div id="notification-icon-container">
                <a href="/notification">
                    <img class="notification-icon" src="${icons.notification.off}">
                    <div>알림</div>
                </a>
            </div>
            <div id="my-page-icon-container">
                <a href="/my-page">
                    <img class="my-page-icon" src="${icons.myPage.off}">
                    <div>마이</div>
                </a>
            </div>
        `;

        shadow.appendChild(style);
        shadow.appendChild(nav);

        const categoryIcon = shadow.querySelector(".category-icon");
        const chattingIcon = shadow.querySelector(".chatting-icon");
        const homeIcon = shadow.querySelector(".home-icon");
        const notificationIcon = shadow.querySelector(".notification-icon");
        const myPageIcon = shadow.querySelector(".my-page-icon");

        // 페이지별로 on 상태 설정하기
        const currentPage = this.getAttribute('data-page');
        if (currentPage === "category") {
            categoryIcon.src = icons.category.on;
        } else if (currentPage === "chatting") {
            chattingIcon.src = icons.chatting.on;
        } else if (currentPage === "home") {
            homeIcon.src = icons.home.on;
        } else if (currentPage === "notification") {
            notificationIcon.src = icons.notification.on;
        } else if (currentPage === "myPage") {
            myPageIcon.src = icons.myPage.on;
        }
    }
}

customElements.define("bottom-nav", BottomNav);