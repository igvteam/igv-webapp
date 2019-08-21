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

    }

}

export const alertPanelConfigurator = ({$container}) => {

    return {
        $container,
        panel: $('#igv-webapp-alertpanel').get(0),
        isHidden: false
    };

};

export default AlertPanel;
