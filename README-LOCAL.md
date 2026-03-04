# Running IGV Web App with Local Genome Files (Python Server)

This setup serves the IGV web app and your genome files from the same origin (port 8000) to avoid CORS issues.

## Prerequisites

- Python 3
- Genome files in `~/Downloads/`:
  - `HG00099_hap1_hprc_r2_v1.0.1.fa.gz`
  - `HG00099_hap1_hprc_r2_v1.0.1.fa.gz.fai`
  - `HG00099_hap1_hprc_r2_v1.0.1_cat_v1.1.gff3.gz`

## Steps

### 1. Link genome files into the project

```bash
cd /Users/turner/IGVDevelopment/igv-webapp
chmod +x scripts/setup-local-genome.sh
./scripts/setup-local-genome.sh
```

This creates symlinks from `~/Downloads/` to `data/genomes/`.

### 2. Remove CORS proxy (if enabled)

If you added `corsProxy` to `igvwebConfig.js` for S3 access, remove or comment it out for local use.

### 3. Start the server

```bash
chmod +x scripts/run-local-server.sh
./scripts/run-local-server.sh
```

### 4. Open the app and load the genome

1. Open **http://localhost:8000/** in your browser.
2. Go to **Genome → Local File ...**
3. Select `data/test-local.json` (from the igv-webapp project folder).
4. The HG00099 genome and GFF3 annotation track should load.

## File layout

```
igv-webapp/
├── data/
│   ├── genomes/           # Symlinks to your Downloads files
│   │   ├── HG00099_hap1_hprc_r2_v1.0.1.fa.gz
│   │   ├── HG00099_hap1_hprc_r2_v1.0.1.fa.gz.fai
│   │   └── HG00099_hap1_hprc_r2_v1.0.1_cat_v1.1.gff3.gz
│   └── test-local.json    # Genome config with localhost URLs
├── scripts/
│   ├── setup-local-genome.sh
│   └── run-local-server.sh
└── ...
```

## Troubleshooting

- **"File not found"** – Run `./scripts/setup-local-genome.sh` and ensure the genome files are in `~/Downloads/`.
- **CORS errors** – Use the app only at http://localhost:8000/, not from another port (e.g. 63342).
- **Port 8000 in use** – Edit `run-local-server.sh` and change `8000` to another port, then update the URLs in `data/test-local.json`.
