function throttle(callback, limit) {
    let waiting = false                      // Initially, we're not waiting
    return function () {                      // We return a throttled function
        if (!waiting) {                       // If we're not waiting
            callback.apply(this, arguments)  // Execute users function
            waiting = true                   // Prevent future invocations
            setTimeout(function () {          // After a period of time
                waiting = false              // And allow future invocations
            }, limit)
        }
    }
}

function extractQuery() {

    const uri = window.location.href

    const query = {}
    const i1 = uri.indexOf("?")
    let i2 = uri.lastIndexOf("#")

    if (i1 >= 0) {
        if (i2 < 0) i2 = uri.length
        for (let i = i1 + 1; i < i2;) {
            let j = uri.indexOf("&", i)
            if (j < 0) j = i2

            const s = uri.substring(i, j)
            const tokens = s.split("=", 2)

            if (tokens.length === 2) {
                const key = tokens[0]
                query[key] = decodeURIComponent(tokens[1])
                i = j + 1
            } else {
                i++
            }
        }
    }
    return query
}

export { throttle, extractQuery }
