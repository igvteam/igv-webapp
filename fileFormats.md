### Supported file formats

* bam
* bed
* bedpe
* bigbed
* bedgraph
* bigwig
* cram
* fasta (for reference genome sequence)
* gff3
* gtf
* tdf
* vcf
* wig

### Index file formats

Index files are required for bam files, and strongly recommended for any text file over 2MB in size.  

* bam:  "bai" index files  (reference samtools, igvtools)
* cram: "crai" index files 
* fasta: "fai" index files  (reference samtools, igvtools)
* bed, bedgraph, gff3, gtf, vcf:  ".gz.tbi"  tabix index files
* bed, gff3, gtf, vcf:  IGV/tribble ".idx" index files.  


