import CustomDialog from './customDialog.js'

class CustomDialogSingleton {
    constructor() {
        if (CustomDialogSingleton.instance) {
            return CustomDialogSingleton.instance;
        }

        this.customDialog = undefined;
        CustomDialogSingleton.instance = this;
    }

    init(root) {
        if (!this.customDialog) {
            this.customDialog = new CustomDialog(root);
        }
    }

    present(message, callback) {
        if (!this.customDialog) {
            throw new Error('CustomDialogSingleton must be initialized with init() before use');
        }
        this.customDialog.present(message, callback);
    }

    setButtonText(okText, cancelText) {
        if (!this.customDialog) {
            throw new Error('CustomDialogSingleton must be initialized with init() before use');
        }
        this.customDialog.setButtonText(okText, cancelText);
    }
}

// Create and export a single instance
const customDialogSingleton = new CustomDialogSingleton();
export default customDialogSingleton;
