***

# THIS SITE IS UNDER CONSTRUCTION

***

## Quick Start

### 1. Open the IGV-Web app

In a web browser, navigate to <https://www.igv.org/app>.  

### 2. Load a reference genome
When the IGV-Web page first loads, it will load the default reference genome **hg19**. To load a different genome, click on the `Genome` dropdown menu and either select from the list of pre-defined genomes, or use one of the options to load a genome sequence file that you specify.

> Note that you must first load the reference genome, before loading data tracks. Switching genomes will clear out any loaded tracks.

#### Selecting a pre-defined genome

The available pre-defined genomes are listed at the top of the menu. If you select any of these genomes, a corresponding gene annotation track will also be loaded.

> Note that the menu includes the complete list of pre-defined genomes. Unlike IGV-Desktop, there is no `More...` entry at the bottom of the menu to access a longer list.

#### Loading a genome file

If you have a FASTA file of your reference genome sequence, you can load it using one of the options in the bottom part of the menu: 

* `Local File`
* `Dropbox`
* `Google Drive`
* `URL`

Selecting the `URL` option will present a dialog to enter the full web link URL to the FASTA file and the corresponding index file. For the other options, both the FASTA file and the index file must be selected from the file chooser that pops up.

You will be prompted to sign into a Google account if you select the `Google Drive` option, and a [Dropbox](https://www.dropbox.com) account is needed for the `Dropbox` option. 

> Note that if you load the reference genome by loading a FASTA file, IGV cannot display the cytoband idiogram in the chromosome ruler or automatically load a corresponding gene annotation track. You can load a genome annotation file directly via the `Load Track` menu.

SHALL WE DOCUMENT THE JSON OPTION HERE TOO? OR MENTION IT AND REFER TO THE DEVELOPER WIKI DOC? OR NOT MENTION IT AT ALL?

### 3. Load data tracks

To load data and genomic annotations, click on the `Load Track` dropdown menu and either select from the selection of pre-defined tracks or choose one of the options to load a file that you specify.

#### Selecting a pre-defined track

The available pre-defined track sources are listed at the bottom of the menu. Clicking on a source will open a list of datasets from that source. For example, if `ENCODE` is one of the menu items, clicking on it will bring up a table of datasets available from the ENCODE data portal (Encyclopedia of DNA Elements, <https://www.encodeproject.org>). 
 
More information on the available data sources can be found [here](./dataSources.html). 

> Note that the list of pre-defined track sources varies depending on the current reference genome. Some genomes do not come with any pre-defined tracks. 

#### Loading a track file

To load track data from a file, use one of the options in the top part of the menu: 

* `Local File`
* `Dropbox`
* `Google Drive`
* `URL`

Selecting the `URL` option will present a dialog to enter the full web link URL to one data file and the corresponding index file if there is one. For the other options, a file chooser pops up and you can select files for mulitple tracks, along with the corresponding index files.

You will be prompted to sign into a Google account if you select the `Google Drive` option, and a [Dropbox](https://www.dropbox.com) account is needed for the `Dropbox` option. 

#### Removing a track

To remove a track from the IGV browser, click on the gear icon to the right of the track and select `Remove track` from the menu that pops up.

> Note that removing a track does not just hide the track. If you want to show it again you must reload the data. Be aware that you can also remove a gene annotation track that was automatically loaded with a pre-defined reference genome; and it cannot be reloaded without reselecting that reference genome. 

### 4. Navigate

* By gene  (currently human and mouse only)

* By explicit location

* Zooming -- sweep, double-click.  -/+ buttons

* Multi-locus

### 5. Bookmark your session

### 6. Share your session




