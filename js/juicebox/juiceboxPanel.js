import juicebox from '../../node_modules/juicebox.js/dist/juicebox.esm.js'
import {makeDraggable} from '../../node_modules/igv-utils/src/index.js'
import {igvLocusChange, juiceboxLocusChange} from './locusChange.js'
import juiceboxCrosshairsHandler from './juiceboxCrosshairs.js'
import configureContactMapLoaders from './contactMapLoad.js'
import throttle from "../utils.js"

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

        const $dropdowns = $('a[id$=-map-dropdown]').parent()

        const contactMapLoadConfig =
            {
                // Juicebox browser
                hicBrowser: this.browser,

                // IGV browser
                igvBrowser: this.config.igvBrowser,

                // Root juicebox element
                rootContainer: document.querySelector('#hic-main'),

                // Contact and Control dropdown elements
                $dropdowns,

                // Juicebox Archive maps
                dataModalId: 'hic-contact-map-modal',

                // ENCODE maps
                encodeHostedModalId: 'hic-encode-hosted-contact-map-modal',

                // Local maps
                $localFileInputs: $dropdowns.find('input'),

                // Dropbox maps
                $dropboxButtons: $dropdowns.find('div[id$="-map-dropdown-dropbox-button"]'),

                // Google Drive maps
                $googleDriveButtons: $dropdowns.find('div[id$="-map-dropdown-google-drive-button"]'),
                googleEnabled: this.config.googleEnabled || false,

                // URL maps
                urlLoadModalId: 'hic-load-url-modal',

                //
                mapMenu: this.config.mapMenu,
            };

        configureContactMapLoaders(contactMapLoadConfig)


    }
}

export default JuiceboxPanel
