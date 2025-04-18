class OKCancelDialog {
    constructor(parent, okHandler, cancelHandler) {

        this.card = document.createElement('div');
        this.card.className = "card ok-cancel-dialog-card";
        parent.appendChild(this.card);

        this.cardBody = document.createElement('div');
        this.cardBody.className = "card-body p-4";
        this.card.appendChild(this.cardBody);

        this.messageArea = document.createElement('div');
        this.messageArea.className = "card-text mb-4";
        this.cardBody.appendChild(this.messageArea);

        this.buttonContainer = document.createElement('div');
        this.buttonContainer.className = "d-flex justify-content-center gap-2";
        this.cardBody.appendChild(this.buttonContainer);

        // OK button
        this.okButton = document.createElement('button');
        this.okButton.className = "btn btn-secondary btn-sm";
        this.okButton.textContent = "OK";
        this.buttonContainer.appendChild(this.okButton);

        // Cancel button
        this.cancelButton = document.createElement('button');
        this.cancelButton.className = "btn btn-outline-secondary btn-sm";
        this.cancelButton.textContent = "Cancel";
        this.buttonContainer.appendChild(this.cancelButton);

        // Event handlers
        this.okButton.addEventListener('click', () => {
            if (typeof okHandler === 'function') {
                okHandler();
            }
            this.hide();
        });

        this.cancelButton.addEventListener('click', () => {
            if (typeof cancelHandler === 'function') {
                cancelHandler();
            }
            this.hide();
        });

        // Handle Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible()) {
                if (typeof cancelHandler === 'function') {
                    cancelHandler();
                }
                this.hide();
            }
        });

        this.card.style.display = 'none';
    }

    present(message) {
        this.messageArea.innerHTML = message;
        this.card.style.display = "";
    }

    hide() {
        this.card.style.display = 'none';
    }

    isVisible() {
        return this.card.style.display !== 'none';
    }
}

export default OKCancelDialog;
