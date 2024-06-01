/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import igv from '../node_modules/igv/dist/igv.esm.min.js'
import AlertSingleton from './widgets/alertSingleton.js'
import {QRCode} from './widgets/qrcode.js'
import {doShortenURL, setURLShortener, shortSessionURL} from './shareHelper.js'

function createShareWidgets({browser, container, modal, share_input, copy_link_button, qrcode_button, qrcode_image, embed_container, embed_button, embedTarget}) {

    $(modal).on('shown.bs.modal', async () => {


        let session = undefined
        try {
            session = browser.compressedSession();
        } catch (e) {
            AlertSingleton.present(e.message)
        }

        if (session) {

            if (embedTarget) {
                const snippet = getEmbeddableSnippet(container, embedTarget, session);
                const textArea = embed_container.querySelector('textarea');
                textArea.value = snippet;
                textArea.select();
            }

            document.querySelector('#igv-share-url-radio-pair-container').style.display = 'block'/*doShortenURL() ? 'block' : 'none'*/

            let href = window.location.href.slice();
            const idx = href.indexOf("?");
            if (idx > 0) {
                href = href.substring(0, idx);
            }

            const sessionURL = doShortenURL() ? shortSessionURL(href, session) : `${href}?sessionURL=blob:${session}`

            share_input.value = sessionURL
            share_input.select()

            qrcode_image.innerHTML = '';
            const qrcode = new QRCode(qrcode_image, { width: 128, height: 128, correctLevel: QRCode.CorrectLevel.H });
            qrcode.makeCode('https://tinyurl.com/m9ccbzkj');

        } else {
            $(modal).modal('hide');
        }

    });

    $(modal).on('hidden.bs.modal', () => {
        embed_container.style.display = 'none';
        qrcode_image.style.display = 'none';
    });

    copy_link_button.addEventListener('click', () => {
        share_input.select();
        const success = document.execCommand('copy');
        if (success) {
            $(modal).modal('hide');
        } else {
            console.error('fail!');
        }
    });


    if (embedTarget) {
        const button = embed_container.querySelector('button');
        button.addEventListener('click', () => {

            const textArea = embed_container.querySelector('textarea');
            textArea.select();

            const success = document.execCommand('copy');

            if (success) {
                $(modal).modal('hide');
            } else {
                console.error('fail!');
            }
        });

        embed_button.addEventListener('click', () => {

            qrcode_image.style.display = 'none';

            if ('block' === embed_container.style.display) {
                embed_container.style.display = 'none';
            } else {
                embed_container.style.display = 'block';
            }

        });
    } else {
        embed_button.style.display = 'none';
    }

    qrcode_button.addEventListener('click', () => {

        embed_container.style.display = 'none';

        if ('block' === qrcode_image.style.display) {
            qrcode_image.style.display = 'none';
        } else {
            qrcode_image.style.display = 'block';
        }

    });

}


function getEmbeddableSnippet(container, embedTarget, session) {
    const embedUrl = `${ embedTarget }?sessionURL=blob:${ session }`
    const height = container.clientHeight + 50;
    return '<iframe src="' + embedUrl + '" style="width:100%; height:' + height + 'px"  allowfullscreen></iframe>';
}

// {urlShortener, embedTarget}
function shareWidgetConfigurator(browser, container, options) {

    let urlShortenerFn;

    if (options.urlShortener) {
        urlShortenerFn = setURLShortener(urlShortener) !== undefined;
    }

    return {
        browser,
        container,
        modal: document.getElementById('igv-app-share-modal'),
        share_input: document.getElementById('igv-app-share-input'),
        copy_link_button: document.getElementById('igv-app-copy-link-button'),
        qrcode_button: document.getElementById('igv-app-qrcode-button'),
        qrcode_image: document.getElementById('igv-app-qrcode-image'),
        embed_container: document.getElementById('igv-app-embed-container'),
        embed_button: document.getElementById('igv-app-embed-button'),
        embedTarget: options.embedTarget || `https://igv.org/web/release/${igv.version()}/embed.html`
    };

}

export {createShareWidgets, shareWidgetConfigurator}
