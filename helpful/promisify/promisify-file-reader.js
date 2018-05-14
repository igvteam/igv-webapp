function promisifyFileReader (filereader) {
    function composeAsync (key) { 
        return function () {
            var args = arguments
            return new Promise (function (resolve, reject) {
                //
                function resolveHandler () {
                    cleanHandlers()
                    resolve(filereader.result)
                }
                function rejectHandler () {
                    cleanHandlers()
                    reject(filereader.error)
                }
                function cleanHandlers () {
                    filereader.removeEventListener('load', resolveHandler)
                    filereader.removeEventListener('abort', rejectHandler)
                    filereader.removeEventListener('error', rejectHandler)
                }
                
                // :: ehhhhh
                filereader.addEventListener('load', resolveHandler)
                filereader.addEventListener('abort', rejectHandler)
                filereader.addEventListener('error', rejectHandler)
                
                // :: go!
                filereader[key].apply(filereader, args)
            })
        }
    }
    for (var key in filereader) {
        if (!key.match(/^read/) || typeof x[key] !== 'function') { continue }
        filereader[key + 'Async'] = composeAsync(key)
    }
}