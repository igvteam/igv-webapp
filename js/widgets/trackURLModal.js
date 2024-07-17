const createTrackURLModalElement = id => {

    const html =
        `<div id="${id}" class="modal fade" tabindex="-1">

        <div class="modal-dialog modal-lg">
    
            <div class="modal-content">
    
                <div class="modal-header">
                    <div class="modal-title">Track URL</div>
    
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    
                </div>
    
                <div class="modal-body">
                </div>
    
                <div class="modal-footer">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">OK</button>
                </div>
    
            </div>
    
        </div>

    </div>`

    const fragment = document.createRange().createContextualFragment(html)

    return fragment.firstChild

}

export {createTrackURLModalElement}
