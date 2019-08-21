import igv from '../vendor/igv.esm.min.js';
import { makeDraggable} from "./draggable.js";

class Panel {

    constructor({ $container, panel, isHidden, xFunction, yFunction }) {

        this.container = $container.get(0);
        this.$panel = $(panel);
        this.isHidden = isHidden;
        this.xFunction = xFunction;
        this.yFunction = yFunction;

        this.layoutState = undefined;

        if (false === this.isHidden) {
            this.layout(xFunction, yFunction);
        }

        const $drag_handle = this.$panel.find('.spacewalk_card_drag_container');
        makeDraggable(panel, $drag_handle.get(0));

        const str = `resize.panel-${ igv.guid() }.igv-web-app`;

        $(window).on(str, () => {
            this.layout(xFunction, yFunction);
        });

        const $closer = this.$panel.find('i.fa-times-circle');
        $closer.on(`click.${ igv.guid() }`, event => {

            event.stopPropagation();

            const id = $closer.attr('data-target');
            const selector = `#${ id }`;
            const $input = $(selector);
            $input.prop('checked', false);

            this.moveOffScreen();
            this.isHidden = true;
        });

    }

    layout(xFunction, yFunction) {

        const { width: width_container, height: height_container } = this.container.getBoundingClientRect();
        const { width: width_panel,     height: height_panel     } = this.$panel.get(0).getBoundingClientRect();

        const left = xFunction(width_container,   width_panel);
        const  top = yFunction(height_container, height_panel);

        this.$panel.offset( { left, top } );
    }

    moveOffScreen() {
        this.$panel.offset( { left: -1000, top: -1000 } );
    };

    presentPanel() {

        if (this.isHidden) {
            this.layout(this.xFunction, this.yFunction);
            this.isHidden = false;
        }

    };

    dismissPanel() {

        if (false === this.isHidden) {
            this.moveOffScreen();
            this.isHidden = true;
        }

    };
}

export default Panel;
