import handleMessage from "./messageHandler.js"

        /**
         * Create a WebSocket client that connects to the server and handles messages.  This was developed to support an
         * MCP server, but could be used for other purposes.
         *
         * @param host Host for the WebSocket server
         * @param port Port for the WebSocket server
         * @param browser The igv.js browser instance
         */

        export function createWebSocketClient(host, port, browser) {

            let socket;
            let retryInterval = 1000;    // Initial retry interval in ms
            const maxRetryInterval = 30000; // Maximum retry interval in ms
            let reconnectTimer;

            function connect() {

                const isLocal = host === 'localhost' || host === '127.0.0.1';
                const protocol = window.location.protocol === 'https:' && !isLocal ? 'wss:' : 'ws:';
                socket = new WebSocket(`${protocol}//${host}:${port}`);

                //  helper to safely send
                function sendJSON(obj) {
                    if (socket.readyState === WebSocket.OPEN) {
                        console.log('Sending to server: ', obj);
                        socket.send(JSON.stringify(obj));
                    }
                }

                socket.addEventListener('open', function (event) {
                    console.log('Connected to WebSocket server');
                    retryInterval = 1000; // Reset retry interval on successful connection
            socket.send('Hello from browser client');
                });

                // Handle messages from the server
                socket.addEventListener('message', async function (event) {
                    try {
                        const json = JSON.parse(event.data);
                        const returnMsg = await handleMessage(json, browser)
                        sendJSON(returnMsg)
                    }
                    catch (e) {
                        // Check if the error is from JSON.parse or something else
                        if (e instanceof SyntaxError) {
                             console.log('Received non-JSON message from server:', event.data);
                             // sendJSON({
                             //     status: 'warn',
                             //     message: 'Received non-JSON message from server'
                             // })
                        } else {
                            console.error('Error handling message:', e);
                            sendJSON({
                                status: 'error',
                                message: `Error handling message: ${e.message || e.toString()}`
                            })
                        }
                    }
                });

                socket.addEventListener('error', function (event) {
                    console.error('WebSocket error:', event);
                    // The 'close' event will fire immediately after 'error', triggering the reconnect logic.
                });

                socket.addEventListener('close', function (event) {
                    console.log('Disconnected from server. Retrying in ' + (retryInterval / 1000) + ' seconds.');
                    clearTimeout(reconnectTimer);
                    reconnectTimer = setTimeout(connect, retryInterval);
                    // Increase retry interval for next time, up to a max
                    retryInterval = Math.min(maxRetryInterval, retryInterval * 2);
                });
            }

            connect(); // Initial connection attempt

            window.addEventListener('beforeunload', function (event) {
                clearTimeout(reconnectTimer); // Don't try to reconnect when page is closing
        if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.close();
                }
            });
        }

        export default createWebSocketClient;