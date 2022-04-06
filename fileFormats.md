### Supported file formats

* bam
* bed
* bigbed
* bedpe
* bedgraph
* broadpeak
* bp (rna secondary structure)
* cram
* fasta (for reference genome sequence)
* genepred
* genepredext
* gff3
* gtf
* gwas
* interact
* maf (mutation annotation format)
* mut
* narrowpeak
* seg
* tdf
* vcf
* wig
* bigwig

### Index file formats

Index files are required for bam and cram files, and strongly recommended for any text file over 2MB in size.  

* bam:  "bai" index files  (reference samtools, igvtools)
* cram: "crai" index files 
* fasta: "fai" index files  (reference samtools, igvtools)
* bed, bedgraph, gff3, gtf, vcf:  ".gz.tbi"  tabix index files
* bed, gff3, gtf, vcf:  IGV/tribble ".idx" index files.  

_Last updated April 2022_
