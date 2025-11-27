export default async function handleMessage(json, browser) {

    const returnMsg = {uniqueID: json.uniqueID, message: '', status: 'ok'}

    try {
        let tracks
        const {type, args} = json
        switch (type) {

            case 'loadTrack': {
                const {url, indexURL} = args
                const track = await browser.loadTrack({url, indexURL})
                returnMsg.message = `Track ${track.name} loaded successfully`
                break
            }

            case "genome":
                const id = args.id
                await browser.loadGenome(id)
                returnMsg.message = `Genome ${id} loaded successfully`
                break

            case "loadSession":
                const url = args.url
                await browser.loadSession({url})
                returnMsg.message = `Session loaded successfully from ${url}`
                break

            case "goto":
                const locus = args.locus
                await browser.search(locus)
                returnMsg.message = `Navigated to locus ${locus}`
                break

            case "zoomin":
                await browser.zoomIn()
                returnMsg.message = `Zoomed in successfully`
                break

            case "zoomout":
                await browser.zoomOut()
                returnMsg.message = `Zoomed out successfully`
                break

            case "setColor":

                let {color, trackName} = args

                if (color.includes(",") && !color.startsWith("rgb(")) {
                    // Convert "R,G,B" to "rgb(R,G,B)"
                    color = `rgb(${color})`
                }

                tracks = browser.findTracks(t => trackName ? t.name === trackName : true)
                if (tracks) {
                    tracks.forEach(t => t.color = color)
                    browser.repaintViews()
                    returnMsg.message = `Set color to ${color} for ${tracks.length} track(s)`
                } else {
                    returnMsg.message = `No tracks found matching name ${trackName}`
                    returnMsg.status = 'warning'
                }

            case "renameTrack":

                const {currentName, newName} = args

                tracks = browser.findTracks(t => currentName === t.name)
                if (tracks && tracks.length > 0) {
                    tracks.forEach(t => {
                        t.name = newName
                        browser.fireEvent('tracknamechange', [t])
                    })
                    returnMsg.message = `Renamed ${tracks.length} track(s) from ${currentName} to ${newName}`
                } else {
                    returnMsg.message = `No track found with name ${currentName}`
                    returnMsg.status = 'warning'
                }
                break

            default:
                returnMsg.message = `Unrecognized message type: ${type}`
                returnMsg.status = 'error'
        }
    } catch (err) {
        returnMsg.message = err?.message || String(err)
        returnMsg.status = 'error'
    }

    return returnMsg
}