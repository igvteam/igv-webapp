import * as DOMUtils from "./utils/dom-utils.js"
import makeDraggable from "./utils/draggable.js"

const httpMessages =
    {
        "401": "Access unauthorized",
        "403": "Access forbidden",
        "404": "Not found"
    }


class AlertDialog {
    constructor(parent) {

        // container
        this.container = DOMUtils.div({class: "igv-widgets-alert-dialog-container"})
        parent.appendChild(this.container)
        this.container.setAttribute('tabIndex', '-1')

        // header
        const header = DOMUtils.div()
        this.container.appendChild(header)

        this.errorHeadline = DOMUtils.div()
        header.appendChild(this.errorHeadline)
        this.errorHeadline.textContent = ''

        // body container
        let bodyContainer = DOMUtils.div({id: 'igv-widgets-alert-dialog-body'})
        this.container.appendChild(bodyContainer)

        // body copy
        this.body = DOMUtils.div({id: 'igv-widgets-alert-dialog-body-copy'})
        bodyContainer.appendChild(this.body)

        // ok container
        let ok_container = DOMUtils.div()
        this.container.appendChild(ok_container)

        // ok
        this.ok = DOMUtils.div()
        ok_container.appendChild(this.ok)
        this.ok.textContent = 'OK'

        // Alerts presented while one is already showing wait here until the current one is dismissed
        this.queue = []

        const okHandler = () => {

            if (typeof this.callback === 'function') {
                this.callback("OK")
                this.callback = undefined
            }
            this.body.innerHTML = ''
            DOMUtils.hide(this.container)

            if (this.queue.length > 0) {
                const {alert, callback} = this.queue.shift()
                this.show(alert, callback)
            }
        }

        this.ok.addEventListener('click', event => {

            event.stopPropagation()

            okHandler()
        })

        this.container.addEventListener('keypress', event => {

            event.stopPropagation()

            if ('Enter' === event.key) {
                okHandler()
            }
        })

        makeDraggable(this.container, header)

        DOMUtils.hide(this.container)
    }

    present(alert, callback) {
        if (this.isVisible()) {
            this.queue.push({alert, callback})
        } else {
            this.show(alert, callback)
        }
    }

    isVisible() {
        return this.container.style.display !== 'none'
    }

    show(alert, callback) {

        this.errorHeadline.textContent = alert.message ? 'ERROR' : ''
        let string = alert.message || alert

        if (httpMessages.hasOwnProperty(string)) {
            string = httpMessages[string]
        }

        this.body.replaceChildren(...messageLines(String(string)))
        this.callback = callback
        DOMUtils.show(this.container, "flex")
        this.container.focus()
    }
}

/**
 * A message is plain text, one line per point.  A line that is just a URL or file name is set apart from the prose
 * around it, and a blank line separates paragraphs.
 */
function messageLines(message) {
    return message.split('\n').map(line => {
        const div = document.createElement('div')
        if ('' === line) {
            div.className = 'igv-widgets-alert-dialog-blank-line'
        } else {
            div.textContent = line
            if (isResource(line)) {
                div.className = 'igv-widgets-alert-dialog-resource'
            }
        }
        return div
    })
}

// A single token that is a URL, or a file name with an extension
function isResource(line) {
    return /^\S+$/.test(line) && (line.includes('://') || /\.\w+$/.test(line))
}

export default AlertDialog
