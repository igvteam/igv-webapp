import FileLoadWidget from "./fileLoadWidget.js";
import FileLoadManager from "./fileLoadManager.js";
import {configureModal} from "./utils.js";

class SessionController {

    constructor ({ browser, $urlModal }) {

        let urlConfig =
            {
                dataTitle: 'Session',
                $widgetParent: $urlModal.find('.modal-body'),
                mode: 'url',
                dataOnly: true
            };
        
        this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager({ sessionJSON: true }));

        configureModal(this.urlWidget, $urlModal, (fileLoadManager) => {
            browser.loadSession( fileLoadManager.dictionary.data );
            return true;
        });

    }

    save(){
        const json = this.browser.toJSON();
        const data = URL.createObjectURL(new Blob([ json ], { type: "application/octet-stream" }));
        const filename = 'igv-webapp-session.json';
        igv.download(filename, data);
    }

}

export default SessionController;
