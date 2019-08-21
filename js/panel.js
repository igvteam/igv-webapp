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
            this.initializeLayout(xFunction, yFunction);
        }

        const $drag_handle = this.$panel.find('.spacewalk_card_drag_container');
        makeDraggable(panel, $drag_handle.get(0));


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

    receiveEvent({ type, data }) {

        if ("ToggleUIControl" === type && data && data.payload === this.$panel.attr('id')) {

            if (this.isHidden) {
                this.layout();
            } else {
                this.moveOffScreen();
            }

            this.isHidden = !this.isHidden;

        } else if ('AppWindowDidResize' === type) {

            if (false === this.isHidden) {
                this.layout();
            }

        } else if ('DidDragEnd' === type && data && data === this.$panel.attr('id')) {
            this.updateLayoutState();
        }
    }


    // Notes from SpaceWalk regarding layout

    /*
    const container = document.getElementById('spacewalk_canvas_container');
    let { width, height } = container.getBoundingClientRect();
    Globals.appWindowWidth = width;
    Globals.appWindowHeight = height;
    */

    initializeLayout(xFunction, yFunction) {

        const { width: width_container, height: height_container } = this.container.getBoundingClientRect();
        const { width: width_panel,     height: height_panel     } = this.$panel.get(0).getBoundingClientRect();

        const left = xFunction(width_container,   width_panel);
        const  top = yFunction(height_container, height_panel);

        this.$panel.offset( { left, top } );

        this.updateLayoutState();
    }

    layout(){

        if (this.layoutState) {

            const { topPercent, leftPercent } = this.layoutState;
            const { width, height } = this.container.getBoundingClientRect();

            const top = topPercent * height;
            const left = leftPercent * width;

            this.$panel.offset({ top, left })
        } else {
            this.initializeLayout(this.xFunction, this.yFunction)
        }

    };

    moveOffScreen() {
        this.updateLayoutState();
        this.$panel.offset( { left: -1000, top: -1000 } );
    };

    presentPanel() {

        if (this.isHidden) {
            this.layout();
            this.isHidden = false;
        }

    };

    dismissPanel() {

        if (false === this.isHidden) {
            this.moveOffScreen();
            this.isHidden = true;
        }

    };

    updateLayoutState() {

        const { width, height } = this.container.getBoundingClientRect();
        const { top, left } = this.$panel.offset();
        
        const topPercent = top / height;
        const leftPercent = left / width;

        this.layoutState = { top, left, topPercent, leftPercent };
    }
}

export default Panel;
