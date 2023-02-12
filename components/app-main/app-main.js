import { BaseComponent } from '../../lib/webcomponent.js';


export default class AppMain extends BaseComponent {

    static tagName = "app-main";
    static templateUrl = "./components/app-main/app-main.html";
    static styleUrl = './components/app-main/app-main.css';

    constructor() {
        super();

        this.shadowRoot.addEventListener('dragstart', (e) => this.dragstart_handler(e));
        this.shadowRoot.addEventListener('dragover', (e) => this.dragover_handler(e));
        this.shadowRoot.addEventListener('drop', (e) => this.drop_handler(e));
    }

    dragstart_handler(ev) {
        const token = ev.composedPath().find(el => el.classList?.contains("token"));
        ev.dataTransfer.setData("application/hexagon-puzzle", token.dataset.value);
        ev.dataTransfer.effectAllowed = "move";
    }

    dragover_handler(ev) {
        ev.preventDefault();
        const slot = ev.composedPath().find(el => el.classList?.contains("slot") || el.id === "reserve"); 
        ev.dataTransfer.dropEffect = slot ? "move" : "none";
    }

    drop_handler(ev) {
        const evPath = ev.composedPath();
        const reserve = this.shadowRoot.getElementById("reserve");
        const slot = evPath.find(el => el.classList?.contains("slot"));

        const data = ev.dataTransfer.getData("application/hexagon-puzzle");
        const token = this.shadowRoot.querySelector(`.token[data-value="${data}"`);

        if (!slot) {
            if (!evPath.includes(reserve)) return;
            reserve.appendChild(token);
        } else {
            slot.appendChild(token);
        }
    }
}

