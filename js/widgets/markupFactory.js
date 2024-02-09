const dropboxButtonImageLiteral =
    `<svg width="75px" height="64px" viewBox="0 0 75 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>Shape</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="dropbox" fill="#0061FF" fill-rule="nonzero">
                <path d="M37.6,12 L18.8,24 L37.6,36 L18.8,48 L1.42108547e-14,35.9 L18.8,23.9 L1.42108547e-14,12 L18.8,0 L37.6,12 Z M18.7,51.8 L37.5,39.8 L56.3,51.8 L37.5,63.8 L18.7,51.8 Z M37.6,35.9 L56.4,23.9 L37.6,12 L56.3,0 L75.1,12 L56.3,24 L75.1,36 L56.3,48 L37.6,35.9 Z" id="Shape"></path>
            </g>
        </g>
    </svg>`

const googleDriveImageLiteral =
    `<svg viewBox="0 0 139 120.4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><radialGradient id="a" cx="-254.81979" cy="705.83588" gradientTransform="matrix(2.827 1.6322 -1.6322 2.827 2092.1199 -1494.5786)" gradientUnits="userSpaceOnUse" r="82.978401"><stop offset="0" stop-color="#4387fd"/><stop offset=".65" stop-color="#3078f0"/><stop offset=".9099" stop-color="#2b72ea"/><stop offset="1" stop-color="#286ee6"/></radialGradient><radialGradient id="b" cx="-254.8174" cy="705.83691" gradientTransform="matrix(2.827 1.6322 -1.6322 2.827 2092.1199 -1494.5786)" gradientUnits="userSpaceOnUse" r="82.973"><stop offset="0" stop-color="#ffd24d"/><stop offset="1" stop-color="#f6c338"/></radialGradient><path d="m24.2 120.4-24.2-41.9 45.3-78.5 24.2 41.9z" fill="#0da960"/><path d="m24.2 120.4 24.2-41.9h90.6l-24.2 41.9z" fill="url(#a)"/><path d="m139 78.5h-48.4l-45.3-78.5h48.4z" fill="url(#b)"/><path d="m69.5 78.5h-21.1l10.5-18.3-34.7 60.2z" fill="#2d6fdd"/><path d="m90.6 78.5h48.4l-58.9-18.3z" fill="#e5b93c"/><path d="m58.9 60.2 10.6-18.3-24.2-41.9z" fill="#0c9b57"/></svg>`

const dropboxButtonImageBase64 = () => window.btoa(dropboxButtonImageLiteral)

const googleDriveButtonImageBase64 = () => window.btoa(googleDriveImageLiteral)

const dropboxDropdownItem = id => {

    return `<div class="dropdown-item">
                <div id="${id}" class="igv-app-dropdown-item-cloud-storage">
                    <div>Dropbox File</div>
                    <div>
                        <img src="data:image/svg+xml;base64,${dropboxButtonImageBase64()}" width="18" height="18">
                    </div>
                </div>
            </div>`
}

const googleDriveDropdownItem = id => {

    return `<div class="dropdown-item">
                <div id="${id}" class="igv-app-dropdown-item-cloud-storage">
                    <div>Google Drive File</div>
                    <div>
                        <img src="data:image/svg+xml;base64,${googleDriveButtonImageBase64()}" width="18" height="18">
                    </div>
                </div>
            </div>`
}

export {dropboxButtonImageBase64, googleDriveButtonImageBase64, dropboxDropdownItem, googleDriveDropdownItem}
