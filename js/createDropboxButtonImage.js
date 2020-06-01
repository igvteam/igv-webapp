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

const dropboxButtonImageBase64 = () => window.btoa(dropboxButtonImageLiteral)

export { dropboxButtonImageBase64 }
