import { BaseComponent } from '../../lib/webcomponent.js';


export default class AppMain extends BaseComponent {

    static tagName = "app-main";
    static templateUrl = "./components/app-main/app-main.html";
    static styleUrl = './components/app-main/app-main.css';

    constructor() {
        super();

        this.counters = [...this.shadowRoot.querySelectorAll(".counter")];
        this.reserve = this.shadowRoot.getElementById("reserve");
        this.placement = [];

        this.shadowRoot.addEventListener('dragstart', (e) => this.dragstartHandler(e));
        this.shadowRoot.addEventListener('dragenter', (e) => this.dragenterHandler(e));
        this.shadowRoot.addEventListener('dragover', (e) => this.dragoverHandler(e));
        this.shadowRoot.addEventListener('drop', (e) => this.dropHandler(e));

        try {
            // Try to load the placement data from local storage.
            this.placement = JSON.parse(localStorage.getItem('placement'));
            this.refreshDom();
        } catch {
            // If there's no data in local storage, initialize placement to an empty array.
            this.placement = new Array(19).fill(null);
            this.refreshDom();
        }

        history.replaceState(JSON.stringify(this.placement), "");
        window.addEventListener('popstate', (e) => { this.onHistoryChange(e.state) });
    }

    /**
     * Handles the "dragstart" event for the tokens.
     * @param {DragEvent} ev - The dragstart event object.
     */
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

    /**
     * Handles the "dragenter" event for the board and reserve elements.
     * @param {DragEvent} ev - The dragenter event object.
     */
    dragenterHandler(ev) {
        ev.preventDefault();
    }

    /**
     * Handles the "dragover" event for the board and reserve elements.
     * @param {DragEvent} ev - The dragover event object.
     */
    dragoverHandler(ev) {
        ev.preventDefault();
        const slot = ev.composedPath().find(el => el.classList?.contains("slot") || el.id === "reserve");
        ev.dataTransfer.dropEffect = slot ? "move" : "none";
    }

    /**
     * Handles the "drop" event. Updates the state of the puzzle based on where the user dropped the dragged token.
     * Also updates the localStorage and the browser's history.
     *
     * @param {DragEvent} ev - The drop event.
     */
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

    /**
     * Calculates the sum of an array of numbers.
     *
     * @param {number[]} arr - The array of numbers to sum.
     * @returns {number} The sum of the array.
     */
    calculateSum(arr) {
        return arr.reduce((total, current) => {
            return total + current;
        }, 0);
    }

    /**
     * Converts a number to a signed string, with a "+" sign for positive numbers.
     *
     * @param {number} num - The number to convert to a signed string.
     * @returns {string} The signed string.
     */
    toSignedString(num) {
        return num > 0 ? "+" + num : "" + num;
    }

    /**
     * Updates the calculation results for each counter based on the current state of the puzzle.
     */
    updateCalculations() {
        for (const counterDom of this.counters) {
            const positions = [...counterDom.dataset.count];
            const delta = 38 - this.calculateSum(positions.map(slotName => this.placement.indexOf(slotName) + 1));
            counterDom.dataset.result = this.toSignedString(delta);
            counterDom.classList.toggle('ok', delta === 0);
            counterDom.classList.toggle('greater', delta > 0);
        }
    }

    /**
     * Updates the DOM to reflect the current state of the puzzle.
     * Also updates the calculation results and moves the token elements to their correct slots.
     */
    refreshDom() {
        this.updateCalculations();

        for (const [token, slot] of this.placement.entries()) {
            const tokenDom = this.shadowRoot.querySelector(`.token[data-value="${token + 1}"`);
            let container = this.shadowRoot.querySelector(`.slot[data-position="${slot}"`);
            if (!container) container = this.reserve;

            container.appendChild(tokenDom);
        }
    }

    /**
     * This method is called when the window's history changes. It updates the placement
     * state based on the new state, refreshes the DOM to reflect the updated placement,
     * and saves the updated placement in localStorage.
     * @param {string} state - The new state of the window's history.
     */
    onHistoryChange(state) {
        this.placement = JSON.parse(state);
        this.refreshDom();
        localStorage.setItem("placement", JSON.stringify(this.placement));
    }
}

