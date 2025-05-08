import createStringInputModal from "./stringInputModal.js"
import alertSingleton from "./alertSingleton.js"

function createToolsWidgets(rootContainer, browser, options) {


    // Blat
    const blatModalID = 'igv-blat-input-modal'
    const handler = async (blatSequence) => {

        if (blatSequence) {
            if (blatSequence.length < 20 || blatSequence.length > 8000) {
                alertSingleton.present("BLAT sequences must be between 20 and 8000 bases in length.")
                return false
            } else {
                await browser.blat(blatSequence, options)
                return true
            }
        }

    }
    //{title, prompt, type, rows, cols, minLength, maxLength, placeholder}
    createStringInputModal(rootContainer, blatModalID, handler,
        {
            title: 'Enter BLAT Sequence',
            type: 'textarea',
            rows: 10,
            cols: 80,
            minLength: 20,
            maxLength: 8000,
            placeholder: 'Enter BLAT query sequence here'
        })
}


export {createToolsWidgets}
