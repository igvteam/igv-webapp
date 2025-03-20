class CustomDialog {
    constructor(parent) {
        // Create card
        this.card = document.createElement('div');
        this.card.className = "card custom-dialog-card";
        parent.appendChild(this.card);

        // Create card body
        this.cardBody = document.createElement('div');
        this.cardBody.className = "card-body p-4";
        this.card.appendChild(this.cardBody);

        // Create message area
        this.messageArea = document.createElement('div');
        this.messageArea.className = "card-text mb-4";
        this.cardBody.appendChild(this.messageArea);

        // Create button container
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.className = "d-flex justify-content-center gap-2";
        this.cardBody.appendChild(this.buttonContainer);

        // Create buttons
        this.gotItButton = document.createElement('button');
        this.gotItButton.className = "btn btn-primary btn-sm";
        this.gotItButton.textContent = "Got it";
        this.buttonContainer.appendChild(this.gotItButton);

        this.remindButton = document.createElement('button');
        this.remindButton.className = "btn btn-secondary btn-sm";
        this.remindButton.textContent = "Remind me later";
        this.buttonContainer.appendChild(this.remindButton);

        // Add event listeners
        this.gotItButton.addEventListener('click', () => this.handleGotIt());
        this.remindButton.addEventListener('click', () => this.handleRemind());

        // Handle Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.card.style.display !== 'none') {
                this.handleRemind();
            }
        });

        // Hide initially
        this.card.style.display = 'none';
    }

    handleGotIt() {
        if (typeof this.callback === 'function') {
            this.callback("GOT_IT");
            this.callback = undefined;
        }
        this.card.style.display = 'none';
    }

    handleRemind() {
        if (typeof this.callback === 'function') {
            this.callback("REMIND_LATER");
            this.callback = undefined;
        }
        this.card.style.display = 'none';
    }

    present(message, callback) {
        this.messageArea.textContent = message;
        this.callback = callback;
        this.card.style.display = "";
    }
}

export default CustomDialog;
