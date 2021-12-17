function createCircularViewResizeModal(id, title){

    const str = 'igv-app-circular-view-resize-modal'

    const html_ok_cancel =
        `<div id="${ id }" class="modal">

            <div class="modal-dialog modal-sm">
    
                <div class="modal-content">
    
                    <div class="modal-header">
                        <div class="modal-title">${ title }</div>
    
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
    
                    </div>
    
                    <div class="modal-body">
                          <div class="form-group">
                            <input id="${ str }-input" type="text" class="form-control">
                          </div>
                    </div>
    
                    <div class="modal-footer">
                        <button id="${ str }-cancel" type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button id="${ str }-ok" type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                    </div>
    
                </div>
    
            </div>

        </div>`

    const html =
        `<div id="${ id }" class="modal">

            <div class="modal-dialog modal-sm">
    
                <div class="modal-content">
    
                    <div class="modal-header">
                        <div class="modal-title">${ title }</div>
    
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
    
                    </div>
    
                    <div class="modal-body">
                          <div class="form-group">
                            <input id="${ str }-input" type="text" class="form-control">
                          </div>
                    </div>
        
                </div>
    
            </div>

        </div>`

    const fragment = document.createRange().createContextualFragment(html)

    return fragment.firstChild
}

export { createCircularViewResizeModal }
