const namespace = '.igv-webapp-drag';
let dragData;

let makeDraggable = (targetElement, handleElement) => {
    $(handleElement).on('mousedown' + namespace, dragStart.bind(targetElement));
};

function dragStart(event) {

    event.stopPropagation();
    // event.preventDefault();

    const styleX = Math.round(parseFloat(this.style.left.replace("px", "")));
    const styleY = Math.round(parseFloat(this.style.top.replace("px", "")));
    const dragFunction = drag.bind(this);
    const dragEndFunction = dragEnd.bind(this);

    dragData =
        {
            dragFunction: dragFunction,
            dragEndFunction: dragEndFunction,
            dx: styleX - event.screenX,
            dy: styleY - event.screenY
        };

    $(document).on('mousemove' + namespace, dragFunction);
    $(document).on('mouseup' + namespace, dragEndFunction);
    $(document).on('mouseleave' + namespace, dragEndFunction);
    $(document).on('mouseexit' + namespace, dragEndFunction);

}

function drag(event) {

    if(!dragData) {
        console.log("No drag data!");
        return;
    }

    event.stopPropagation();

    const styleX = dragData.dx + event.screenX;
    const styleY = dragData.dy + event.screenY;

    this.style.left = styleX + "px";
    this.style.top = styleY + "px";

}

function dragEnd(event) {

    if(!dragData) {
        console.log("No drag data!");
        return;
    }

    event.stopPropagation();

    const styleX = dragData.dx + event.screenX;
    const styleY = dragData.dy + event.screenY;

    this.style.left = styleX + "px";
    this.style.top = styleY + "px";

    $(document).off(namespace);
    dragData = undefined;

    const id = $(this).attr('id');

}

export { makeDraggable };
