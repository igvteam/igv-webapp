import Panel from './panel.js';

class AlertPanel extends Panel {

    constructor({ $container, panel, isHidden }) {

        const xFunction = (cw, w) => {
            return (cw - w) / 2;
        };

        const yFunction = (ch, h) => {
            // return (ch - h) / 2;
            return 64;
        };

        super({ $container, panel, isHidden, xFunction, yFunction });

        this.messageContainer = this.$panel.find('#igv-webapp-alert-panel-content-container');
    }

    presentAlert(message) {
        this.messageContainer.text(message);
        super.presentPanel();
    }
}

export const alertPanelConfigurator = ({$container}) => {

    return {
        $container,
        panel: $('#igv-webapp-alertpanel').get(0),
        isHidden: true
    };

};

export default AlertPanel;
