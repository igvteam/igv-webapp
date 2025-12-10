export default function createTrackSelectionModal({id, label = '', groups, description = '', okHandler}) {
    const html = `
  <div id="${id}" class="modal fade igv-app-track-select-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header flex-column position-sticky top-0 bg-white z-index-1 position-relative">
          <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
          <h5 class="modal-title text-center w-100">${label}</h5>
          <div class="additional-html w-100">${description}</div>
          <div class="w-100 d-flex justify-content-between mt-2" style="display: ${groups.length <= 1 ? 'none' : 'flex'} !important;">
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-outline-secondary expand-all-btn">Expand All</button>
              <button type="button" class="btn btn-sm btn-outline-secondary collapse-all-btn">Collapse All</button>
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary deselect-all-btn">Deselect All</button>
          </div>
        </div>
        <div class="modal-body overflow-auto" style="max-height: 70vh;">
          ${renderGroups(groups, 0)}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">OK</button>
        </div>
      </div>
    </div>
  </div>
`

    function renderGroups(groups, level) {
        const isSingleGroup = groups.length === 1 && level === 0
        return groups.map((group, index) => {
            //console.log(`Rendering group: ${group.label}, level: ${level}`);
            return `
    <div class="mb-3">
    
      ${level === 0 && !isSingleGroup ? `
      <div class="bg-light text-center py-2 d-flex justify-content-between align-items-center" role="button" data-bs-toggle="collapse" data-bs-target="#collapseSection${index}" aria-expanded="true" aria-controls="collapseSection${index}">
        <span style="font-size: 1.0rem;">${group.label}</span>
        <span id="collapseIcon${index}" class="bi bi-dash"></span>
      </div>` : ''}        

      ${level === 0 && !isSingleGroup ?
                `<div class="collapse show mt-3" id="collapseSection${index}">` :
                level === 0 && isSingleGroup ? '<div>' :
                `<fieldset class="border rounded-3 p-3">
          <legend class="form-check-label float-none w-auto px-3" style="font-size: 0.8rem;">
             ${group.label}
          </legend><div>`}
        <form>
          <div class="container">
            <div class="row g-2">
              ${group.tracks ? group.tracks.map((track) => `
                <div class="col-6 col-md-4">
                  <div class="form-check d-flex align-items-center">
                    <input class="form-check-input" type="checkbox" id="${track._id}" ${track._loaded ? 'checked' : ''} ${track.disabled ? 'disabled' : ''}>
                    <label class="form-check-label ms-2 me-2" for="${track._id}" style="font-size: 0.9rem;">
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
            ${group.children ? `<div class="mt-3">${renderGroups(group.children, level + 1)}</div>` : ''}
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
    let lastCheckedCheckbox = null // Track the last checked checkbox for shift-select

    // Add event listeners to buttons
    document.querySelector(`#${id} .btn-secondary`).addEventListener('click', () => {
        modalAction = 'ok'
    })
    document.querySelector(`#${id} .btn-outline-secondary`).addEventListener('click', () => {
        modalAction = 'cancel'
    })

    // Add event listeners for expand/collapse all buttons
    const collapseSections = modalElement.querySelectorAll('[id^="collapseSection"]')
    const collapseIcons = modalElement.querySelectorAll('[id^="collapseIcon"]')

    document.querySelector(`#${id} .expand-all-btn`).addEventListener('click', () => {
        collapseSections.forEach((section, index) => {
            const bsCollapse = bootstrap.Collapse.getInstance(section) || new bootstrap.Collapse(section, { toggle: false })
            bsCollapse.show()
            collapseIcons[index].classList.remove('bi-plus')
            collapseIcons[index].classList.add('bi-dash')
        })
    })

    document.querySelector(`#${id} .collapse-all-btn`).addEventListener('click', () => {
        collapseSections.forEach((section, index) => {
            const bsCollapse = bootstrap.Collapse.getInstance(section) || new bootstrap.Collapse(section, { toggle: false })
            bsCollapse.hide()
            collapseIcons[index].classList.remove('bi-dash')
            collapseIcons[index].classList.add('bi-plus')
        })
    })

    // Update icons when sections are manually toggled
    collapseSections.forEach((section, index) => {
        section.addEventListener('shown.bs.collapse', () => {
            collapseIcons[index].classList.remove('bi-plus')
            collapseIcons[index].classList.add('bi-dash')
        })
        section.addEventListener('hidden.bs.collapse', () => {
            collapseIcons[index].classList.remove('bi-dash')
            collapseIcons[index].classList.add('bi-plus')
        })
    })

    // Add shift-select functionality to checkboxes
    const checkboxes = Array.from(modalElement.querySelectorAll('input[type="checkbox"]'))

    // Add event listener for Deselect All button
    const deselectAllBtn = document.querySelector(`#${id} .deselect-all-btn`)
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            checkboxes.forEach(checkbox => {
                if (!checkbox.disabled) {
                    checkbox.checked = false
                }
            })
        })
    }

    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('click', (e) => {
            if (!lastCheckedCheckbox) {
                lastCheckedCheckbox = checkbox
                return
            }

            if (e.shiftKey) {
                const lastIndex = checkboxes.indexOf(lastCheckedCheckbox)
                const currentIndex = index
                const start = Math.min(lastIndex, currentIndex)
                const end = Math.max(lastIndex, currentIndex)

                // Check all checkboxes in between
                for (let i = start; i <= end; i++) {
                    if (!checkboxes[i].disabled) {
                        checkboxes[i].checked = checkbox.checked
                    }
                }
            }

            lastCheckedCheckbox = checkbox
        })
    })

    const trackMap = new Map()
    const fillTrackMap = (groups) => {
        groups.forEach(group => {
            if (group.tracks) {
                group.tracks.forEach(track => {
                    trackMap.set(track._id, track)
                })
            }
            if (group.children) {
                fillTrackMap(group.children)
            }
        })
    }
    fillTrackMap(groups)


    // Listen for the modal close event
    modalElement.addEventListener('hidden.bs.modal', () => {
        if (modalAction === 'ok') {
            console.log('Modal closed with OK button')
            const checkedCheckboxes = Array.from(modalElement.querySelectorAll('input[type="checkbox"]:checked'))
            const checkedTracks =
                checkedCheckboxes
                    .map(checkbox => {
                        const trackConfig = trackMap.get(checkbox.id)
                        return trackConfig
                    })
            const uncheckedCheckboxes = Array.from(modalElement.querySelectorAll('input[type="checkbox"]:not(:checked)'))
            const uncheckedTracks =
                uncheckedCheckboxes
                    .map(checkbox => {
                        const trackConfig = trackMap.get(checkbox.id)
                        return trackConfig
                    })

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
