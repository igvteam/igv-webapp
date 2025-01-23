import igv from '../../node_modules/igv/dist/igv.esm.js'

class AlertSingleton {
    constructor(root) {

        if (root) {
            this.alertDialog = undefined
        }
    }

    init(root) {
        this.alertDialog = new igv.AlertDialog(root)
    }

    present(alert, callback) {
        this.alertDialog.present(alert, callback)
    }

}

export default new AlertSingleton()
