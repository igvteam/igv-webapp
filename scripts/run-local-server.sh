#!/bin/bash
# Serve igv-webapp and local genome files from port 8000.
# Open http://localhost:8000/ in your browser, then load data/test-local.json via Genome → Local File.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$APP_ROOT"
echo "Serving IGV web app from $APP_ROOT"
echo "Open: http://localhost:8000/"
echo "Load genome: Genome → Local File → select data/test-local.json"
echo ""
python3 -m http.server 8000
