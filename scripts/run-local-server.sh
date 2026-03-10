#!/bin/bash
# Serve igv-webapp and local genome files from port 8000 with CORS proxy for S3.
# Open http://localhost:8000/ in your browser, then load data/test-local.json via Genome → Local File.
#
# Features:
#   - Serves static files from the app root
#   - Adds CORS headers to all responses
#   - Proxies requests to /s3-proxy/<bucket>/<path> → https://<bucket>.s3.us-west-2.amazonaws.com/<path>
#     Supports HTTP Range requests for streaming large files (e.g. FASTA)
#
# Usage in genome JSON:
#   "fastaURL": "http://localhost:8000/s3-proxy/human-pangenomics/working/HPRC/.../file.fa.gz"

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$APP_ROOT"
echo "Serving IGV web app from $APP_ROOT on port 8000"
echo "Open: http://localhost:8000/"
echo "S3 proxy: http://localhost:8000/s3-proxy/<bucket>/<path>"
echo ""

python3 << 'PYEOF'
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import re

class CORSProxyHandler(SimpleHTTPRequestHandler):

    S3_PROXY_PREFIX = "/s3-proxy/"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Range, If-None-Match")
        self.send_header("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith(self.S3_PROXY_PREFIX):
            self._proxy_s3()
        else:
            super().do_GET()

    def do_HEAD(self):
        if self.path.startswith(self.S3_PROXY_PREFIX):
            self._proxy_s3(method="HEAD")
        else:
            super().do_HEAD()

    def _proxy_s3(self, method="GET"):
        # /s3-proxy/<bucket>/<path> → https://<bucket>.s3.us-west-2.amazonaws.com/<path>
        remainder = self.path[len(self.S3_PROXY_PREFIX):]
        parts = remainder.split("/", 1)
        if len(parts) < 2:
            self.send_error(400, "Expected /s3-proxy/<bucket>/<path>")
            return

        bucket, path = parts
        s3_url = f"https://{bucket}.s3.us-west-2.amazonaws.com/{path}"

        req = Request(s3_url, method=method)

        # Forward Range header for streaming
        range_header = self.headers.get("Range")
        if range_header:
            req.add_header("Range", range_header)

        try:
            resp = urlopen(req)
            status = resp.getcode()
            self.send_response(status)

            # Forward relevant headers
            for header in ["Content-Type", "Content-Length", "Content-Range",
                           "Accept-Ranges", "ETag", "Last-Modified"]:
                value = resp.getheader(header)
                if value:
                    self.send_header(header, value)
            self.end_headers()

            if method == "GET":
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    self.wfile.write(chunk)

        except HTTPError as e:
            self.send_response(e.code)
            self.end_headers()
            if method == "GET" and e.fp:
                self.wfile.write(e.fp.read())

HTTPServer(("", 8000), CORSProxyHandler).serve_forever()
PYEOF
