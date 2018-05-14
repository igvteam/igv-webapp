$('#bookmark-this').click(function(e) {
    var bookmarkURL = window.location.href;
    var bookmarkTitle = document.title;

    if ('addToHomescreen' in window && addToHomescreen.isCompatible) {
        // Mobile browsers
        addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
    } else if (window.sidebar && window.sidebar.addPanel) {
        // Firefox <=22
        window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
    } else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
        // Firefox 23+ and Opera <=14
        $(this).attr({
            href: bookmarkURL,
            title: bookmarkTitle,
            rel: 'sidebar'
        }).off(e);
        return true;
    } else if (window.external && ('AddFavorite' in window.external)) {
        // IE Favorites
        window.external.AddFavorite(bookmarkURL, bookmarkTitle);
    } else {
        // Other browsers (mainly WebKit & Blink - Safari, Chrome, Opera 15+)
        alert('Press ' + (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
    }

    return false;
});
  