function configureModal(fileLoadWidget, modal, okHandler) {

    const doDismiss = () => {
        fileLoadWidget.dismiss()
        $(modal).modal('hide')
    }

    const doOK = async () => {

        const result = await okHandler(fileLoadWidget)

        if (true === result) {
            fileLoadWidget.dismiss()
            $(modal).modal('hide')
        }
    }

    let dismiss

    // upper dismiss - x - button
    dismiss = modal.querySelector('.modal-header button')
    dismiss.addEventListener('click', doDismiss)

    // lower dismiss - close - button
    dismiss = modal.querySelector('.modal-footer button:nth-child(1)')
    dismiss.addEventListener('click', doDismiss)

    // ok - button
    const ok = modal.querySelector('.modal-footer button:nth-child(2)')

    ok.addEventListener('click', doOK)

    modal.addEventListener('keypress', event => {
        if ('Enter' === event.key) {
            doOK()
        }
    })
}

export {configureModal}
