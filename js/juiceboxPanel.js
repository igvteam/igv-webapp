import juicebox from '../node_modules/juicebox.js/dist/juicebox.esm.js'
import {makeDraggable} from '../node_modules/igv-utils/src/index.js'

class JuiceboxPanel {
    constructor(panel, config) {

        const dragHandle = panel.querySelector('.spacewalk_card_drag_container')
        makeDraggable(panel, dragHandle)

        this.container = panel.querySelector('#spacewalk_juicebox_root_container')
        this.config = Object.assign(config, { queryParametersSupported: false });

    }

    async initialize() {
        this.browser = await juicebox.init(this.container, this.config)
    }
}

export default JuiceboxPanel
