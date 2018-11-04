import FileLoadWidget from "./fileLoadWidget.js";
import FileLoadManager from "./fileLoadManager.js";
import {configureModal, getExtension} from "./utils.js";

class SVGController {

    constructor ({ browser, $saveModal }) {

        configureSaveModal(browser, $saveModal);

    }

}

function configureSaveModal(browser, $modal){

    const input_default_value = 'igv-app.svg';

    let $input = $modal.find('input');

    $modal.on('show.bs.modal', (e) => {
        $input.val(input_default_value);
    });

    $modal.on('hidden.bs.modal', (e) => {
        $input.val(input_default_value);
    });

    let okHandler = () => {

        let fn = $input.val();

        const extensions = new Set(['svg']);

        if (undefined === fn || '' === fn) {

            fn = $input.attr('placeholder');
        } else if (false === extensions.has( getExtension( fn ) )) {

            fn = fn + '.svg';
        }

        // dismiss modal
        $modal.modal('hide');

        browser.renderSVG({ filename: fn });
    };

    // ok - button
    let $ok = $modal.find('.modal-footer button:nth-child(2)');

    $ok.on('click', okHandler);

    $input.on('keyup', (e) => {
        if (13 === e.keyCode) {
            okHandler();
        }
    });

    // upper dismiss - x - button
    let $dismiss = $modal.find('.modal-header button:nth-child(1)');
    $dismiss.on('click', function () {
        $modal.modal('hide');
    });

    // lower dismiss - close - button
    $dismiss = $modal.find('.modal-footer button:nth-child(1)');
    $dismiss.on('click', function () {
        $modal.modal('hide');
    });

}

export default SVGController;
