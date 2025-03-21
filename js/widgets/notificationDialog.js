class NotificationDialog {
    constructor(parent, key) {

        this.card = document.createElement('div');
        this.card.className = "card custom-dialog-card";
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

        this.gotItButton = document.createElement('button');
        this.gotItButton.className = "btn btn-secondary btn-sm";
        this.gotItButton.textContent = "Got it";
        this.buttonContainer.appendChild(this.gotItButton);

        this.remindButton = document.createElement('button');
        this.remindButton.className = "btn btn-secondary btn-sm";
        this.remindButton.textContent = "Remind me later";
        this.buttonContainer.appendChild(this.remindButton);

        this.gotItButton.addEventListener('click', () => this.handleGotIt(key));
        this.remindButton.addEventListener('click', () => this.handleRemind());

        // Handle Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.card.style.display !== 'none') {
                this.handleRemind()
            }
        });

        this.card.style.display = 'none';
    }

    handleGotIt(key) {
        localStorage.setItem(key, "true")
        this.card.style.display = 'none';
    }

    handleRemind() {
        this.card.style.display = 'none';
    }

    present(str) {
        this.messageArea.innerHTML = str
        this.card.style.display = "";
    }
}

export default NotificationDialog;
