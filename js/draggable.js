/**
 * Make the target element movable by clicking and dragging on the handle.  This is not a general purprose function,
 * it makes several options specific to igv dialogs, the primary one being that the
 * target is absolutely positioned in pixel coordinates

 */

let _dragData  // Its assumed we are only dragging one element at a time.

function makeDraggable(target, handle, constraint) {

    handle.addEventListener('mousedown', dragStart.bind(target))

    function dragStart(event) {

        event.stopPropagation()
        event.preventDefault()

        const dragFunction = drag.bind(this)
        const dragEndFunction = dragEnd.bind(this)
        const computedStyle = getComputedStyle(this)

        _dragData =
            {
                constraint,
                dragFunction,
                dragEndFunction,
                screenX: event.screenX,
                screenY: event.screenY,
                top: parseInt(computedStyle.top.replace("px", "")),
                left: parseInt(computedStyle.left.replace("px", ""))
            }

        document.addEventListener('mousemove', dragFunction)
        document.addEventListener('mouseup', dragEndFunction)
        document.addEventListener('mouseleave', dragEndFunction)
        document.addEventListener('mouseexit', dragEndFunction)
    }
}

function drag(event) {

    if (!_dragData) {
        console.error("No drag data!")
        return
    }
    event.stopPropagation()
    event.preventDefault()
    const dx = event.screenX - _dragData.screenX
    const dy = event.screenY - _dragData.screenY

    const left = _dragData.left + dx
    const top = _dragData.constraint ? Math.max(_dragData.constraint.minY, _dragData.top + dy) : _dragData.top + dy

    this.style.left = `${left}px`
    this.style.top = `${top}px`
}

function dragEnd(event) {

    if (!_dragData) {
        console.error("No drag data!")
        return
    }
    event.stopPropagation()
    event.preventDefault()

    const dragFunction = _dragData.dragFunction
    const dragEndFunction = _dragData.dragEndFunction
    document.removeEventListener('mousemove', dragFunction)
    document.removeEventListener('mouseup', dragEndFunction)
    document.removeEventListener('mouseleave', dragEndFunction)
    document.removeEventListener('mouseexit', dragEndFunction)
    _dragData = undefined
}

export {makeDraggable}
