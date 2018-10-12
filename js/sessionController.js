class SessionController {

    constructor({ browser, $saveButton, $loadInput }) {

        this.browser = browser;

        let self = this;

        $saveButton.on('click', (e) => {
            self.save();
        });

        $loadInput.on('change', (e) => {
            self.load(e);
        });

    }

    save(){
        const json = this.browser.toJSON();
        const data = URL.createObjectURL(new Blob([ json ], { type: "application/octet-stream" }));
        const filename = 'igv-webapp-session.json';
        igv.download(filename, data);
    }

    load(e){
        let file = e.target.files[ 0 ];
        this.browser.loadSession(file);
    }

}

export default SessionController;
