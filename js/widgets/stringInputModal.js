export default function createStringInputModal($rootContainer, modalID, handler,
                                               {title, prompt, type, rows, cols, minLength, maxLength, placeholder}) {

    const blatModalElement = createModalElement(modalID, title)
    $rootContainer.get(0).appendChild(blatModalElement)
    const blatModal = new bootstrap.Modal(blatModalElement)

    const parent = blatModalElement.querySelector('.modal-body')

    const container = div('igv-file-load-widget-container')
    parent.appendChild(container)


    let input_data_row
    if (prompt) {
        input_data_row = div('igv-flw-input-row')
        container.appendChild(input_data_row)
        // label
        const labelElem = div('igv-flw-input-label')
        input_data_row.appendChild(labelElem)
        labelElem.textContent = prompt
    }

    type = type || 'text'
    let input
    if ('text' === type) {
        input = document.createElement('input')
        input.setAttribute('type', 'text')
    } else {
        input = document.createElement(type)
    }
    if (placeholder) input.setAttribute('placeholder', placeholder)
    if (rows) input.setAttribute('rows', rows)
    if (cols) input.setAttribute('cols', cols)
    if (minLength) input.setAttribute('minlength', minLength)
    if (maxLength) input.setAttribute('maxlength', maxLength)

    const targetContainer = input_data_row || container;
    targetContainer.appendChild(input);

    const doDismiss = () => {
        blatModal.hide()
    }

    const doOK = async () => {
        const value = input.value
        const success = await handler(value)
        if(success !== false) {
            // Clear the input field
            input.value = ''
            blatModal.hide()
        }
    }

    const modalElement = blatModal._element

    // x - button
    modalElement.querySelector('.modal-header button').addEventListener('click', doDismiss)

    // ok - button
    modalElement.querySelector('.modal-footer button:nth-child(2)').addEventListener('click', doOK)

    modalElement.addEventListener('keypress', event => {
        if ('Enter' === event.key) {
            doOK()
        }
    })
}

function createModalElement(id, title) {

    const html =
        `<div id="${id}" class="modal fade" tabindex="-1">

        <div class="modal-dialog modal-lg">
    
            <div class="modal-content">
    
                <div class="modal-header">
                    <div class="modal-title">${title}</div>
    
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    
                </div>
    
                <div class="modal-body">
                </div>
    
                <div class="modal-footer">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-sm btn-secondary" >OK</button>
                </div>
    
            </div>
    
        </div>

    </div>`

    const fragment = document.createRange().createContextualFragment(html)

    return fragment.firstChild
}

// Convenience function to create a div with a class
function div(className) {
    const div = document.createElement('div')
    div.classList.add(className)
    return div
}

