function createGenericSelectModal(id, select_id) {

    return `<div id="${id}" class="modal">

                <div class="modal-dialog modal-lg">
    
                    <div class="modal-content">
    
                        <div class="modal-header">
                            <div class="modal-title"></div>
                            <button type="button" class="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>
            
                        <div class="modal-body">
                            <div class="form-group">
                                <select id="${select_id}" class="form-control" multiple></select>
                            </div>
                            <div id="igv-widgets-generic-select-modal-footnotes"></div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                        </div>
    
                    </div>
    
                </div>

            </div>`

}
export {createGenericSelectModal}
