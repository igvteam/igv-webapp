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

/**
 * Created by dat on 3/4/17.
 */

var hic = (function (hic) {

    hic.ResolutionSelector = function (browser, $parent) {
        var self = this;

        this.browser = browser;

        this.$container = $("<div>", { class:'hic-resolution-selector-container',  title:'Resolution' });
        $parent.append(this.$container);

        // label container
        this.$label_container = $('<div id="hic-resolution-label-container">');
        this.$container.append(this.$label_container);

        // Resolution (kb)
        this.$label = $("<div>");
        this.$label_container.append(this.$label);
        this.$label.text('Resolution (kb)');
        this.$label.hide();

        // lock/unlock
        this.$resolution_lock = $('<i id="hic-resolution-lock" class="fa fa-unlock" aria-hidden="true">');
        this.$label_container.append(this.$resolution_lock);
        this.$label_container.on('click', function (e) {
            self.browser.resolutionLocked = !(self.browser.resolutionLocked);
            self.setResolutionLock(self.browser.resolutionLocked);
        });

        this.$resolution_selector = $('<select name="select">');
        this.$container.append(this.$resolution_selector);

        this.$resolution_selector.attr('name', 'resolution_selector');

        this.$resolution_selector.on('change', function (e) {
            var zoomIndex = parseInt($(this).val());
            self.browser.setZoom(zoomIndex);
        });


        this.browser.eventBus.subscribe("LocusChange", this);
        this.browser.eventBus.subscribe("MapLoad", this);
    };

    hic.ResolutionSelector.prototype.setResolutionLock = function (resolutionLocked) {
        this.$resolution_lock.removeClass( (true === resolutionLocked) ? 'fa-unlock' : 'fa-lock');
        this.$resolution_lock.addClass(    (true === resolutionLocked) ? 'fa-lock' : 'fa-unlock');
    };

    hic.ResolutionSelector.prototype.receiveEvent = function (event) {

        var self = this,
            htmlString,
            resolutions,
            selectedIndex,
            isWholeGenome,
            digits,
            divisor;

        if (event.type === "LocusChange") {

            if (true === event.data.resolutionChanged) {
                this.browser.resolutionLocked = false;
                self.setResolutionLock(this.browser.resolutionLocked);
            }

            isWholeGenome = (0 === event.data.state.chr1);

            this.$label.text(isWholeGenome ? 'Resolution (mb)' : 'Resolution (kb)');
            resolutions = isWholeGenome ? [ this.browser.dataset.wholeGenomeResolution ] : this.browser.dataset.bpResolutions;
            selectedIndex = isWholeGenome ? 0 : this.browser.state.zoom;
            divisor = isWholeGenome ? 1e6 : 1e3;

            htmlString = optionListHTML(resolutions, selectedIndex, divisor);

            this.$resolution_selector.empty();
            this.$resolution_selector.append(htmlString);

            this.$resolution_selector
                .find('option')
                .filter(function (index) {
                    return index === selectedIndex;
                })
                .prop('selected', true);

        } else if (event.type === "MapLoad") {

            this.browser.resolutionLocked = false;
            this.setResolutionLock(this.browser.resolutionLocked);

            this.$resolution_selector.empty();
            htmlString = optionListHTML(this.browser.dataset.bpResolutions, this.browser.state.zoom, 1e3);
            this.$resolution_selector.append(htmlString);

        }

        function optionListHTML(resolutionList, selectedIndex, divisor) {
            var list;

            list = _.map(resolutionList, function (resolution, index) {

                var selected,
                    str;

                selected = selectedIndex === index;
                str = igv.numberFormatter(Math.round(resolution/divisor)) + (1e3 === divisor ? ' kb' : ' mb');
                return '<option' + ' value=' + index +  (selected ? ' selected': '') + '>' + str + '</option>';
            });

            return list.join('');
        }

    };

    return hic;

})
(hic || {});
