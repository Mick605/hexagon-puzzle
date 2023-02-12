import { WebComponent } from './lib/webcomponent.js';

import AppMain from './components/app-main/app-main.js';


WebComponent({
    baseUrl: "/hexagon-puzzle/",
    components: [
        AppMain,
    ]
});