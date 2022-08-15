import {AlertSingleton} from '../../node_modules/igv-widgets/dist/igv-widgets.js'
import {GenericDataSource, ModalTable} from '../../node_modules/data-modal/dist/data-modal.js'
import {FileUtils, GooglePicker} from '../../node_modules/igv-utils/src/index.js';
import {aidenLabContactMapDatasourceConfigurator} from './aidenLabContactMapDatasourceConfig.js'
import {encodeContactMapDatasourceConfiguration} from "./encodeContactMapDatasourceConfig.js"

let mapType = undefined;
let encodeHostedContactMapModal;
let contactMapModal;

function configureContactMapLoaders({
                                        hicBrowser,
                                        igvBrowser,
                                        rootContainer,
                                        $dropdowns,
                                        dataModalId,
                                        encodeHostedModalId,
                                        $localFileInputs,
                                        $dropboxButtons,
                                        $googleDriveButtons,
                                        googleEnabled,
                                        urlLoadModalId,
                                        mapMenu
                                    }) {


    const loadHandler = async (url, name, mapType) => {

        try {
            const isControl = ('control-map' === mapType)
            const config = {url, name, isControl}

            if (isControl) {
                await hicBrowser.loadHicControlFile(config)
            } else {
                hicBrowser.reset()
                await hicBrowser.loadHicFile(config)
                $('#hic-control-map-dropdown').removeClass('disabled')
            }


            const genomeID = hicBrowser.genome.id

            if (genomeID !== igvBrowser.genome.id) {

                // genomeCallback(genomeID)

                const config =
                    {
                        genome: genomeID,
                        tracks:
                            [
                                {
                                    id: "jb-interactions",
                                    type: "interact",
                                    name: "Contacts",
                                    height: 125,
                                    features:
                                        [
                                            // ! Important, signals track that features will be supplied explicitly
                                        ],
                                    order: 10000  // Just above gene track
                                }
                            ]
                    }

                await igvBrowser.loadSession(config)

            }

        } catch (e) {
            AlertSingleton.present(`Error loading ${url}: ${e}`);
        }
    }

    $dropdowns.on('show.bs.dropdown', function () {

        const $child = $(this).children('.dropdown-toggle');

        const dropdown_button_id = $child.attr('id');

        // Set map type based on dropdown selected, this is a transient variable, set every time this callback
        // is invoked.
        mapType = 'hic-contact-map-dropdown' === dropdown_button_id ? 'contact-map' : 'control-map';

    });

    $localFileInputs.on('change', async function (e) {
        const file = ($(this).get(0).files)[0];

        // NOTE:  this in the callback is a DOM element, jquery weirdness
        $(this).val("");

        const {name} = file;
        await loadHandler(file, name, mapType);
    });

    $dropboxButtons.on('click', function () {

        const config =
            {
                success: async dbFiles => {
                    const paths = dbFiles.map(dbFile => dbFile.link);
                    const path = paths[0];
                    const name = FileUtils.getFilename(path);
                    await loadHandler(path, name, mapType);
                },
                cancel: () => {
                },
                linkType: 'preview',
                multiselect: false,
                folderselect: false,
            };

        Dropbox.choose(config);

    });

    if (googleEnabled) {
        $googleDriveButtons.on('click', () => {

            GooglePicker.createDropdownButtonPicker(true, async responses => {

                const paths = responses.map(({name, url: google_url}) => {
                    return {filename: name, name, google_url};
                });

                let {name, google_url: path} = paths[0];
                await loadHandler(path, name, mapType);

            })
        })
    } else {
        $googleDriveButtons.parent().hide();
    }

    appendAndConfigureLoadURLModal(rootContainer, urlLoadModalId, path => {
        const name = FileUtils.getFilename(path);
        loadHandler(path, name, mapType);
    });

    if (mapMenu) {

        const modalTableConfig =
            {
                id: dataModalId,
                title: 'Contact Map',
                selectionStyle: 'single',
                pageLength: 10,
                okHandler: async ([selection]) => {
                    const {url, name} = selection
                    await loadHandler(url, name, mapType)
                }
            }
        contactMapModal = new ModalTable(modalTableConfig)

        const {items: path} = mapMenu
        const config = aidenLabContactMapDatasourceConfigurator(path)
        const datasource = new GenericDataSource(config)
        contactMapModal.setDatasource(datasource)
    }


    const encodeModalTableConfig =
        {
            id: encodeHostedModalId,
            title: 'ENCODE Hosted Contact Map',
            selectionStyle: 'single',
            pageLength: 10,
            okHandler: async ([{HREF, Description}]) => {
                const urlPrefix = 'https://www.encodeproject.org'
                const path = `${urlPrefix}${HREF}`
                await loadHandler(path, Description, mapType)
            }
        }

    encodeHostedContactMapModal = new ModalTable(encodeModalTableConfig)

    const datasource = new GenericDataSource(encodeContactMapDatasourceConfiguration)
    encodeHostedContactMapModal.setDatasource(datasource)

}


function appendAndConfigureLoadURLModal(root, id, input_handler) {

    const html =
        `<div id="${id}" class="modal fade">
            <div class="modal-dialog  modal-lg">
                <div class="modal-content">

                <div class="modal-header">
                    <div class="modal-title">Load URL</div>

                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>

                </div>

                <div class="modal-body">

                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Enter URL">
                    </div>

                </div>

                </div>
            </div>
        </div>`;

    $(root).append(html);

    const $modal = $(root).find(`#${id}`);
    $modal.find('input').on('change', function () {

        const path = $(this).val();
        $(this).val("");

        $(`#${id}`).modal('hide');

        input_handler(path);


    });

    return html;
}

export default configureContactMapLoaders
