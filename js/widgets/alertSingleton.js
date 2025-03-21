import AlertDialog from './alertDialog.js'

class AlertSingleton {
    constructor() {
        if (AlertSingleton.instance) {
            return AlertSingleton.instance;
        }
        
        this.alertDialog = undefined;
        AlertSingleton.instance = this;
    }

    init(root) {
        if (!this.alertDialog) {
            this.alertDialog = new AlertDialog(root);
        }
    }

    present(alert, callback) {
        if (!this.alertDialog) {
            throw new Error('AlertSingleton must be initialized with init() before use');
        }
        this.alertDialog.present(alert, callback);
    }
}

// Create and export a single instance
const alertSingleton = new AlertSingleton();
export default alertSingleton;
