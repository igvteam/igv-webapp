
/**
 * Setup scroll wheel zoom functionality with shift key modifier
 * @param {HTMLElement} container - The IGV container element
 * @param {Object} browser - The IGV browser instance
 */
function setupScrollWheelZoom(container, browser) {
    container.addEventListener('wheel', (event) => {
        // Only zoom if shift key is pressed
        if (event.shiftKey) {
            event.preventDefault()
            event.stopPropagation()

            // Determine zoom direction based on wheel delta
            // Positive deltaY means scrolling down (zoom out), negative means scrolling up (zoom in)
            const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9

            browser.zoomWithScaleFactor(scaleFactor)
        }
    }, { passive: false })
}

/**
 * Setup keyboard shortcuts for zoom in/out
 * Supports: +, =, - keys (with optional Shift modifier)
 * @param {Object} browser - The IGV browser instance
 */
function setupKeyboardZoom(browser) {
    document.addEventListener('keydown', (event) => {
        // Check if user is typing in an input field
        const target = event.target
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return
        }

        // Zoom in: + or = keys (= is on same key as + without shift on US keyboards)
        if (event.key === '+' || event.key === '=') {
            event.preventDefault()
            browser.zoomWithScaleFactor(1.5)
        }
        // Zoom out: - key
        else if (event.key === '-' || event.key === '_') {
            event.preventDefault()
            browser.zoomWithScaleFactor(0.67)
        }
    })
}

export {setupScrollWheelZoom, setupKeyboardZoom}