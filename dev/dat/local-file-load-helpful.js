function updateImageDisplay() {

    while(preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    var curFiles = input.files;
    if(curFiles.length === 0) {
        var para = document.createElement('p');
        para.textContent = 'No files currently selected for upload';
        preview.appendChild(para);
    } else {
        var list = document.createElement('ol');
        preview.appendChild(list);
        for(var i = 0; i < curFiles.length; i++) {
            var listItem = document.createElement('li');
            var para = document.createElement('p');
            if(validFileType(curFiles[i])) {
                para.textContent = 'File name ' + curFiles[i].name + ', file size ' + returnFileSize(curFiles[i].size) + '.';
                var image = document.createElement('img');
                image.src = window.URL.createObjectURL(curFiles[i]);

                listItem.appendChild(image);
                listItem.appendChild(para);

            } else {
                para.textContent = 'File name ' + curFiles[i].name + ': Not a valid file type. Update your selection.';
                listItem.appendChild(para);
            }

            list.appendChild(listItem);
        }
    }
}
