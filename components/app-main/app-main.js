import { BaseComponent } from '../../lib/webcomponent.js';


export default class AppMain extends BaseComponent {

    static tagName = "app-main";
    static templateUrl = "./components/app-main/app-main.html";
    static styleUrl = './components/app-main/app-main.css';

    constructor() {
        super();

        this.counters = [...this.shadowRoot.querySelectorAll(".counter")];
        this.reserve = this.shadowRoot.getElementById("reserve");

        this.shadowRoot.addEventListener('dragstart', (e) => this.dragstartHandler(e));
        this.shadowRoot.addEventListener('dragenter', (e) => this.dragenterHandler(e));
        this.shadowRoot.addEventListener('dragover', (e) => this.dragoverHandler(e));
        this.shadowRoot.addEventListener('drop', (e) => this.dropHandler(e));
        
        try {
            this.placement = JSON.parse(localStorage.getItem('placement'));
            this.refreshDom();
        } catch {
            this.placement = new Array(19).fill(null);
            this.refreshDom();
        }

        history.replaceState(JSON.stringify(this.placement), "");
        window.addEventListener('popstate', (e) => { this.onHistoryChange(e.state) });
    }

    dragstartHandler(ev) {
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

    dragenterHandler(ev) {
        ev.preventDefault()
    }

    dragoverHandler(ev) {
        ev.preventDefault();
        const slot = ev.composedPath().find(el => el.classList?.contains("slot") || el.id === "reserve"); 
        ev.dataTransfer.dropEffect = slot ? "move" : "none";
    }

    dropHandler(ev) {
        const evPath = ev.composedPath();
        const slot = evPath.find(el => el.classList?.contains("slot"));

        const dragdata = JSON.parse(ev.dataTransfer.getData("application/hexagon-puzzle"));

        if (!slot) {
            if (!evPath.includes(this.reserve)) return;
            this.placement[dragdata.token - 1] = null;
        } else {
            const existingToken = this.placement.indexOf(slot.dataset.position) + 1;
            if (existingToken) {
                this.placement[existingToken - 1] = dragdata.fromSlot;
            }

            this.placement[dragdata.token - 1] = slot.dataset.position;
        }

        this.refreshDom();
        localStorage.setItem("placement", JSON.stringify(this.placement));
        history.pushState(JSON.stringify(this.placement), "");
    }

    calculateSum(arr) {
        return arr.reduce((total, current) => {
            return total + current;
        }, 0);
    }

    toSignedString(num) {
        return num > 0 ? "+" + num : "" + num;
    }

    updateCalculations() {
        for (const counterDom of this.counters) {
            const positions = [...counterDom.dataset.count];
            const delta = 38 - this.calculateSum(positions.map(slotName => this.placement.indexOf(slotName) + 1));
            counterDom.dataset.result = this.toSignedString(delta);
            counterDom.classList.toggle('ok', delta === 0);
            counterDom.classList.toggle('greater', delta > 0);
        }
    }

    refreshDom() {
        this.updateCalculations();

        for (const [token, slot] of this.placement.entries()) {
            const tokenDom = this.shadowRoot.querySelector(`.token[data-value="${token + 1}"`);
            let container = this.shadowRoot.querySelector(`.slot[data-position="${slot}"`);
            if (!container) container = this.reserve;

            container.appendChild(tokenDom);
        }
    }

    onHistoryChange(state) {
        this.placement = JSON.parse(state);
        this.refreshDom();
        localStorage.setItem("placement", JSON.stringify(this.placement));
    }
}

