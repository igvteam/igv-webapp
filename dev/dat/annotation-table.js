
    function annotationPanel($parent, title) {

        var self = this,
            $panel_header,
            $load_container,
            $div,
            $fa;

        this.$annotationPanel = $('<div>', { class:'igv-app-modal-table-panel-container' });
        $parent.append(this.$annotationPanel);

        // close button container
        $panel_header = $('<div>', { class:'igv-app-modal-table-panel-header' });
        this.$annotationPanel.append($panel_header);

        // panel title
        $div = $('<div>');
        $div.text(title);
        $panel_header.append($div);

    }
