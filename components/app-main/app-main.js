import { BaseComponent } from '../../lib/webcomponent.js';


export default class AppMain extends BaseComponent {

    static tagName = "app-main";
    static templateUrl = "./components/app-main/app-main.html";
    static styleUrl = './components/app-main/app-main.css';

    constructor() {
        super();

        this.reserve = this.shadowRoot.getElementById("reserve");

        this.shadowRoot.addEventListener('dragstart', (e) => this.dragstart_handler(e));
        this.shadowRoot.addEventListener('dragover', (e) => this.dragover_handler(e));
        this.shadowRoot.addEventListener('drop', (e) => this.drop_handler(e));
    }

    dragstart_handler(ev) {
        const evPath = ev.composedPath();
        const token = evPath.find(el => el.classList?.contains("token"));
        const slot = evPath.find(el => el.classList?.contains("slot"));
        const dragdata = {
            token: token.dataset.value,
            fromSlot: slot ? slot.dataset.position : null
        }

        ev.dataTransfer.setData("application/hexagon-puzzle", JSON.stringify(dragdata));
        ev.dataTransfer.effectAllowed = "move";
    }

    dragover_handler(ev) {
        ev.preventDefault();
        const slot = ev.composedPath().find(el => el.classList?.contains("slot") || el.id === "reserve"); 
        ev.dataTransfer.dropEffect = slot ? "move" : "none";
    }

    drop_handler(ev) {
        const evPath = ev.composedPath();
        const slot = evPath.find(el => el.classList?.contains("slot"));

        const dragdata = JSON.parse(ev.dataTransfer.getData("application/hexagon-puzzle"));
        const token = this.shadowRoot.querySelector(`.token[data-value="${dragdata.token}"`);

        if (!slot) {
            if (!evPath.includes(this.reserve)) return;
            this.putInReserve(token);
        } else {
            const existingToken = slot.querySelector('.token');
            if (existingToken) {
                const fromSlot = this.shadowRoot.querySelector(`.slot[data-position="${dragdata.fromSlot}"`);
                if (fromSlot) {
                    fromSlot.appendChild(existingToken);
                } else {
                    this.putInReserve(existingToken);
                }
            }

            slot.appendChild(token);
        }
    }

    putInReserve(token) {
        const value = parseInt(token.dataset.value);
        let tokenBefore = this.reserve.firstElementChild;

        while (tokenBefore && parseInt(tokenBefore.dataset.value) < value) {
            tokenBefore = tokenBefore.nextElementSibling;
        }

        this.reserve.insertBefore(token, tokenBefore);        
    }
}

