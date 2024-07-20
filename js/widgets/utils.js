function configureModal(fileLoadWidget, modal, okHandler) {

    const doDismiss = () => {
        fileLoadWidget.dismiss()
        modal.hide()
    }

    const doOK = async () => {

        const result = await okHandler(fileLoadWidget)

        if (true === result) {
            fileLoadWidget.dismiss()
            modal.hide()
        }
    }


    const modalElement = modal._element

    let dismiss

    // upper dismiss - x - button
    dismiss = modalElement.querySelector('.modal-header button')
    dismiss.addEventListener('click', doDismiss)

    // lower dismiss - close - button
    dismiss = modalElement.querySelector('.modal-footer button:nth-child(1)')
    dismiss.addEventListener('click', doDismiss)

    // ok - button
    const ok = modalElement.querySelector('.modal-footer button:nth-child(2)')

    ok.addEventListener('click', doOK)

    modalElement.addEventListener('keypress', event => {
        if ('Enter' === event.key) {
            doOK()
        }
    })
}

export {configureModal}
