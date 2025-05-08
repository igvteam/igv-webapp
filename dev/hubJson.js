export default [
    {
        "name": "genes",
        "priority": 100,
        "label": "Genes and Gene Predictions",
        "defaultOpen": true,
        "tracks": [
            {
                "id": "refseqSelect",
                "name": "Refseq Select",
                "format": "refgene",
                "url": "https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/ncbiRefSeqSelect.txt.gz",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://www.ncbi.nlm.nih.gov/refseq/refseq_select/\">Refseq Select</a>",
                "group": "genes"
            },
            {
                "id": "refseqCurated",
                "name": "Refseq Curated",
                "format": "refgene",
                "url": "https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/ncbiRefSeqCurated.txt.gz",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://www.ncbi.nlm.nih.gov/refseq/refseq_select/\">Refseq Curated</a>",
                "group": "genes"
            },
            {
                "id": "refseqAll",
                "name": "Refseq All",
                "format": "refgene",
                "url": "https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/ncbiRefSeq.txt.gz",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://www.ncbi.nlm.nih.gov/refseq/refseq_select/\">Refseq All</a>",
                "group": "genes"
            },
            {
                "id": "maneRefseq",
                "name": "MANE v1.0 - Refseq",
                "format": "bigBed",
                "url": "https://ftp.ncbi.nlm.nih.gov/refseq/MANE/trackhub/data/release_1.0/MANE.GRCh38.v1.0.refseq.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://www.ncbi.nlm.nih.gov/refseq/MANE/\">MANE v1.0 transcripts with RefSeq labels</a>",
                "group": "genes"
            },
            {
                "id": "augustus",
                "name": "Augustus",
                "format": "bigGenePred",
                "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.augustus.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.augustus\">Augustus Gene Predictions</a>",
                "color": "rgb(180,0,0)",
                "group": "genes"
            },
            {
                "id": "xenoRefGene",
                "name": "RefSeq mRNAs",
                "format": "bigGenePred",
                "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.xenoRefGene.bb",
                "displayMode": "EXPANDED",
                "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.xenoRefGene\">RefSeq mRNAs mapped to this assembly</a>",
                "color": "rgb(180,0,0)",
                "infoURL": "https://www.ncbi.nlm.nih.gov/nuccore/$$",
                "searchIndex": "name",
                "trixURL": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/ixIxx/GCF_000001405.40_GRCh38.p14.xenoRefGene.ix",
                "group": "genes"
            }
        ],
        "children": [
            {
                "name": "gencode",
                "priority": 9007199254740990,
                "label": "GENCODE",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "knownGene",
                        "name": "GENCODE V47",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV47.bb",
                        "displayMode": "COLLAPSED",
                        "searchIndex": "name",
                        "group": "genes"
                    },
                    {
                        "id": "knownGeneV36",
                        "name": "GENCODE V36",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV36.bb",
                        "displayMode": "COLLAPSED",
                        "searchIndex": "name",
                        "group": "genes"
                    },
                    {
                        "id": "knownGeneV38",
                        "name": "GENCODE V38",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV38.bb",
                        "displayMode": "COLLAPSED",
                        "description": "GENCODE V38",
                        "searchIndex": "name",
                        "group": "genes"
                    },
                    {
                        "id": "knownGeneV39",
                        "name": "GENCODE V39",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV39.bb",
                        "displayMode": "COLLAPSED",
                        "searchIndex": "name",
                        "group": "genes"
                    },
                    {
                        "id": "knownGeneV43",
                        "name": "GENCODE V43",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV43.bb",
                        "displayMode": "COLLAPSED",
                        "searchIndex": "name",
                        "group": "genes"
                    },
                    {
                        "id": "knownGeneV44",
                        "name": "GENCODE V44",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV44.bb",
                        "displayMode": "COLLAPSED",
                        "searchIndex": "name",
                        "group": "genes"
                    },
                    {
                        "id": "knownGeneV45",
                        "name": "GENCODE V45",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV45.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=knownGeneV45\">GENCODE V45</a>",
                        "searchIndex": "name",
                        "group": "genes"
                    },
                    {
                        "id": "knownGeneV46",
                        "name": "GENCODE V46",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gencode/gencodeV46.bb",
                        "displayMode": "COLLAPSED",
                        "searchIndex": "name",
                        "group": "genes"
                    }
                ],
                "children": []
            },
            {
                "name": "uniprot",
                "priority": 9007199254740990,
                "label": "UniProt SwissProt/TrEMBL Protein Annotations",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "unipConflict",
                        "name": "Seq. Conflicts",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipConflict.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Sequence Conflicts",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipRepeat",
                        "name": "Repeats",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipRepeat.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Repeats",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipStruct",
                        "name": "Structure",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipStruct.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Protein Primary/Secondary Structure Annotations",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipOther",
                        "name": "Other Annot.",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipOther.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Other Annotations",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipMut",
                        "name": "Mutations",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipMut.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Amino Acid Mutations",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipModif",
                        "name": "AA Modifications",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipModif.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Amino Acid Modifications",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipDomain",
                        "name": "Domains",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipDomain.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Domains",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipDisulfBond",
                        "name": "Disulf. Bonds",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipDisulfBond.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Disulfide Bonds",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipChain",
                        "name": "Chains",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipChain.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Mature Protein Products (Polypeptide Chains)",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipLocCytopl",
                        "name": "Cytoplasmic",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipLocCytopl.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Cytoplasmic Domains",
                        "color": "rgb(255,150,0)",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipLocTransMemb",
                        "name": "Transmembrane",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipLocTransMemb.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Transmembrane Domains",
                        "color": "rgb(0,150,0)",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipInterest",
                        "name": "Interest",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipInterest.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Regions of Interest",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipLocExtra",
                        "name": "Extracellular",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipLocExtra.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Extracellular Domain",
                        "color": "rgb(0,150,255)",
                        "visible": false,
                        "group": "genes"
                    },
                    {
                        "id": "unipLocSignal",
                        "name": "Signal Peptide",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipLocSignal.bb",
                        "displayMode": "COLLAPSED",
                        "description": "UniProt Signal Peptides",
                        "color": "rgb(255,0,150)",
                        "visible": false,
                        "group": "genes"
                    }
                ],
                "children": []
            },
            {
                "name": "refSeqComposite",
                "priority": 200,
                "label": "RefSeq gene predictions from NCBI",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "ncbiRefSeq",
                        "name": "RefSeq All",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.ncbiRefSeq.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.refSeqComposite\">NCBI RefSeq genes, curated and predicted sets (NM_*, XM_*, NR_*, XR_*, NP_* or YP_*)</a>",
                        "color": "rgb(12,12,120)",
                        "searchIndex": "name",
                        "trixURL": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/ixIxx/GCF_000001405.40_GRCh38.p14.ncbiRefSeq.ix",
                        "group": "genes"
                    },
                    {
                        "id": "ncbiRefSeqCurated",
                        "name": "RefSeq Curated",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.ncbiRefSeqCurated.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.refSeqComposite\">NCBI RefSeq genes, curated subset (NM_*, NR_*, NP_* or YP_*)</a>",
                        "color": "rgb(12,12,120)",
                        "searchIndex": "name",
                        "trixURL": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/ixIxx/GCF_000001405.40_GRCh38.p14.ncbiRefSeqCurated.ix",
                        "group": "genes"
                    },
                    {
                        "id": "ncbiRefSeqPredicted",
                        "name": "RefSeq Predicted",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.ncbiRefSeqPredicted.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.refSeqComposite\">NCBI RefSeq genes, predicted subset (XM_* or XR_*)</a>",
                        "color": "rgb(12,12,120)",
                        "searchIndex": "name",
                        "trixURL": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/ixIxx/GCF_000001405.40_GRCh38.p14.ncbiRefSeqPredicted.ix",
                        "group": "genes"
                    },
                    {
                        "id": "ncbiRefSeqOther",
                        "name": "RefSeq Other",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.ncbiRefSeqOther.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.refSeqComposite\">NCBI RefSeq other annotations (not NM_*, NR_*, XM_*, XR_*, NP_* or YP_*)</a>",
                        "color": "rgb(32,32,32)",
                        "searchIndex": "name",
                        "trixURL": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/ixIxx/GCF_000001405.40_GRCh38.p14.ncbiRefSeqOther.ix",
                        "group": "genes"
                    },
                    {
                        "id": "ncbiRefSeqSelect",
                        "name": "RefSeq Select",
                        "format": "bigGenePred",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.ncbiRefSeqSelectCurated.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.refSeqComposite\">NCBI RefSeq/MANE Select: one representative transcript per protein-coding gene</a>",
                        "color": "rgb(20,20,160)",
                        "searchIndex": "name",
                        "trixURL": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/ixIxx/GCF_000001405.40_GRCh38.p14.ncbiRefSeqSelectCurated.ix",
                        "group": "genes"
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "name": "phenDis",
        "priority": 340,
        "label": "Phenotype, Variants, and Literature",
        "defaultOpen": false,
        "tracks": [
            {
                "id": "abSplice",
                "name": "AbSplice Scores",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/abSplice/AbSplice.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=abSplice\">Aberrant Splicing Prediction Scores</a>",
                "group": "phenDis"
            },
            {
                "id": "avada",
                "name": "Avada Variants",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/avada.bb",
                "displayMode": "COLLAPSED",
                "description": "Avada Variants extracted from full text publications",
                "group": "phenDis"
            },
            {
                "id": "cadd1_7_Del",
                "name": "CADD 1.7 Del",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd1.7/del.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper1_7\">CADD 1.7 Score: Deletions - label is length of deletion</a>",
                "color": "rgb(100,130,160)",
                "group": "phenDis"
            },
            {
                "id": "cadd1_7_Ins",
                "name": "CADD 1.7 Ins",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd1.7/ins.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper1_7\">CADD 1.7 Score: Insertions - label is length of insertion</a>",
                "color": "rgb(100,130,160)",
                "group": "phenDis"
            },
            {
                "id": "caddDel",
                "name": "CADD 1.6 Del",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd/del.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper\">CADD 1.6 Score: Deletions - label is length of deletion</a>",
                "color": "rgb(100,130,160)",
                "group": "phenDis"
            },
            {
                "id": "caddIns",
                "name": "CADD 1.6 Ins",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd/ins.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper\">CADD 1.6 Score: Insertions - label is length of insertion</a>",
                "color": "rgb(100,130,160)",
                "group": "phenDis"
            },
            {
                "id": "civic",
                "name": "CIViC",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/civic/civic.bb",
                "displayMode": "COLLAPSED",
                "description": "CIViC - Expert & crowd-sourced cancer variant interpretation",
                "group": "phenDis"
            },
            {
                "id": "covidMuts",
                "name": "COVID Rare Harmful Var",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/covidMuts/covidMuts.bb",
                "displayMode": "COLLAPSED",
                "description": "Rare variants underlying COVID-19 severity and susceptibility from the COVID Human Genetics Effort",
                "color": "rgb(179,0,0)",
                "group": "phenDis"
            },
            {
                "id": "decipher",
                "name": "DECIPHER CNVs",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/decipher/decipherCnv.bb",
                "displayMode": "EXPANDED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=decipherContainer\">DECIPHER CNVs</a>",
                "infoURL": "https://www.deciphergenomics.org/patient/$$",
                "searchIndex": "name",
                "group": "phenDis"
            },
            {
                "id": "decipherPopulation",
                "name": "DECIPHER Population CNVs",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/decipher/population_cnv.bb",
                "displayMode": "EXPANDED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=decipherContainer\">DECIPHER: Population CNVs</a>",
                "searchIndex": "name",
                "group": "phenDis"
            },
            {
                "id": "genCC",
                "name": "GenCC",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/genCC.bb",
                "displayMode": "COLLAPSED",
                "description": "GenCC: The Gene Curation Coalition Annotations",
                "infoURL": "https://search.thegencc.org/genes/$<gene_curie>",
                "group": "phenDis"
            },
            {
                "id": "geneReviews",
                "name": "GeneReviews",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/geneReviews/geneReviews.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=geneReviews\">GeneReviews</a>",
                "color": "rgb(0,)",
                "visible": false,
                "infoURL": "https://www.ncbi.nlm.nih.gov/books/NBK1116/?term=$$",
                "group": "phenDis"
            },
            {
                "id": "hgmd",
                "name": "HGMD public",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/hgmd.bb",
                "displayMode": "COLLAPSED",
                "description": "Human Gene Mutation Database - Public Version Dec 2024",
                "visible": false,
                "infoURL": "http://www.hgmd.cf.ac.uk/ac/gene.php?gene=$P&accession=$p",
                "group": "phenDis"
            },
            {
                "id": "hmc",
                "name": "HMC",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hmc/hmc.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=constraintSuper\">HMC - Homologous Missense Constraint Score on PFAM domains</a>",
                "maxHeight": 128,
                "height": 40,
                "minHeight": 8,
                "color": "rgb(0,130,0)",
                "min": 0,
                "max": 2,
                "group": "phenDis"
            },
            {
                "id": "interactions",
                "name": "Gene Interactions",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/interactions.bb",
                "displayMode": "COLLAPSED",
                "description": "Protein Interactions from Curated Databases and Text-Mining",
                "visible": false,
                "group": "phenDis"
            },
            {
                "id": "jarvis",
                "name": "JARVIS",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/jarvis/jarvis.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=constraintSuper\">JARVIS: score to prioritize non-coding regions for disease relevance</a>",
                "maxHeight": 8,
                "height": 40,
                "minHeight": 128,
                "color": "rgb(150,130,160)",
                "min": 0,
                "max": 1,
                "group": "phenDis"
            },
            {
                "id": "mastermind",
                "name": "Mastermind Variants",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/mastermind.bb",
                "displayMode": "COLLAPSED",
                "description": "Genomenon Mastermind Variants extracted from full text publications",
                "group": "phenDis"
            },
            {
                "id": "orphadata",
                "name": "Orphanet",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/orphanet/orphadata.bb",
                "displayMode": "COLLAPSED",
                "description": "Orphadata: Aggregated Data From Orphanet",
                "infoURL": "http://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=en&Expert=$$",
                "group": "phenDis"
            },
            {
                "id": "spMut",
                "name": "UniProt Variants",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/uniprot/unipMut.bb",
                "displayMode": "COLLAPSED",
                "description": "UniProt/SwissProt Amino Acid Substitutions",
                "visible": false,
                "group": "phenDis"
            },
            {
                "id": "ukbDepletion",
                "name": "UKB Depl. Rank Score",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/ukbDepletion/ukbDepletion.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=constraintSuper\">UK Biobank / deCODE Genetics Depletion Rank Score</a>",
                "maxHeight": 128,
                "height": 40,
                "minHeight": 8,
                "min": 0,
                "max": 1,
                "group": "phenDis"
            },
            {
                "id": "varChat",
                "name": "enGenome VarChat",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/varChat.bb",
                "displayMode": "COLLAPSED",
                "description": "enGenome VarChat: Literature match and variant's summary",
                "infoURL": "https://varchat.engenome.com/search?source=ucsc&text=$<VariantUrl>",
                "group": "phenDis"
            }
        ],
        "children": [
            {
                "name": "alphaMissense",
                "priority": 9007199254740990,
                "label": "AlphaMissense",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "alphaMissense_T",
                        "name": "Mutation: T",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/alphaMissense/t.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=alphaMissense\">AlphaMissense Score: Mutation is T</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "alphaMissense_G",
                        "name": "Mutation: G",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/alphaMissense/g.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=alphaMissense\">AlphaMissense Score: Mutation is G</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "alphaMissense_C",
                        "name": "Mutation: C",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/alphaMissense/c.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=alphaMissense\">AlphaMissense Score: Mutation is C</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "alphaMissense_A",
                        "name": "Mutation: A",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/alphaMissense/a.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=alphaMissense\">AlphaMissense Score: Mutation is A</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "cadd",
                "priority": 9007199254740990,
                "label": "CADD 1.6",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "caddT",
                        "name": "Mutation: T",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd/t.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper\">CADD 1.6 Score: Mutation is T</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    },
                    {
                        "id": "caddG",
                        "name": "Mutation: G",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd/g.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper\">CADD 1.6 Score: Mutation is G</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    },
                    {
                        "id": "caddC",
                        "name": "Mutation: C",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd/c.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper\">CADD 1.6 Score: Mutation is C</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    },
                    {
                        "id": "caddA",
                        "name": "Mutation: A",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd/a.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper\">CADD 1.6 Score: Mutation is A</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "cadd1_7",
                "priority": 9007199254740990,
                "label": "CADD 1.7",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "cadd1_7_T",
                        "name": "Mutation: T",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd1.7/t.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper1_7\">CADD 1.7 Score: Mutation is T</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    },
                    {
                        "id": "cadd1_7_G",
                        "name": "Mutation: G",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd1.7/g.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper1_7\">CADD 1.7 Score: Mutation is G</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    },
                    {
                        "id": "cadd1_7_C",
                        "name": "Mutation: C",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd1.7/c.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper1_7\">CADD 1.7 Score: Mutation is C</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    },
                    {
                        "id": "cadd1_7_A",
                        "name": "Mutation: A",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/cadd1.7/a.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=caddSuper1_7\">CADD 1.7 Score: Mutation is A</a>",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(100,130,160)",
                        "min": 10,
                        "max": 50,
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "clinGenComp",
                "priority": 9007199254740990,
                "label": "ClinGen",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "clinGenCspec",
                        "name": "ClinGen VCEP Specifications",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/clinGen/clinGenCspec.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=clinGen\">Clingen CSpec Variant Interpretation VCEP Specifications</a>",
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "clinGenGeneDisease",
                        "name": "ClinGen Validity",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/clinGen/clinGenGeneDisease.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=clinGen\">ClinGen Gene-Disease Validity Classification</a>",
                        "visible": false,
                        "searchIndex": "name,geneSymbol,HGNCid,MONDOid,Classification",
                        "group": "phenDis"
                    },
                    {
                        "id": "clinGenTriplo",
                        "name": "ClinGen Triplosensitivity",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/clinGen/clinGenTriplo.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=clinGen\">ClinGen Dosage Sensitivity Map - Triplosensitivity</a>",
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "clinGenHaplo",
                        "name": "ClinGen Haploinsufficiency",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/clinGen/clinGenHaplo.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=clinGen\">ClinGen Dosage Sensitivity Map - Haploinsufficiency</a>",
                        "visible": false,
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "clinvar",
                "priority": 9007199254740990,
                "label": "ClinVar Variants",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "clinvarCnv",
                        "name": "ClinVar CNVs",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/clinvar/clinvarCnv.bb",
                        "displayMode": "COLLAPSED",
                        "description": "ClinVar Copy Number Variants >= 50bp",
                        "visible": false,
                        "searchIndex": "_dbVarSsvId",
                        "group": "phenDis"
                    },
                    {
                        "id": "clinvarMain",
                        "name": "ClinVar SNVs",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/clinvar/clinvarMain.bb",
                        "displayMode": "COLLAPSED",
                        "description": "ClinVar Short Variants < 50bp",
                        "visible": false,
                        "searchIndex": "_dbVarSsvId",
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "mitoMap",
                "priority": 9007199254740990,
                "label": "MITOMAP: A human mitochondrial genome database",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "mitoMapDiseaseMuts",
                        "name": "MITOMAP Disease Muts",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/mitoMapDiseaseMuts.bb",
                        "displayMode": "COLLAPSED",
                        "description": "MITOMAP Disease Mutations",
                        "visible": false,
                        "infoURL": "https://www.mitomap.org/foswiki/bin/view/MITOMAP/$<_mutsCodingOrRNA>",
                        "group": "phenDis"
                    },
                    {
                        "id": "mitoMapVars",
                        "name": "MITOMAP Variants",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/mitoMapVars.bb",
                        "displayMode": "COLLAPSED",
                        "description": "MITOMAP Control and Coding Variants",
                        "visible": false,
                        "infoURL": "https://www.mitomap.org/foswiki/bin/view/MITOMAP/$<_varType>",
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "panelApp",
                "priority": 9007199254740990,
                "label": "Genomics England PanelApp Diagnostics",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "panelAppTandRep",
                        "name": "PanelApp STRs",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/panelApp/tandRep.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Genomics England PanelApp Short Tandem Repeats",
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "panelAppGenes",
                        "name": "PanelApp Genes",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/panelApp/genes.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Genomics England PanelApp Genes",
                        "visible": false,
                        "infoURL": "https://panelapp.genomicsengland.co.uk/panels/$<panelID>/gene/$<geneSymbol>/",
                        "group": "phenDis"
                    },
                    {
                        "id": "panelAppCNVs",
                        "name": "PanelApp CNVs",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/panelApp/cnv.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Genomics England PanelApp CNV Regions",
                        "visible": false,
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "revel",
                "priority": 9007199254740990,
                "label": "REVEL Scores",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "revelOverlaps",
                        "name": "REVEL overlaps",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/revel/overlap.bb",
                        "displayMode": "COLLAPSED",
                        "description": "REVEL: Positions with >1 score due to overlapping transcripts (mouseover for details)",
                        "color": "rgb(150,80,200)",
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "revelT",
                        "name": "Mutation: T",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/revel/t.bw",
                        "displayMode": "COLLAPSED",
                        "description": "REVEL: Mutation is T",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(150,80,200)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "revelG",
                        "name": "Mutation: G",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/revel/g.bw",
                        "displayMode": "COLLAPSED",
                        "description": "REVEL: Mutation is G",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(150,80,200)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "revelC",
                        "name": "Mutation: C",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/revel/c.bw",
                        "displayMode": "COLLAPSED",
                        "description": "REVEL: Mutation is C",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(150,80,200)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    },
                    {
                        "id": "revelA",
                        "name": "Mutation: A",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/revel/a.bw",
                        "displayMode": "COLLAPSED",
                        "description": "REVEL: Mutation is A",
                        "maxHeight": 128,
                        "height": 20,
                        "minHeight": 8,
                        "color": "rgb(150,80,200)",
                        "min": 0,
                        "max": 1,
                        "visible": false,
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "snpedia",
                "priority": 9007199254740990,
                "label": "SNPedia",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "snpediaAll",
                        "name": "SNPedia all",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/snpediaAll.bb",
                        "displayMode": "COLLAPSED",
                        "description": "SNPedia all SNPs (including empty pages)",
                        "color": "rgb(50,0,100)",
                        "visible": false,
                        "infoURL": "https://www.snpedia.com/index.php/$$",
                        "searchIndex": "name",
                        "group": "phenDis"
                    }
                ],
                "children": []
            },
            {
                "name": "spliceAI",
                "priority": 9007199254740990,
                "label": "SpliceAI: Splice Variant Prediction Score",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "spliceAIindelsMasked",
                        "name": "SpliceAI indels (masked)",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/spliceAIindelsMasked.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=spliceAI\">SpliceAI Indels (masked)</a>",
                        "group": "phenDis"
                    },
                    {
                        "id": "spliceAIsnvsMasked",
                        "name": "SpliceAI SNVs (masked)",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/spliceAIsnvsMasked.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=spliceAI\">SpliceAI SNVs (masked)</a>",
                        "group": "phenDis"
                    },
                    {
                        "id": "spliceAIindels",
                        "name": "SpliceAI indels",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/spliceAIindels.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=spliceAI\">SpliceAI Indels (unmasked)</a>",
                        "group": "phenDis"
                    },
                    {
                        "id": "spliceAIsnvs",
                        "name": "SpliceAI SNVs",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/spliceAIsnvs.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=spliceAI\">SpliceAI SNVs (unmasked)</a>",
                        "group": "phenDis"
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "name": "hprc",
        "priority": 380,
        "label": "Human Pangenome - HPRC",
        "defaultOpen": false,
        "tracks": [
            {
                "id": "hprcDecomposed",
                "name": "HPRC All Variants",
                "format": "vcfTabix",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprc/decomposed.vcf.gz",
                "displayMode": "COLLAPSED",
                "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprc/decomposed.vcf.gz.tbi",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=hprcVCF\">HPRC variants decomposed from hprc-v1.0-mc.grch38.vcfbub.a100k.wave.vcf.gz (Liao et al 2023), no size filtering</a>",
                "visible": false,
                "group": "hprc"
            },
            {
                "id": "hprcVCFDecomposedOver3",
                "name": "HPRC Variants > 3bp",
                "format": "vcfTabix",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprc/decomposedOver3.vcf.gz",
                "displayMode": "COLLAPSED",
                "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprc/decomposedOver3.vcf.gz.tbi",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=hprcVCF\">HPRC VCF variants filtered for items size > 3bp</a>",
                "visible": false,
                "group": "hprc"
            },
            {
                "id": "hprcVCFDecomposedUnder4",
                "name": "HPRC Variants <= 3bp",
                "format": "vcfTabix",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprc/decomposedUnder4.vcf.gz",
                "displayMode": "EXPANDED",
                "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprc/decomposedUnder4.vcf.gz.tbi",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=hprcVCF\">HPRC VCF variants filtered for items size <= 3bp</a>",
                "group": "hprc"
            }
        ],
        "children": [
            {
                "name": "hprcArrV1",
                "priority": 10000,
                "label": "Rearrangements",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "hprcDoubleV1",
                        "name": "Other Rearrangements",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprcArrV1/hprcDoubleV1.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Other Rearrangements: Unalignable sequences in both assemblies (inversions, partial transpositions)",
                        "color": "rgb(0,0,0)",
                        "altColor": "rgb(100,50,0)",
                        "visible": false,
                        "group": "hprc"
                    },
                    {
                        "id": "hprcArrDupBedV1",
                        "name": "Duplications",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprcArrV1/hprcArrDupV1.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Duplications with respect to hg38 in HPRC assemblies",
                        "color": "rgb(0,0,0)",
                        "altColor": "rgb(100,50,0)",
                        "visible": false,
                        "group": "hprc"
                    },
                    {
                        "id": "hprcArrInvBedV1",
                        "name": "Inversions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprcArrV1/hprcArrInvV1.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Inversions with respect to hg38 in HPRC assemblies",
                        "color": "rgb(0,0,0)",
                        "altColor": "rgb(100,50,0)",
                        "visible": false,
                        "group": "hprc"
                    },
                    {
                        "id": "hprcDeletionsV1",
                        "name": "Deletions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprcArrV1/hprcDeletionsV1.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Insertions in hg38 = Deletion in the HPRC assemblies",
                        "color": "rgb(0,0,0)",
                        "altColor": "rgb(100,50,0)",
                        "visible": false,
                        "group": "hprc"
                    },
                    {
                        "id": "hprcInsertsV1",
                        "name": "Insertions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hprcArrV1/hprcInsertsV1.bb",
                        "displayMode": "COLLAPSED",
                        "description": "Deletions in hg38 = Insertion in the HPRC assemblies",
                        "color": "rgb(0,0,0)",
                        "altColor": "rgb(100,50,0)",
                        "visible": false,
                        "group": "hprc"
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "name": "expression",
        "priority": 410,
        "label": "Expression",
        "defaultOpen": false,
        "tracks": [],
        "children": [
            {
                "name": "epdNew",
                "priority": 9007199254740990,
                "label": "Promoters from EPDnew",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "epdNewPromoterNonCoding",
                        "name": "EPDnew NC v1",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/epdNewHumanNc001.hg38.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=../../epdNewPromoter\">ncRNA promoters from EPDnewNC human version 001</a>",
                        "color": "rgb(180,0,134)",
                        "visible": false,
                        "infoURL": "https://epd.epfl.ch/cgi-bin/get_doc?db=hsNCEpdNew&format=genome&entry=$$",
                        "group": "expression"
                    },
                    {
                        "id": "epdNewPromoter",
                        "name": "EPDnew v6",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/epdNewHuman006.hg38.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=../../epdNewPromoter\">Promoters from EPDnew human version 006</a>",
                        "color": "rgb(50,50,200)",
                        "visible": false,
                        "infoURL": "https://epd.epfl.ch/cgi-bin/get_doc?db=hgEpdNew&format=genome&entry=$$",
                        "group": "expression"
                    }
                ],
                "children": []
            },
            {
                "name": "gtexCov",
                "priority": 1200,
                "label": "GTEx V8 RNA-Seq Read Coverage by Tissue",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "gtexCovWholeBlood",
                        "name": "Whole Blood",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1LG7Z-0005-SM-DKPQ6.Whole_Blood.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Whole Blood",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(255,0,255)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovVagina",
                        "name": "Vagina",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1IDJU-1026-SM-AHZ2U.Vagina.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Vagina",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,213,210)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovUterus",
                        "name": "Uterus",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1MA7W-1526-SM-DHXKS.Uterus.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Uterus",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,213,210)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovThyroid",
                        "name": "Thyroid",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1HSGN-0726-SM-A9G2F.Thyroid.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Thyroid",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(0,)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovTestis",
                        "name": "Testis",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1JKYN-1026-SM-CGQG4.Testis.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Testis",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(166,166,166)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovStomach",
                        "name": "Stomach",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-NFK9-1526-SM-3LK7B.Stomach.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Stomach",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(255,211,155)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovSpleen",
                        "name": "Spleen",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-14PKU-0526-SM-6871A.Spleen.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Spleen",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovSmallIntestineTerminalIleum",
                        "name": "Small Intestine",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1PIEJ-1526-SM-E6CP8.Small_Intestine_Terminal_Ileum.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Small Intestine Terminal Ileum",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovSkinSunExposedLowerleg",
                        "name": "Skin sun exp",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1C475-1826-SM-73KWA.Skin_Sun_Exposed_Lower_leg.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Skin Sun Exposed Lower leg",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(30,144,255)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovSkinNotSunExposedSuprapubic",
                        "name": "Skin not sun exp",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1JN76-0626-SM-CKZOQ.Skin_Not_Sun_Exposed_Suprapubic.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Skin Not Sun Exposed Suprapubic",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(58,95,205)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovProstate",
                        "name": "Prostate",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-14DAR-1026-SM-73KV3.Prostate.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Prostate",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(217,217,217)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovPituitary",
                        "name": "Pituitary",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-Y111-2926-SM-4TT25.Pituitary.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Pituitary",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(180,238,180)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovPancreas",
                        "name": "Pancreas",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1H1E6-0826-SM-9WG83.Pancreas.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Pancreas",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,155,29)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovOvary",
                        "name": "Ovary",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-ZVT2-0326-SM-5E44G.Ovary.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Ovary",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(255,182,193)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovNerveTibial",
                        "name": "Nerve Tibial",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-TML8-1626-SM-32QOO.Nerve_Tibial.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Nerve Tibial",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(255,215,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovMuscleSkeletal",
                        "name": "Muscle Skeletal",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-NFK9-0626-SM-2HMIV.Muscle_Skeletal.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Muscle Skeletal",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(122,103,238)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovMinorSalivaryGland",
                        "name": "Minor Saliv Gland",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-Y5LM-1826-SM-4VDT9.Minor_Salivary_Gland.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Minor Salivary Gland",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovLung",
                        "name": "Lung",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-Y5V5-0826-SM-4VBQD.Lung.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Lung",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(154,205,50)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovLiver",
                        "name": "Liver",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-Y5LM-0426-SM-4VBRO.Liver.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Liver",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovKidneyMedulla",
                        "name": "Kidney Medulla",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-T5JC-1626-SM-EZ6KW.Kidney_Medulla.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Kidney Medulla",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovKidneyCortex",
                        "name": "Kidney Cortex",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-13OVI-1126-SM-5KLZF.Kidney_Cortex.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Kidney Cortex",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovHeartLeftVentricle",
                        "name": "Heart Left Ventr",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-NFK9-0926-SM-2HMJU.Heart_Left_Ventricle.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Heart Left Ventricle",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(122,55,139)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovHeartAtrialAppendage",
                        "name": "Heart Atr Append",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-13S86-0326-SM-5SI6K.Heart_Atrial_Appendage.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Heart Atrial Appendage",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(180,82,205)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovFallopianTube",
                        "name": "Fallopian Tube",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-OHPK-2326-SM-3MJH2.Fallopian_Tube.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Fallopian Tube",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,213,210)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovEsophagusMuscularis",
                        "name": "Esoph Muscularis",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1C475-0726-SM-73KVL.Esophagus_Muscularis.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Esophagus Muscularis",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,170,125)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovEsophagusMucosa",
                        "name": "Esoph Mucosa",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-11NSD-1126-SM-5N9BQ.Esophagus_Mucosa.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Esophagus Mucosa",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(139,115,85)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovEsophagusGastroesophagealJunction",
                        "name": "Esoph Gastroes Junc",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1I1GU-1226-SM-A9SKT.Esophagus_Gastroesophageal_Junction.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Esophagus Gastroesophageal Junction",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(139,115,85)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovColonTransverse",
                        "name": "Colon Transverse",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1IDJC-1326-SM-CL53H.Colon_Transverse.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Colon Transverse",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,197,145)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovColonSigmoid",
                        "name": "Colon Sigmoid",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1KXAM-1926-SM-D3LAG.Colon_Sigmoid.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Colon Sigmoid",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovCervixEndocervix",
                        "name": "Cervix Endocerv",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-ZPIC-1326-SM-DO91Y.Cervix_Endocervix.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Cervix Endocervix",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,213,210)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovCervixEctocervix",
                        "name": "Cervix Ectocerv",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-S341-1126-SM-4AD6T.Cervix_Ectocervix.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Cervix Ectocervix",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,213,210)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovCellsCulturedfibroblasts",
                        "name": "Cells fibrobl cult",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-117XS-0008-SM-5Q5DQ.Cells_Cultured_fibroblasts.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Cells Cultured fibroblasts",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(154,192,205)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovCellsEBV-transformedlymphocytes",
                        "name": "Cells EBV lymphoc",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1122O-0003-SM-5Q5DL.Cells_EBV-transformed_lymphocytes.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Cells EBV-transformed lymphocytes",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,130,238)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBreastMammaryTissue",
                        "name": "Breast Mammary",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-ZT9W-2026-SM-51MRA.Breast_Mammary_Tissue.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Breast Mammary Tissue",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(0,205,205)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainSubstantianigra",
                        "name": "Brain Subst nigr",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-Z93S-0011-R2a-SM-4RGNG.Brain_Substantia_nigra.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Substantia nigra",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainSpinalcordcervicalc-1",
                        "name": "Brain Spinal cord cerv",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-YFC4-0011-R9a-SM-4SOK4.Brain_Spinal_cord_cervical_c-1.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Spinal cord cervical c-1",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainPutamenbasalganglia",
                        "name": "Brain Put bas gang",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1HFI6-0011-R7b-SM-CM2SS.Brain_Putamen_basal_ganglia.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Putamen basal ganglia",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainNucleusaccumbensbasalganglia",
                        "name": "Brain Nucl acc bas gang",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-14BIN-0011-R6a-SM-5S2RH.Brain_Nucleus_accumbens_basal_ganglia.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Nucleus accumbens basal ganglia",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainHypothalamus",
                        "name": "Brain Hypothal",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-T5JC-0011-R8A-SM-32PLM.Brain_Hypothalamus.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Hypothalamus",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainHippocampus",
                        "name": "Brain Hippocamp",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1HSKV-0011-R1b-SM-CMKH7.Brain_Hippocampus.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Hippocampus",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainFrontalCortexBA9",
                        "name": "Brain Front Cortex",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-T5JC-0011-R10A-SM-32PM2.Brain_Frontal_Cortex_BA9.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Frontal Cortex BA9",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainCortex",
                        "name": "Brain Cortex",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-UTHO-3026-SM-3GAFB.Brain_Cortex.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Cortex",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainCerebellarHemisphere",
                        "name": "Brain Cereb Hemisph",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-13X6J-0011-R11a-SM-5P9HE.Brain_Cerebellar_Hemisphere.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Cerebellar Hemisphere",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainCerebellum",
                        "name": "Brain Cereb",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-145MH-2926-SM-5Q5D2.Brain_Cerebellum.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Cerebellum",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainCaudatebasalganglia",
                        "name": "Brain Caud bas gangl",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1HGF4-0011-R5b-SM-CM2ST.Brain_Caudate_basal_ganglia.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Caudate basal ganglia",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainAnteriorcingulatecortexBA24",
                        "name": "Brain Ant cin cort",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-14PN4-0011-R3b-SM-686ZU.Brain_Anterior_cingulate_cortex_BA24.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Anterior cingulate cortex BA24",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBrainAmygdala",
                        "name": "Brain Amygd",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-T5JC-0011-R4A-SM-32PLT.Brain_Amygdala.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Brain Amygdala",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,238,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovBladder",
                        "name": "Bladder",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-S3XE-1226-SM-4AD4L.Bladder.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Bladder",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(205,183,158)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovArteryTibial",
                        "name": "Artery Tibia",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-XPT6-2226-SM-4B66R.Artery_Tibial.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Artery Tibial",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(255,0,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovArteryCoronary",
                        "name": "Artery Coron",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-1GMR3-0626-SM-9WYT3.Artery_Coronary.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Artery Coronary",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,106,80)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovArteryAorta",
                        "name": "Artery Aorta",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-WYVS-0426-SM-4ONDL.Artery_Aorta.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Artery Aorta",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(139,28,98)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovAdrenalGland",
                        "name": "Adren Gland",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-Y5LM-0126-SM-4VBRL.Adrenal_Gland.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Adrenal Gland",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(143,188,143)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovAdiposeVisceralOmentum",
                        "name": "Adip Visc Om",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-14BMU-0626-SM-73KZ6.Adipose_Visceral_Omentum.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Adipose Visceral Omentum - GTEX-14BMU-0626-SM-73KZ6",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(238,154,0)",
                        "group": "expression"
                    },
                    {
                        "id": "gtexCovAdiposeSubcutaneous",
                        "name": "Adip Subcut",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/cov/GTEX-NFK9-0326-SM-3MJGV.Adipose_Subcutaneous.RNAseq.bw",
                        "displayMode": "COLLAPSED",
                        "description": "Adipose Subcutaneous",
                        "autoscale": false,
                        "maxHeight": 100,
                        "height": 50,
                        "minHeight": 8,
                        "color": "rgb(255,165,79)",
                        "group": "expression"
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "name": "regulation",
        "priority": 500,
        "label": "Regulation",
        "defaultOpen": false,
        "tracks": [
            {
                "id": "TFrPeakClusters",
                "name": "TF rPeak Clusters",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/ENCODE4/TFrPeakClusters.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=TFrPeakClusters\">Transcription Factor Representative Peak (rPeak) Clusters (912 factors in 1152 biosamples) from ENCODE 4</a>",
                "visible": false,
                "group": "regulation"
            },
            {
                "id": "encodeCcreCombined",
                "name": "ENCODE cCREs",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/encode3/ccre/encodeCcreCombined.bb",
                "displayMode": "COLLAPSED",
                "description": "ENCODE Candidate Cis-Regulatory Elements (cCREs) combined from all cell types",
                "infoURL": "https://screen-v2.wenglab.org/search/?q=$$&assembly=GRCh38",
                "group": "regulation"
            },
            {
                "id": "refSeqFuncElems",
                "name": "RefSeq Func Elems",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/ncbiRefSeq/refSeqFuncElems.bb",
                "displayMode": "COLLAPSED",
                "description": "NCBI RefSeq Functional Elements",
                "group": "regulation"
            },
            {
                "id": "vistaEnhancersBb",
                "name": "VISTA Enhancers",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/vistaEnhancers/vistaEnhancers.bb",
                "displayMode": "COLLAPSED",
                "description": "VISTA Enhancers",
                "infoURL": "https://enhancer.lbl.gov/vista/browse?filter=$$",
                "group": "regulation"
            }
        ],
        "children": [
            {
                "name": "cpgIslands",
                "priority": 9007199254740990,
                "label": "CpG Islands (Islands < 300 Bases are Light Green)",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "cpgIslandExt",
                        "name": "CpG Islands",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.cpgIslandExt.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.cpgIslands\">CpG Islands (Islands < 300 Bases are Light Green)</a>",
                        "group": "regulation"
                    }
                ],
                "children": []
            },
            {
                "name": "ReMap",
                "priority": 9007199254740990,
                "label": "ReMap Atlas of Regulatory Regions",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "ReMapTFs",
                        "name": "ReMap ChIP-seq",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/reMap/reMap2022.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=ReMap\">ReMap Atlas of Regulatory Regions</a>",
                        "visible": false,
                        "group": "regulation"
                    },
                    {
                        "id": "ReMapDensity",
                        "name": "ReMap density",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/reMap/reMapDensity2022.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=ReMap\">ReMap density</a>",
                        "autoscale": true,
                        "visible": false,
                        "group": "regulation"
                    }
                ],
                "children": []
            },
            {
                "name": "geneHancer",
                "priority": 9007199254740990,
                "label": "GeneHancer",
                "defaultOpen": false,
                "tracks": [],
                "children": [
                    {
                        "name": "ghGeneHancer",
                        "priority": 9007199254740990,
                        "label": "Reg Elem",
                        "defaultOpen": false,
                        "tracks": [
                            {
                                "id": "geneHancerRegElements",
                                "name": "GH Reg Elems",
                                "format": "bigBed",
                                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/geneHancer/geneHancerRegElementsAll.hg38.bb",
                                "displayMode": "COLLAPSED",
                                "description": "Enhancers and promoters from GeneHancer",
                                "visible": false,
                                "group": "regulation"
                            },
                            {
                                "id": "geneHancerRegElementsDoubleElite",
                                "name": "GH Reg Elems (DE)",
                                "format": "bigBed",
                                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/geneHancer/geneHancerRegElementsDoubleElite.hg38.bb",
                                "displayMode": "COLLAPSED",
                                "description": "Enhancers and promoters from GeneHancer (Double Elite)",
                                "visible": false,
                                "group": "regulation"
                            }
                        ],
                        "children": []
                    },
                    {
                        "name": "ghGeneTss",
                        "priority": 9007199254740990,
                        "label": "Gene TSS",
                        "defaultOpen": false,
                        "tracks": [
                            {
                                "id": "geneHancerGenes",
                                "name": "GH genes TSS",
                                "format": "bigBed",
                                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/geneHancer/geneHancerGenesTssAll.hg38.bb",
                                "displayMode": "COLLAPSED",
                                "description": "GH genes TSS",
                                "visible": false,
                                "group": "regulation"
                            },
                            {
                                "id": "geneHancerGenesDoubleElite",
                                "name": "GH genes TSS (DE)",
                                "format": "bigBed",
                                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/geneHancer/geneHancerGenesTssDoubleElite.hg38.bb",
                                "displayMode": "COLLAPSED",
                                "description": "GeneCards genes TSS (Double Elite)",
                                "visible": false,
                                "group": "regulation"
                            }
                        ],
                        "children": []
                    }
                ]
            },
            {
                "name": "gtexEqtlHighConf",
                "priority": 9007199254740990,
                "label": "GTEx fine-mapped cis-eQTLs",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "gtexEqtlDapg",
                        "name": "GTEx DAP-G eQTLs",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/eQtl/gtexDapg.bb",
                        "displayMode": "COLLAPSED",
                        "description": "GTEx High-Confidence cis-eQTLs from DAP-G (no chrX)",
                        "visible": false,
                        "group": "regulation"
                    },
                    {
                        "id": "gtexEqtlCaviar",
                        "name": "GTEx CAVIAR eQTLs",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/gtex/eQtl/gtexCaviar.bb",
                        "displayMode": "COLLAPSED",
                        "description": "GTEx High-Confidence cis-eQTLs from CAVIAR (no chrX)",
                        "visible": false,
                        "group": "regulation"
                    }
                ],
                "children": []
            },
            {
                "name": "jaspar",
                "priority": 9007199254740990,
                "label": "JASPAR Transcription Factor Binding Site Database",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "jaspar2018",
                        "name": "JASPAR 2018 TFBS",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/jaspar/JASPAR2018.bb",
                        "displayMode": "COLLAPSED",
                        "description": "JASPAR CORE 2018 - Predicted Transcription Factor Binding Sites",
                        "visible": false,
                        "group": "regulation"
                    },
                    {
                        "id": "jaspar2020",
                        "name": "JASPAR 2020 TFBS",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/jaspar/JASPAR2020.bb",
                        "displayMode": "COLLAPSED",
                        "description": "JASPAR CORE 2020 - Predicted Transcription Factor Binding Sites",
                        "visible": false,
                        "group": "regulation"
                    },
                    {
                        "id": "jaspar2022",
                        "name": "JASPAR 2022 TFBS",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/jaspar/JASPAR2022.bb",
                        "displayMode": "COLLAPSED",
                        "description": "JASPAR CORE 2022 - Predicted Transcription Factor Binding Sites",
                        "visible": false,
                        "group": "regulation"
                    },
                    {
                        "id": "jaspar2024",
                        "name": "JASPAR 2024 TFBS",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/jaspar/JASPAR2024.bb",
                        "displayMode": "COLLAPSED",
                        "description": "JASPAR CORE 2024 - Predicted Transcription Factor Binding Sites",
                        "visible": false,
                        "group": "regulation"
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "name": "var",
        "priority": 700,
        "label": "Variation",
        "defaultOpen": false,
        "tracks": [],
        "children": [
            {
                "name": "dbSnp155Composite",
                "priority": 80,
                "label": "Short Genetic Variants from dbSNP release 155",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "dbSnp155",
                        "name": "All dbSNP(155)",
                        "format": "bigDbSnp",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/snp/dbSnp155.bb",
                        "displayMode": "EXPANDED",
                        "description": "All Short Genetic Variants from dbSNP Release 155",
                        "group": "var"
                    },
                    {
                        "id": "dbSnp155Mult",
                        "name": "Mult. dbSNP(155)",
                        "format": "bigDbSnp",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/snp/dbSnp155Mult.bb",
                        "displayMode": "EXPANDED",
                        "description": "Short Genetic Variants from dbSNP Release 155 that Map to Multiple Genomic Loci",
                        "group": "var"
                    },
                    {
                        "id": "dbSnp155ClinVar",
                        "name": "ClinVar dbSNP(155)",
                        "format": "bigDbSnp",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/snp/dbSnp155ClinVar.bb",
                        "displayMode": "EXPANDED",
                        "description": "Short Genetic Variants from dbSNP Release 155 Included in ClinVar",
                        "group": "var"
                    },
                    {
                        "id": "dbSnp155Common",
                        "name": "Common dbSNP(155)",
                        "format": "bigDbSnp",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/snp/dbSnp155Common.bb",
                        "displayMode": "EXPANDED",
                        "description": "Common (1000 Genomes Phase 3 MAF >= 1%) Short Genetic Variants from dbSNP Release 155",
                        "group": "var"
                    },
                    {
                        "id": "dbSnp155BadCoords",
                        "name": "Map Err dbSnp(155)",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/snp/dbSnp155BadCoords.bb",
                        "displayMode": "EXPANDED",
                        "description": "Mappings with Inconsistent Coordinates from dbSNP 155",
                        "color": "rgb(100,100,100)",
                        "group": "var"
                    }
                ],
                "children": []
            },
            {
                "name": "dgvPlus",
                "priority": 9007199254740990,
                "label": "DGV Struct Var",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "dgvGold",
                        "name": "DGV Gold Standard",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/dgv/dgvGold.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38g=dgvPlus\">Database of Genomic Variants: Gold Standard Variants</a>",
                        "visible": false,
                        "infoURL": "http://dgv.tcag.ca/gb2/gbrowse_details/dgv2_hg38?ref=$S;start=${;end=$};name=$$;class=Sequence",
                        "searchIndex": "name",
                        "group": "var"
                    },
                    {
                        "id": "dgvSupporting",
                        "name": "DGV Supp Var",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/dgv/dgvSupporting.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38g=dgvPlus\">Database of Genomic Variants: Supporting Structural Var (CNV, Inversion, In/del)</a>",
                        "visible": false,
                        "searchIndex": "name",
                        "group": "var"
                    },
                    {
                        "id": "dgvMerged",
                        "name": "DGV Struct Var",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/dgv/dgvMerged.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38g=dgvPlus\">Database of Genomic Variants: Structural Var Regions (CNV, Inversion, In/del)</a>",
                        "visible": false,
                        "searchIndex": "name",
                        "group": "var"
                    }
                ],
                "children": []
            },
            {
                "name": "platinumGenomes",
                "priority": 9007199254740990,
                "label": "Platinum genome variants",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "platinumNA12878",
                        "name": "NA12878",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/platinumGenomes/NA12878.vcf.gz",
                        "displayMode": "EXPANDED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/platinumGenomes/NA12878.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=../platinumGenomes\">Platinum genome variant NA12878</a>",
                        "group": "var"
                    },
                    {
                        "id": "platinumNA12877",
                        "name": "NA12877",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/platinumGenomes/NA12877.vcf.gz",
                        "displayMode": "EXPANDED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/platinumGenomes/NA12877.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=../platinumGenomes\">Platinum genome variant NA12877</a>",
                        "group": "var"
                    },
                    {
                        "id": "platinumHybrid",
                        "name": "hybrid",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/platinumGenomes/hg38.hybrid.vcf.gz",
                        "displayMode": "EXPANDED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/platinumGenomes/hg38.hybrid.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=../platinumGenomes\">Platinum genome hybrid</a>",
                        "group": "var"
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "name": "rep",
        "priority": 720,
        "label": "Repeats",
        "defaultOpen": false,
        "tracks": [
            {
                "id": "simpleRepeat",
                "name": "Simple Repeats",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.simpleRepeat.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.simpleRepeat\">Simple Tandem Repeats by TRF</a>",
                "group": "rep"
            },
            {
                "id": "nuMtSeq",
                "name": "NuMTs Sequence",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/bbi/nuMtSeq/nuMtSeq_hg38.bb",
                "displayMode": "COLLAPSED",
                "description": "Nuclear mitochondrial DNA segments",
                "group": "rep"
            }
        ],
        "children": [
            {
                "name": "repeatMasker",
                "priority": 9007199254740990,
                "label": "Repeating Elements by RepeatMasker",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "repeatMaskerSINE",
                        "name": "SINE",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.SINE.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">SINE Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerLINE",
                        "name": "LINE",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.LINE.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">LINE Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerLTR",
                        "name": "LTR",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.LTR.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">LTR Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerDNA",
                        "name": "DNA",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.DNA.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">DNA Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerSimple",
                        "name": "Simple",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.Simple.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">Simple Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerLowComplexity",
                        "name": "Low Complexity",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.Low_complexity.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">Low Complexity Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerSatellite",
                        "name": "Satellite",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.Satellite.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">Satellite Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerRNA",
                        "name": "RNA",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.RNA.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">RNA Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    },
                    {
                        "id": "repeatMaskerOther",
                        "name": "Other",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.rmsk.Other.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.repeatMasker\">Other Repeating Elements by RepeatMasker</a>",
                        "group": "rep"
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "name": "map",
        "priority": 900,
        "label": "Mapping and Sequencing",
        "defaultOpen": false,
        "tracks": [
            {
                "id": "gc5Base",
                "name": "GC Percent",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.gc5Base.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.gc5Base\">GC Percent in 5-Base Windows</a>",
                "autoscale": false,
                "maxHeight": 128,
                "height": 36,
                "minHeight": 16,
                "color": "rgb(0,0,0)",
                "altColor": "rgb(128,128,128)",
                "min": 30,
                "max": 70,
                "group": "map"
            },
            {
                "id": "recomb1000GAvg",
                "name": "Recomb. 1k Genomes",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/recombRate/recomb1000GAvg.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=recombRate2\">Recombination rate: 1000 Genomes, lifted from hg19 (PR Loh)</a>",
                "maxHeight": 128,
                "height": 60,
                "minHeight": 8,
                "color": "rgb(0,130,0)",
                "min": 0,
                "max": 100,
                "group": "map"
            },
            {
                "id": "recombAvg",
                "name": "Recomb. deCODE Avg",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/recombRate/recombAvg.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=recombRate2\">Recombination rate: deCODE Genetics, average from paternal and maternal (mat for chrX)</a>",
                "maxHeight": 128,
                "height": 60,
                "minHeight": 8,
                "color": "rgb(0,130,0)",
                "min": 0,
                "max": 100,
                "group": "map"
            },
            {
                "id": "recombDnm",
                "name": "Recomb. deCODE Dmn",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/recombRate/recombDenovo.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=recombRate2\">Recombination rate: De-novo mutations found in deCODE samples</a>",
                "color": "rgb(0,130,0)",
                "visible": false,
                "group": "map"
            },
            {
                "id": "recombEvents",
                "name": "Recomb. deCODE Evts",
                "format": "bigBed",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/recombRate/events.bb",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=recombRate2\">Recombination events in deCODE Genetic Map (zoom to < 10kbp to see the events)</a>",
                "color": "rgb(0,130,0)",
                "visible": false,
                "group": "map"
            },
            {
                "id": "recombMat",
                "name": "Recomb. deCODE Mat",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/recombRate/recombMat.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=recombRate2\">Recombination rate: deCODE Genetics, maternal</a>",
                "maxHeight": 128,
                "height": 60,
                "minHeight": 8,
                "color": "rgb(0,130,0)",
                "min": 0,
                "max": 100,
                "group": "map"
            },
            {
                "id": "recombPat",
                "name": "Recomb. deCODE Pat",
                "format": "bigWig",
                "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/recombRate/recombPat.bw",
                "displayMode": "COLLAPSED",
                "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=recombRate2\">Recombination rate: deCODE Genetics, paternal</a>",
                "maxHeight": 128,
                "height": 60,
                "minHeight": 8,
                "color": "rgb(0,130,0)",
                "min": 0,
                "max": 100,
                "group": "map"
            }
        ],
        "children": [
            {
                "name": "tanDups",
                "priority": 9007199254740990,
                "label": "Paired identical sequences",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "tandemDups",
                        "name": "Tandem Dups",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/bbi/GCF_000001405.40_GRCh38.p14.tandemDups.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/html/GCF_000001405.40_GRCh38.p14.tanDups\">Paired exactly identical sequence survey over entire genome assembly</a>",
                        "visible": false,
                        "group": "map"
                    }
                ],
                "children": []
            },
            {
                "name": "highlyReproducible",
                "priority": 200,
                "label": "Highly Reproducible genomic regions and variants",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "hr_na12878Vcf",
                        "name": "HR_NA12878 Variants",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA12878.sort.vcf.gz",
                        "displayMode": "COLLAPSED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA12878.sort.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">HR_NA12878 Variants</a>",
                        "visible": false,
                        "group": "map"
                    },
                    {
                        "id": "hr_na12249Vcf",
                        "name": "HR_NA12249 Variants",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA12249.sort.vcf.gz",
                        "displayMode": "COLLAPSED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA12249.sort.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">HR_NA12249 Variants</a>",
                        "visible": false,
                        "group": "map"
                    },
                    {
                        "id": "hr_na12248Vcf",
                        "name": "HR_NA12248 Variants",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA12248.sort.vcf.gz",
                        "displayMode": "COLLAPSED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA12248.sort.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">HR_NA12248 Variants</a>",
                        "visible": false,
                        "group": "map"
                    },
                    {
                        "id": "hr_na10835Vcf",
                        "name": "HR_NA10835 Variants",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA10835.sort.vcf.gz",
                        "displayMode": "COLLAPSED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/HR_NA10835.sort.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">HR_NA10835 Variants</a>",
                        "visible": false,
                        "group": "map"
                    },
                    {
                        "id": "cq8Vcf",
                        "name": "CQ-8 Variants",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/CQ-8.sort.vcf.gz",
                        "displayMode": "COLLAPSED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/CQ-8.sort.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">CQ-8 Variants</a>",
                        "visible": false,
                        "group": "map"
                    },
                    {
                        "id": "cq7Vcf",
                        "name": "CQ-7 Variants",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/CQ-7.sort.vcf.gz",
                        "displayMode": "COLLAPSED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/CQ-7.sort.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">CQ-7 Variants</a>",
                        "visible": false,
                        "group": "map"
                    },
                    {
                        "id": "cq56Vcf",
                        "name": "CQ-56 Variants",
                        "format": "vcfTabix",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/CQ-56.sort.vcf.gz",
                        "displayMode": "COLLAPSED",
                        "indexURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/CQ-56.sort.vcf.gz.tbi",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">CQ-56 Variants</a>",
                        "visible": false,
                        "group": "map"
                    },
                    {
                        "id": "highReproRegions",
                        "name": "Highly Reproducible Regions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/highRepro/highRepro.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">Highly Reproducible Regions</a>",
                        "visible": false,
                        "group": "map"
                    }
                ],
                "children": []
            },
            {
                "name": "problematic",
                "priority": 100,
                "label": "Problematic Regions",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "grcExclusions",
                        "name": "GRC Exclusions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/grcExclusions.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">GRC Exclusion list: contaminations or false duplications</a>",
                        "group": "map"
                    },
                    {
                        "id": "encBlacklist",
                        "name": "ENCODE Blacklist V2",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/encBlacklist.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">ENCODE Blacklist V2</a>",
                        "group": "map"
                    },
                    {
                        "id": "comments",
                        "name": "UCSC Unusual Regions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/comments.bb",
                        "displayMode": "EXPANDED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">UCSC unusual regions on assembly structure (manually annotated)</a>",
                        "searchIndex": "name",
                        "trixURL": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/notes.ix",
                        "group": "map"
                    }
                ],
                "children": []
            },
            {
                "name": "problematicGIAB",
                "priority": 300,
                "label": "Difficult regions from GIAB via NCBI",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "notinalllowmapandsegdupregions",
                        "name": "Not lowMap+SegDup",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/GIAB/notinalllowmapandsegdupregions.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">Genome In a Bottle: not lowMap+SegDup mapping regions</a>",
                        "group": "map"
                    },
                    {
                        "id": "notinalldifficultregions",
                        "name": "Not difficult regions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/GIAB/notinalldifficultregions.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">Genome In a Bottle: not difficult regions</a>",
                        "group": "map"
                    },
                    {
                        "id": "alllowmapandsegdupregions",
                        "name": "LowMap+SegDup",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/GIAB/alllowmapandsegdupregions.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">Genome In a Bottle: lowMap+SegDup regions</a>",
                        "group": "map"
                    },
                    {
                        "id": "alldifficultregions",
                        "name": "All difficult regions",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/problematic/GIAB/alldifficultregions.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=problematic\">Genome In a Bottle: all difficult regions</a>",
                        "group": "map"
                    }
                ],
                "children": []
            },
            {
                "name": "umap",
                "priority": 9007199254740990,
                "label": "Single-read and multi-read mappability by Umap",
                "defaultOpen": false,
                "tracks": [
                    {
                        "id": "umap100Quantitative",
                        "name": "Umap M100",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k100.Umap.MultiTrackMappability.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Multi-read mappability with 100-mers</a>",
                        "color": "rgb(80,170,240)",
                        "group": "map"
                    },
                    {
                        "id": "umap50Quantitative",
                        "name": "Umap M50",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k50.Umap.MultiTrackMappability.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Multi-read mappability with 50-mers</a>",
                        "color": "rgb(80,120,240)",
                        "group": "map"
                    },
                    {
                        "id": "umap36Quantitative",
                        "name": "Umap M36",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k36.Umap.MultiTrackMappability.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Multi-read mappability with 36-mers</a>",
                        "color": "rgb(80,70,240)",
                        "group": "map"
                    },
                    {
                        "id": "umap24Quantitative",
                        "name": "Umap M24",
                        "format": "bigWig",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k24.Umap.MultiTrackMappability.bw",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Multi-read mappability with 24-mers</a>",
                        "color": "rgb(80,20,240)",
                        "group": "map"
                    },
                    {
                        "id": "umap100",
                        "name": "Umap S100",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k100.Unique.Mappability.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Single-read mappability with 100-mers</a>",
                        "color": "rgb(80,170,240)",
                        "group": "map"
                    },
                    {
                        "id": "umap50",
                        "name": "Umap S50",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k50.Unique.Mappability.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Single-read mappability with 50-mers</a>",
                        "color": "rgb(80,120,240)",
                        "group": "map"
                    },
                    {
                        "id": "umap36",
                        "name": "Umap S36",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k36.Unique.Mappability.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Single-read mappability with 36-mers</a>",
                        "color": "rgb(80,70,240)",
                        "group": "map"
                    },
                    {
                        "id": "umap24",
                        "name": "Umap S24",
                        "format": "bigBed",
                        "url": "https://hgdownload.soe.ucsc.edu/gbdb/hg38/hoffmanMappability/k24.Unique.Mappability.bb",
                        "displayMode": "COLLAPSED",
                        "description": "<a target=\"_blank\" href=\"https://genome.ucsc.edu/cgi-bin/hgTrackUi?db=hg38&g=mappability\">Single-read mappability with 24-mers</a>",
                        "color": "rgb(80,20,240)",
                        "group": "map"
                    }
                ],
                "children": []
            }
        ]
    }
]