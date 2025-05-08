
let didCompleteOneAttempt = false
let isDropboxEnabled = false
/**
 * Makes sure that the Dropbox API is loaded and available.  Only one attempt is made to load the API, if it fails
 * the Dropbox buttons are disabled.
 */
async function initializeDropbox() {

    if (true === didCompleteOneAttempt && false === isDropboxEnabled) {
        return false
    } else if (true === isDropboxEnabled) {
        return true
    } else {
        return new Promise((resolve, reject) => {
            didCompleteOneAttempt = true

            const dropbox = document.createElement('script')

            // dropbox.setAttribute('src', 'http://localhost:9999');
            const key = igvwebConfig.dropboxAPIKey.startsWith("e43594") ? atob(igvwebConfig.dropboxAPIKey.substring(6)) : igvwebConfig.dropboxAPIKey
            dropbox.setAttribute('src', 'https://www.dropbox.com/static/api/2/dropins.js')
            dropbox.setAttribute('id', 'dropboxjs')
            dropbox.dataset.appKey = key
            dropbox.setAttribute('type', "text/javascript")

            document.head.appendChild(dropbox)
            dropbox.addEventListener('load', () => {
                isDropboxEnabled = true
                resolve(true)
            })

        })
    }
}

export {initializeDropbox}
