export default {
    "label": "Annotations",
    "description": "Annotations from the <a href=https://genome.ucsc.edu/target=_blank>UCSC Genome Browser</a>",
    "link": "https://hgdownload.soe.ucsc.edu/downloads.html",
    "tracks": [
        {
            "name": "Ensembl Genes",
            "type": "annotation",
            "format": "ensgene",
            "displayMode": "EXPANDED",
            "url": "https://s3.amazonaws.com/igv.org.genomes/bosTau9/ensGene.txt.gz",
            "indexURL": "https://s3.amazonaws.com/igv.org.genomes/bosTau9/ensGene.txt.gz.tbi",
            "visibilityWindow": 20000000
        },
        {
            "name": "Repeat Masker",
            "type": "annotation",
            "format": "rmsk",
            "displayMode": "EXPANDED",
            "url": "https://s3.amazonaws.com/igv.org.genomes/bosTau9/rmsk.txt.gz",
            "indexURL": "https://s3.amazonaws.com/igv.org.genomes/bosTau9/rmsk.txt.gz.tbi",
            "visibilityWindow": 1000000
        },
        {
            "name": "CpG Islands",
            "type": "annotation",
            "format": "cpgIslandExt",
            "displayMode": "EXPANDED",
            "url": "https://s3.amazonaws.com/igv.org.genomes/bosTau9/cpgIslandExt.txt.gz"
        }
    ]
}