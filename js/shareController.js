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
var app = (function (app) {

    app.ShareController = function ($shareURLModal, $appContainer) {

        var self = this;

        this.$shareURLModal = $shareURLModal;
        this.$appContainer = $appContainer;

        $shareURLModal.on('show.bs.modal', function (e) {

            var href,
                idx;

            href = window.location.href.slice();

            // TODO: Implement this function
            return;

            // This js file is specific to the aidenlab site, and we know we have only juicebox parameters.
            // Strip href of current parameters, if any
            idx = href.indexOf("?");
            if (idx > 0) {
                href = href.substring(0, idx);
            }

            hic
                .shortJuiceboxURL(href)

                .then(function (jbUrl) {

                    getEmbeddableSnippet.call(self, jbUrl)
                        .then(function (embedSnippet) {
                            var $hic_embed_url;

                            $hic_embed_url = $('#hic-embed');
                            $hic_embed_url.val(embedSnippet);
                            $hic_embed_url.get(0).select();
                        });

                    hic
                        .shortenURL(jbUrl)
                        .then(function (shortURL) {

                            // Shorten second time
                            // e.g. converts https://aidenlab.org/juicebox?juiceboxURL=https://goo.gl/WUb1mL  to https://goo.gl/ERHp5u

                            var tweetContainer,
                                config,
                                $hic_share_url;

                            $hic_share_url = $('#hic-share-url');
                            $hic_share_url.val(shortURL);
                            $hic_share_url.get(0).select();

                            tweetContainer = $('#tweetButtonContainer');
                            tweetContainer.empty();
                            config =
                                {
                                    text: 'Contact map: '
                                };
                            window.twttr.widgets
                                .createShareButton(shortURL, tweetContainer.get(0), config)
                                .then(function (el) {
                                    console.log("Tweet button updated");
                                });

                            $('#emailButton').attr('href', 'mailto:?body=' + shortURL);

                            // QR code generation
                            if (qrcode) {
                                qrcode.clear();
                                $('hic-qr-code-image').empty();
                            } else {
                                config =
                                    {
                                        width: 128,
                                        height: 128,
                                        correctLevel: QRCode.CorrectLevel.H
                                    };

                                qrcode = new QRCode(document.getElementById("hic-qr-code-image"), config);
                            }

                            qrcode.makeCode(shortURL);
                        });
                });
        });

        $shareURLModal.on('hidden.bs.modal', function (e) {
            $('#hic-embed-container').hide();
            $('#hic-qr-code-image').hide();
        });

        $('#hic-embed-button').on('click', function (e) {
            $('#hic-qr-code-image').hide();
            $('#hic-embed-container').toggle();
        });

        $('#hic-qr-code-button').on('click', function (e) {
            $('#hic-embed-container').hide();
            $('#hic-qr-code-image').toggle();
        });

    };

    function getEmbeddableSnippet(jbUrl) {

        var self = this;

        return new Promise(function (fulfill, reject) {
            var idx,
                embedUrl,
                params,
                width,
                height,
                target;

            idx = jbUrl.indexOf("?");
            params = jbUrl.substring(idx);
            target = config.embedTarget || getEmbedTarget();
            embedUrl = target + params;

            width = self.$appContainer.width() + 50;
            height = self.$appContainer.height();

            fulfill('<iframe src="' + embedUrl + '" width="100%" height="' + height + '" frameborder="0" style="border:0" allowfullscreen></iframe>');

        });

    }

    function getEmbedTarget() {

        var href, idx;
        href = window.location.href.slice();

        idx = href.indexOf("?");
        if (idx > 0) href = href.substring(0, idx);

        idx = href.lastIndexOf("/");
        return href.substring(0, idx) + "/embed/embed.html"

    }

    return app;

})(app || {});