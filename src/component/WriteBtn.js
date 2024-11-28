
class WriteBtn extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const icon = "/img/write.png";

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
                bottom: 6.5rem;
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
        
        writeBtn.innerHTML = `
            <a href="/post" target="_top">
                <div class="img-container">
                    <img src="${icon}">
                </div>
            </a>
        `;

        shadow.appendChild(writeBtn);
        shadow.appendChild(style);
    }
}

customElements.define("write-btn", WriteBtn);