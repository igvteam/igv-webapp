import juicebox from '../node_modules/juicebox.js/dist/juicebox.esm.js'
import {makeDraggable} from '../node_modules/igv-utils/src/index.js'
import throttle from "./utils.js"
import {igvLocusChange, juiceboxLocusChange} from "./locusChange.js"
import juiceboxCrosshairsHandler from "./juiceboxCrosshairs.js"

class JuiceboxPanel {
    constructor(config) {

        const dragHandle = config.panel.querySelector('.spacewalk_card_drag_container')
        makeDraggable(config.panel, dragHandle)

        this.container = config.panel.querySelector('#spacewalk_juicebox_root_container')
        this.config = config
    }

    async initialize() {

        this.browser = await juicebox.init(this.container, this.config)

        this.browser.setCustomCrosshairsHandler(juiceboxCrosshairsHandler(this.browser, this.config.igvBrowser))

        this.browser.eventBus.subscribe("LocusChange", throttle(juiceboxLocusChange(this.browser, this.config.igvBrowser), 1000))

        this.config.igvBrowser.on('locuschange', throttle(igvLocusChange(this.browser, this.config.igvBrowser), 100))

    }
}

export default JuiceboxPanel
