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

import {AlertSingleton, QRCode} from '../node_modules/igv-widgets/dist/igv-widgets.js'
import {setURLShortener, shortSessionURL} from './shareHelper.js'

function createShareWidgets({browser, $container, $modal, $share_input, $copy_link_button, $tweet_button_container, $email_button, $qrcode_button, $qrcode_image, $embed_container, $embed_button, embedTarget}) {

    if (undefined === embedTarget) {
        embedTarget = getEmbedTarget();
    }

    $modal.on('shown.bs.modal', async function (e) {

        let href = window.location.href.slice();
        const idx = href.indexOf("?");
        if (idx > 0) {
            href = href.substring(0, idx);
        }

        let session = undefined
        try {
            session = browser.compressedSession();
        } catch (e) {
            AlertSingleton.present(e.message)
        }

        if (session) {

            if (embedTarget) {
                const snippet = getEmbeddableSnippet($container, embedTarget, session);
                $embed_container.find('textarea').val(snippet);
                $embed_container.find('textarea').get(0).select();
            }

            const shortURL = await shortSessionURL(href, session);
            $share_input.val(shortURL);
            $share_input.get(0).select();
            $email_button.attr('href', 'mailto:?body=' + shortURL);

            // QR code generation
            $qrcode_image.empty();
            const obj =
                {
                    width: 128,
                    height: 128,
                    correctLevel: QRCode.CorrectLevel.H
                };

            const qrcode = new QRCode($qrcode_image.get(0), obj);
            qrcode.makeCode(shortURL);

            if ($tweet_button_container) {
                $tweet_button_container.empty();
                const obj = {text: ''};
                window.twttr.widgets.createShareButton(shortURL, $tweet_button_container.get(0), obj);
            }
        } else {
            $modal.modal('hide');
        }

    });

    $modal.on('hidden.bs.modal', function (e) {
        $embed_container.hide();
        $qrcode_image.hide();
    });

    $copy_link_button.on('click', function (e) {
        $share_input.get(0).select();
        const success = document.execCommand('copy');
        if (success) {
            $modal.modal('hide');
        } else {
            console.log('fail!');
        }
    });


    if (undefined === embedTarget) {
        $embed_button.hide();
    } else {
        $embed_container.find('button').on('click', function (e) {
            var success;

            $embed_container.find('textarea').get(0).select();
            success = document.execCommand('copy');

            if (success) {
                $modal.modal('hide');
            } else {
                console.log('fail!');
            }
        });

        $embed_button.on('click', function (e) {
            $qrcode_image.hide();
            $embed_container.toggle();
        });
    }

    $qrcode_button.on('click', function (e) {
        $embed_container.hide();
        $qrcode_image.toggle();
    });

}

function getEmbeddableSnippet($container, embedTarget, session) {
    const embedUrl = embedTarget + "?sessionURL=blob:" + session;
    const height = $container.height() + 50;
    return '<iframe src="' + embedUrl + '" style="width:100%; height:' + height + 'px"  allowfullscreen></iframe>';
}

/**
 * Get the default embed html target.  Assumes an "embed.html" file in same directory as this page
 */
function getEmbedTarget() {

    let href = window.location.href.slice();
    let idx = href.indexOf("?");
    if (idx > 0) {
        href = href.substring(0, idx);
    }
    idx = href.lastIndexOf("/");
    return href.substring(0, idx) + "/embed.html"

}

function shareWidgetConfigurator(browser, $container, {urlShortener, embedTarget}) {

    let urlShortenerFn;

    if (urlShortener) {
        urlShortenerFn = setURLShortener(urlShortener) !== undefined;
    }

    let $igv_app_tweet_button_container = $('#igv-app-tweet-button-container');
    if (!urlShortenerFn) {
        $igv_app_tweet_button_container.hide();
    }

    return {
        browser,
        $container,
        $modal: $('#igv-app-share-modal'),
        $share_input: $('#igv-app-share-input'),
        $copy_link_button: $('#igv-app-copy-link-button'),
        $tweet_button_container: urlShortenerFn ? $igv_app_tweet_button_container : undefined,
        $email_button: $('#igv-app-email-button'),
        $qrcode_button: $('#igv-app-qrcode-button'),
        $qrcode_image: $('#igv-app-qrcode-image'),
        $embed_container: $('#igv-app-embed-container'),
        $embed_button: $('#igv-app-embed-button'),
        embedTarget
    };

}

export {createShareWidgets, shareWidgetConfigurator}
