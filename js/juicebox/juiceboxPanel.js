import juicebox from '../../node_modules/juicebox.js/dist/juicebox.esm.js'
import {makeDraggable} from '../../node_modules/igv-utils/src/index.js'
import throttle from "../utils.js"
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

        configureContactMapLoaders(this.browser, this.config.igvBrowser, genomeID => {})
    }
}

function configureContactMapLoaders(hicBrowser, igvBrowser, genomeCallback) {

}

function __configureContactMapLoaders(hicBrowser, igvBrowser, genomeCallback) {

    const mapLoadHandler = async (url, name, mapType) => {

        const isControl = ('control-map' === mapType);
        if (!isControl) hicBrowser.reset();
        await hicBrowser.loadHicFile({url, name, isControl});

        const genomeID = hicBrowser.genome.id;
        if (genomeID !== igvBrowser.genome.id) {

            genomeCallback(genomeID);

            await igvBrowser.loadSession({
                genome: genomeID,
                tracks:
                    [{
                        id: "jb-interactions",
                        type: "interact",
                        name: "Contacts",
                        //color: "rgba(180, 25, 137, 0.05)",
                        height: 125,
                        features: [],   // ! Important, signals track that features will be supplied explicitly
                        order: 10000  // Just above gene track
                    }]
            });



        }
    };

    configureAidenlabMapModal('hic-contact-map-modal', mapLoadHandler);
    configureEncodeMapModal('hic-encode-hosted-contact-map-modal', mapLoadHandler);
    configureFileInput$1('#contact-map-local', mapLoadHandler);
    configureLoadURLModal$1('#hic-load-url-modal', mapLoadHandler);
}

/*
function updateTracksForGenome(genomeID) {

    for(let type of encodeModals.keys()) {
        const modal = encodeModals.get(type);
        if(supportsGenome(genomeID)) {
            modal.setDatasource((new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, type))));
        } else {
            modal.setDatasource(EmptyTableDataSource);
        }
    }
}
*/

export default JuiceboxPanel
