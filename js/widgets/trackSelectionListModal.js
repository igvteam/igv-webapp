export default function createTrackSelectionListModal({id, label = '', sections, description = '', okHandler}) {

    // Flatten sections to get all tracks.
    const tracks = []
    const trackMap = new Map()
    const flattenSections = (sections) => {
        sections.forEach(section => {
            if (section.tracks) {
                section.tracks.forEach(track => {
                    tracks.push(track)
                    trackMap.set(track._id, track)
                })
            }
            if (section.children) {
                flattenSections(section.children)
            }
        })
    }
    flattenSections(sections)

    // Generate the HTML for the modal
    const renderTracks = (tracks) => {
        // Generate options for the select element
        // Disable options for tracks that are already loaded
        const options = tracks.map(track => {
            const disabled = track._loaded ? 'disabled' : ''
            return `<option value="${track._id}" ${disabled}>${track.name}</option>`
        }).join('')

        // Return the Bootstrap-styled select widget
        return `
         <div class="mb-3 h-100 d-flex flex-column">
            <select id="track-select" class="form-select flex-grow-1" multiple>
              ${options}
            </select>
          </div>
        `
    }

    const html = `
      <div id="${id}" class="modal fade igv-app-track-select-modal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header flex-column position-sticky top-0 bg-white z-index-1">
              <h5 class="modal-title text-center w-100">${label}</h5>
              <div class="additional-html w-100">${description}</div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body overflow-auto" style="max-height: 70vh;">
              ${renderTracks(tracks)}
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


    // Listen for the modal close event
    modalElement.addEventListener('hidden.bs.modal', () => {
        if (modalAction === 'ok') {
            console.log('Modal closed with OK button')
            const selectedOptions = Array.from(modalElement.querySelectorAll('#track-select option:checked'))
            const checkedTracks = selectedOptions.map(option => trackMap.get(option.value))
            const uncheckedTracks = []  // There is no way to unselect a track with this widget

            if (okHandler) {
                okHandler(checkedTracks, uncheckedTracks)
            } else {
                console.log('URLs of checked tracks:', checkedTracks)
            }
        }

        // Clean up resources
        modal.dispose() // Dispose of the Bootstrap modal instance
        modalElement.remove() // Remove the modal element from the DOM
        modalAction = null // Reset the action
    })

    return modal
}
