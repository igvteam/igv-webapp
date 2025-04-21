import * as DOMUtils from "./utils/dom-utils.js"
import * as UIUtils from "./utils/ui-utils.js"

class URLLoadWidget {

    constructor({widgetParent, dataTitle, indexTitle, fileLoadManager, dataOnly}) {

        dataTitle = dataTitle || 'Data'

        indexTitle = indexTitle || 'Index'

        this.fileLoadManager = fileLoadManager

        dataOnly = dataOnly || false


        // file load widget
        this.container = DOMUtils.div({class: 'igv-file-load-widget-container'})
        widgetParent.appendChild(this.container)

        const  config =
                {
                    parent: this.container,
                    dataTitle: dataTitle + ' URL',
                    indexTitle: indexTitle + ' URL',
                    dataOnly
                }


        this.createInputContainer(config)

        // error message container
        this.error_message = DOMUtils.div({class: 'igv-flw-error-message-container'})
        this.container.appendChild(this.error_message)

        // error message
        this.error_message.appendChild(DOMUtils.div({class: 'igv-flw-error-message'}))

        // error dismiss button
        UIUtils.attachDialogCloseHandlerWithParent(this.error_message, () => {
            this.dismissErrorMessage()
        })

        this.dismissErrorMessage()

    }

    retrievePaths() {

        this.fileLoadManager.ingestPath(this.inputData.value, false)
        if (this.inputIndex) {
            this.fileLoadManager.ingestPath(this.inputIndex.value, true)
        }

        let paths = []
        if (this.fileLoadManager.dictionary) {

            if (this.fileLoadManager.dictionary.data) {
                paths.push(this.fileLoadManager.dictionary.data)
            }
            if (this.fileLoadManager.dictionary.index) {
                paths.push(this.fileLoadManager.dictionary.index)
            }
        }

        // clear input elements
        this.container.querySelectorAll('.igv-flw-input-row').forEach(div => {
            div.querySelector('input').value = ''
        })

        return paths

    }

    presentErrorMessage(message) {
        this.error_message.querySelector('.igv-flw-error-message').textContent = message
        DOMUtils.show(this.error_message)
    }

    dismissErrorMessage() {
        DOMUtils.hide(this.error_message)
        this.error_message.querySelector('.igv-flw-error-message').textContent = ''
    }

    present() {
        DOMUtils.show(this.container)
    }

    dismiss() {

        this.dismissErrorMessage()

        // const e = this.container.querySelector('.igv-flw-local-file-name-container');
        // if (e) {
        //     DOMUtils.hide(e);
        // }

        // clear input elements
        this.container.querySelectorAll('.igv-flw-input-row').forEach(div => {
            div.querySelector('input').value = ''
        })

        this.fileLoadManager.reset()

    }

    createInputContainer({parent, doURL, dataTitle, indexTitle, dataOnly}) {

        // container
        const container = DOMUtils.div({class: 'igv-flw-input-container'})
        parent.appendChild(container)

        // data
        const input_data_row = DOMUtils.div({class: 'igv-flw-input-row'})
        container.appendChild(input_data_row)

        let label

        // label
        label = DOMUtils.div({class: 'igv-flw-input-label'})
        input_data_row.appendChild(label)
        label.textContent = dataTitle

            this.createURLContainer(input_data_row, 'igv-flw-data-url', false)

        if (true === dataOnly) {
            return
        }

        // index
        const input_index_row = DOMUtils.div({class: 'igv-flw-input-row'})
        container.appendChild(input_index_row)

        // label
        label = DOMUtils.div({class: 'igv-flw-input-label'})
        input_index_row.appendChild(label)
        label.textContent = indexTitle

            this.createURLContainer(input_index_row, 'igv-flw-index-url', true)

    }

    createURLContainer(parent, id, isIndexFile) {

        const input = DOMUtils.create('input')
        input.setAttribute('type', 'text')
        // input.setAttribute('placeholder', (true === isIndexFile ? 'Enter index URL' : 'Enter data URL'));
        parent.appendChild(input)

        if (isIndexFile) {
            this.inputIndex = input
        } else {
            this.inputData = input
        }

    }

}

export default URLLoadWidget
