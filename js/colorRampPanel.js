import Panel from './panel.js';

class ColorRampPanel extends Panel {

    constructor({ $container, panel, isHidden }) {

        const xFunction = (cw, w) => {
            return (cw - w) / 2;
        };

        const yFunction = (ch, h) => {
            return (ch - h) / 2;
        };

        super({ $container, panel, isHidden, xFunction, yFunction });

    }

}

export const colorRampPanelConfigurator = ({ $container }) => {

    return {
        $container,
        panel: $('#spacewalk_color_ramp_panel').get(0),
        isHidden: false
    };

};

export default ColorRampPanel;
