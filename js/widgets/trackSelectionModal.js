export default function createTrackSelectionModal({id, label = '', sections, description = '', okHandler}) {
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
          ${renderSections(sections, 0)}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">OK</button>
        </div>
      </div>
    </div>
  </div>
`

    function renderSections(sections, level) {
        return sections.map((section, index) => {
            //console.log(`Rendering section: ${section.label}, level: ${level}`);
            return `
    <div class="mb-3">
    
      ${level === 0 ? `
      <div class="bg-light text-center py-2 d-flex justify-content-between align-items-center" role="button" data-bs-toggle="collapse" data-bs-target="#collapseSection${index}" aria-expanded="true" aria-controls="collapseSection${index}">
        <span style="font-size: 1.2rem;">${section.label}</span>
        <span id="collapseIcon${index}" class="bi bi-dash"></span>
      </div>` : ''}        

      ${level === 0 ?
                `<div class="collapse show mt-3" id="collapseSection${index}">` :
                `<fieldset class="border rounded-3 p-3">
          <legend class="form-check-label float-none w-auto px-3" style="font-size: 1.0rem;">
             ${section.label}
          </legend><div>`}
        <form>
          <div class="container">
            <div class="row g-2">
              ${section.tracks ? section.tracks.map((track) => `
                <div class="col-6 col-md-4">
                  <div class="form-check d-flex align-items-center">
                    <input class="form-check-input" type="checkbox" id="${track._id}" ${track._checked ? 'checked' : ''} ${track.disabled ? 'disabled' : ''}>
                    <label class="form-check-label ms-2 me-2" for="${track._id}">
                      ${track.name}
                    </label>
                    ${track.html ? `
                      <a href="${track.html}" target="_blank" style="color: darkblue;">
                        <i class="bi bi-info-circle"></i>
                      </a>` : ''}
                  </div>
                </div>
              `).join('') : ''}
            </div>
            ${section.children ? `<div class="mt-3">${renderSections(section.children, level + 1)}</div>` : ''}
          </div>
        </form>
      ${level === 0 ? `</div>` : '</div></fieldset>'}
    </div>`
        }).join('')
    }

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
    const fillTrackMap = (sections) => {
        sections.forEach(section => {
            if (section.tracks) {
                section.tracks.forEach(track => {
                    trackMap.set(track._id, track)
                })
            }
            if (section.children) {
                fillTrackMap(section.children)
            }
        })
    }
    fillTrackMap(sections)


    // Listen for the modal close event
    modalElement.addEventListener('hidden.bs.modal', () => {
        if (modalAction === 'ok') {
            console.log('Modal closed with OK button')
            const checkboxes = Array.from(modalElement.querySelectorAll('input[type="checkbox"]:checked'))
            const checkedTracks =
                checkboxes
                    .map(checkbox => {
                        const trackConfig = trackMap.get(checkbox.id)
                        return trackConfig
                    })

            if (okHandler) {
                okHandler(checkedTracks)
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
