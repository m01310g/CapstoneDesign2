
class WriteBtn extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const icon = "../../../assets/img/write.png";

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

            .img-container {
                padding: 1.2rem;
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background-color: #F5AF12;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                right: 5%;
                bottom: 6rem;
                z-index: 1000;
            }

            .img-container img {
                width: 2rem;
                height: 2rem;
                object-fit: contain;
                filter: invert();
            }

            #write-btn {
                width: 4.5rem;
                height: auto;
            }
        `;

        const writeBtn = document.createElement("div");
        writeBtn.setAttribute("id", "write-btn");

        const index = (JSON.parse(localStorage.getItem("boards")) || []).length;
        
        writeBtn.innerHTML = `
            <a id="write-btn" href="../board/write.html?index=${index}" target="_top">
                <div class="img-container">
                    <img src="${icon}">
                </div>
            </a>
        `;

        shadow.appendChild(style);
        shadow.appendChild(writeBtn);
    }
}

customElements.define("write-btn", WriteBtn);