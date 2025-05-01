export default function createTrackSelectionModal({id, title = '', sections, headerHtml = '', okHandler}) {
    const html = `
      <div id="${id}" class="modal fade igv-app-track-select-modal" tabindex="-1">
        <div class="modal-dialog modal-lg resizable">
          <div class="modal-content">
            <div class="modal-header flex-column">
              <h5 class="modal-title text-center w-100">${title}</h5>
              <div class="additional-html w-100">${headerHtml}</div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${sections.map((section, index) => `
                <div class="mb-3">
                  ${sections.length > 1 ? `
                  <div class="bg-light text-center py-2 d-flex justify-content-between align-items-center" role="button" data-bs-toggle="collapse" data-bs-target="#collapseSection${index}" aria-expanded="true" aria-controls="collapseSection${index}">
                    <span>${section.title}</span>
                    <span id="collapseIcon${index}" class="bi bi-dash"></span>
                  </div> ` : ''}
                  <div class="collapse show" id="collapseSection${index}">
                    <form>
                      <div class="container">
                        <div class="row g-2">
                          ${section.tracks.map((track) => `
                            <div class="col-6 col-md-4">
                              <div class="form-check d-flex align-items-center">
                                <input class="form-check-input" type="checkbox" id="${track.id}" ${track.checked ? 'checked' : ''} ${track.disabled ? 'disabled' : ''}>
                                <label class="form-check-label ms-2 me-2" for="${track.id}">
                                  ${track.label}
                                </label>
                                ${track.infoURL ? `
                                  <a href="${track.infoURL}" target="_blank" style="color: darkblue;">
                                    <i class="bi bi-info-circle"></i>
                                  </a>` : ''}
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">OK</button>
            </div>
          </div>
        </div>
      </div>
    `

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html.trim()
    const modalElement = tempDiv.firstChild
    document.body.appendChild(modalElement)

    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    })

    let modalAction = null // Variable to track the action

// Add event listeners to buttons
    document.querySelector(`#${id} .btn-secondary`).addEventListener('click', () => {
        modalAction = 'ok'
    })
    document.querySelector(`#${id} .btn-outline-secondary`).addEventListener('click', () => {
        modalAction = 'cancel'
    })

    const trackMap = new Map()
    sections.forEach(section => {
        section.tracks.forEach(track => {
            trackMap.set(track.id, track)
        })
    })

    // Listen for the modal close event
    modalElement.addEventListener('hidden.bs.modal', () => {
        if (modalAction === 'ok') {
            console.log('Modal closed with OK button')
            const checkboxes = Array.from(modalElement.querySelectorAll('input[type="checkbox"]:checked'))
            const checkedTracks =
                checkboxes
                    .map(checkbox => {
                        return trackMap.get(checkbox.id)
                    })

            if (okHandler) {
                okHandler(checkedTracks)
            } else {
                console.log('URLs of checked tracks:', checkedTracks)
            }
        } else if (modalAction === 'cancel') {
            console.log('Modal closed with Cancel button')
        } else {
            console.log('Modal closed by other means')
        }

        // Clean up resources
        modal.dispose() // Dispose of the Bootstrap modal instance
        modalElement.remove() // Remove the modal element from the DOM
        modalAction = null // Reset the action
    })

    return modal
}
