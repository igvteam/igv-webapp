# IGV Web App

igv-webapp is a pure-client "genome browser" application based on [igv.js](https://github.com/igvteam/igv.js).  It is developed by the [Integrative Genomics Viewer (IGV)](https://igv.org) team. You can use our hosted app at https://igv.org/app, or follow the directions below to install your own.

## Requirements
- Node >= v8.11.4
- NPM >= v5.6.0

## Supported Browsers

igv-webapp and igv.js require a modern web browser with support for Javascript ECMAScript 2015.

## Installation
* Clone this repository
````
git clone git@github.com:igvteam/igv-webapp.git
````
* Change directories to project
````
cd ./igv-webapp
````
* Install
````
npm install
````
* Build
````
npm run build
````

## Running the app

igv-webapp is a pure client web application consisting entirely of static files and can be served from virtually any web server, 
e.g.  Apache, Flask, Tomcat, nginx,  or Amazon S3.  As an example, instructions for use with the NPM package http-server follow.

### http-server

Instructions for running with [http-server](https://www.npmjs.com/package/http-server).  For more options, including
installing http-server locally, see [http-server](https://www.npmjs.com/package/http-server).

* Start http-server on the ```dist``` directory
````
npx http-server -a localhost dist
````

* Open a browser and enter the following
````
localhost:8080
````

or
````
localhost:8080/index.html
````

### Amazon S3

To server the app from Amazon S3 simply upload the contents of "dist" to an Amazon S3 bucket.  Keep the 
directory structure intact, and make all files public.  Example of an S3 hosted app is at  
https://s3.amazonaws.com/igv.org.app/app/index.html.   Note this is an example and is not kept up-to-date.


## Configuration

**NOTE:** 

Your must rebuild the dist directory ``` npm run build``` after making any to configuration files in ```resources```.  Alternatively 
you can manually copy the changed files to ```dist/resources```,  or just edit ```dist/resources``` directly.


The webapp is configured with the global **igvwebConfig** defined in _igvwebConfig.js_.  The following properties
are customizable.

* genomes - url to a file containing a list of genome configuration objects.  This list populates the Genomes 
pulldown menu.  See the [igv.js wiki](https://github.com/igvteam/igv.js/wiki/Reference-Genome-2.0) for a description of 
the genome configuration object.  For an example see 
the default genome list in ```resources/genomes```.

* trackRegistryFile - url to a file configurating the Track pulldown.  Use this to define custom load menus.  The file contains
a json object with genomeIDs as keys and an array of URLs to json files defining menu entries in the _Load Tracks_ pulldown.
For an example see the default configuration at ```resources/tracks/trackRegistry.json```.    Further details on the track menu configuration are available [below](#track-registry).

* igvConfg - an igv.js configuration object.   See the [igv.js wiki](https://github.com/igvteam/igv.js/wiki/Browser-Configuration-2.0) for details.

* clientId - **Optional** a Google clientId, used to enable OAuth for the Google picker and access to protected
Google resources.  See [Google Support](https://developers.google.com/identity/sign-in/web/sign-in) for
instructions on obtaining a clienId.  OAuth requests from igv.js will include the following scopes.

    * https://www.googleapis.com/auth/devstorage.read_only 
    * https://www.googleapis.com/auth/userinfo.profile 
    * https://www.googleapis.com/auth/drive.readonly'
  
* urlShortener - an object or function defining a URL shortener to shorten links created by the **Share** button.  The value of this property can be replaced with a function, taking a single argument (the long URL) and returning the shortened url, or an Object. 

### Default configuration

```javascript


var igvwebConfig = {
    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",
    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "hg19",
            showSVGButton: false,
            tracks: [
                // TODO (optional) -- add default tracks here.  See github.com/igvteam/igv.js/wiki for details
                // {
                //     name: "CTCF - string url",
                //     type: "wig",
                //     format: "bigwig",
                //     url: "https://www.encodeproject.org/files/ENCFF563PAW/@@download/ENCFF563PAW.bigWig"
                // }
            ]
        },

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened .
    urlShortener: {
        provider: "tinyURL"
    }
};
```
`
### Track Registry

The registry consists of a map linking genome ID to a list of track configuration files.   Each track configuration
file defines a menu in the "Tracks" pulldown.   For example, the registry below defines 2 menus for genome hg19,
and a single menu for hg38.

```json
{
  "hg19" : [
    "resources/tracks/hg19_annotations.json",
    "resources/tracks/hg19_platinum_genomes.json"
  ],

  "hg38" : [
    "resources/tracks/hg38_annotations.json"
  ]
}
```


Menu files specify a label for the menu, an optional description of the menu,  and a list of tracks configurations or a type property. 
The example below defines a menu labeled "Annotations" with a single entry, a bed file of gene annotations.
For a complete description of track configuration objects see the [igv.js wiki](https://github.com/igvteam/igv.js/wiki/Tracks-2.0).

```json
{
  "label": "Annotations",
  "description": "Annotations - source <a href=http://hgdownload.soe.ucsc.edu/downloads.html target=_blank>UCSC Genome Browser</a>",
  "tracks": [
	{
	  "type": "bed",
	  "url": "https://s3.dualstack.us-east-1.amazonaws.com/igv.org.test/data/gencode.v18.collapsed.bed",
	  "indexURL": "https://s3.dualstack.us-east-1.amazonaws.com/igv.org.test/data/gencode.v18.collapsed.bed.idx",
	  "name": "Gencode V18"
	}]
}
	
```

The type property can be used in lieu of a track list to trigger pre-defined lists of tracks for special data sources.
Currently the only recognized value is "ENCODE".   This property can be used to populate an ENCODE load widget for any
genome assembly with data hosted by the [ENCODE project](https://www.encodeproject.org/).   Currently this includes
assemblies for human (hg19, GRCh38),  mouse (mm10), worm (ce11), and fly (dm6).

```json
{
  "label": "ENCODE",
  "type": "ENCODE",
  "description": "<a href=hhttps://www.encodeproject.org/ target=_blank>Encylopedia of Genomic Elements</a>",
  "genomeID": "hg19"
}

```

### Data Servers

IGV-webapp uses igv.js, a javascript client. Servers for track data must support CORS access and Range requests.  See https://github.com/igvteam/igv.js/wiki/Data-Server-Requirements  for more details.  


## License
IGV Web App is [MIT](/LICENSE) licensed.

