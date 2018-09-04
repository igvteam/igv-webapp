### Supported file formats

* fasta
* bed
* bedpe
* gff3
* gtf
* wig
* bedgraph
* bigwig
* bigbed
* tdf
* vcf
* bam

### Index file formats

Index files are required for bam files, and strongly recommended for any text file over 2MB in size.  

* bam:  "bai" index files  (reference samtools, igvtools)
* fasta: "fai" index files  (reference samtools, igvtools)
* vcf, bed, gff3, gtf, bedgraph:  ".gz.tbi"  tabix index files
* vcf, bed, gff3, gtf:  IGV/tribble ".idx" index files.  


