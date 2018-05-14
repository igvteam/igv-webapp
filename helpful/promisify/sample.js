var reader = new FileReader()
promisifyFileReader(reader)

/**
 *  reader.readAsArrayBufferAsync()
 *  reader.readAsBinaryStringAsync()
 *  reader.readAsDataURLAsync()
 *  reader.readAsTextAsync()
 */

// ...
var testBlob = new Blob(['foo', 'bar', 'herp', 'derp'])
reader
  .readAsTextAsync(testBlob)
  .then(result => {
    console.log(result)
    // => 'foobarherpderp'
  })