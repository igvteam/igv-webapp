import FileLoadWidget from "./fileLoadWidget";
import FileLoadManager from "./fileLoadManager";
import {configureModal} from "./utils";

class SessionController {

    constructor ({ browser, $urlModal }) {

        let urlConfig =
            {
                dataTitle: 'Session',
                $widgetParent: $urlModal.find('.modal-body'),
                mode: 'url'
            };

        this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());

        configureModal(this.urlWidget, $urlModal, (fileLoadManager) => {
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
