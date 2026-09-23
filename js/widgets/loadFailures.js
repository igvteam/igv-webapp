import alertSingleton from "./alertSingleton.js"

/**
 * Present the optional parts of a genome or session load that failed, as returned by igv.js: the array from
 * browser.loadSession, or genome.loadFailures from browser.loadGenome.  One combined alert, because the alert dialog
 * is a single instance, so separate alerts would show only the last.
 *
 * @param loadFailures  Array of {kind, url, message}, possibly undefined for an igv.js that doesn't return them
 */
function presentLoadFailures(loadFailures) {

    console.log('load failures', loadFailures)

    if (!loadFailures || 0 === loadFailures.length) {
        return
    }

    // An igv.js message often names the url already ("Error accessing resource: <url> status: 404")
    const lines = loadFailures.map(({url, message}) => String(message).includes(url) ?
        escapeHTML(message) :
        `${escapeHTML(url)}<br>${escapeHTML(message)}`)
    alertSingleton.present(`Some resources could not be loaded:<br><br>${lines.join('<br><br>')}`)
}

// The alert dialog sets innerHTML, and urls and messages come from user-supplied configurations
function escapeHTML(string) {
    return String(string)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}

export {presentLoadFailures}
