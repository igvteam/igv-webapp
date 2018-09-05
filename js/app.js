import {main} from './main.js';
import {config} from './igvwebConfig.js';

$(document).ready(() => {

    main($('#igv-app-container'), config);
});
