# IGV Web App

igv-webapp is a pure-client "genome browser" application based on [igv.js](https://github.com/igvteam/igv.js).  It is developed by the [Integrative Genomics Viewer (IGV)](https://igv.org) team. You can use our hosted app at https://igv.org/app, or follow the directions below to install your own.

## Requirements
- Node >= v8.11.4
- NPM >= v5.6.0

## Supported Browsers

igv-webapp and igv.js require a modern web browser with support for Javascript ECMAScript 2015. We test on the latest versions of Chrome, Safari, Firefox, and Edge. Internet Explorer (IE) is not supported.

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
## Run the app
````
npm start
````
* Open a browser and enter the follow url to run the app
````
localhost:8080
````

## Configuration

NOTE: Your must rebuild the dist directory after making any to configuration files in <root>/resources.  Alternatively 
you can manually copy the changed files to dist/resources,  or just edit dist/resources directly.

```bash
npm run build
```



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
The property **apiKey** is optional. Setting a value will enable access to public Google resources.
See [Google Support](https://support.google.com/googleapi/answer/6158862?hl=en) for instructions
on obtaining an API key.  

* clientId - a Google clientId, used to enable OAuth for the Google picker and access to protected
Google resources.  See [Google Support](https://developers.google.com/identity/sign-in/web/sign-in) for
instructions on obtaining a clienId.  OAuth requests from igv.js will include the following scopes.

```
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/genomics',
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.readonly'
   ```     
* urlShortener - an object or function defining a URL shortener to shorten links created by the **Share** button.   This is optional, if not provided the links are not shortened, and the "Twitter" option is disabled.  The value of this property can be a function, taking a single argument (the long URL) and returning the shortened url, or an Object. Objects define a provider and an apiKey to be used with the provider service.  Currently 2 providers are recognized,  __bitly__ and __google__.  

### Default configuration

```javascript


var igvwebConfig = {

    genomes: "https://s3.dualstack.us-east-1.amazonaws.com/igv.org.genomes/genomes.json",

    trackRegistryFile: "resources/tracks/trackRegistry.json",

    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "hg19",
            apiKey: "API_KEY"
        },

    clientId: "CLIENT_ID",

    urlShortener: {
        provider: "bitly",
        apiKey: "BITLY_TOKEN"
    }

    // urlShortener: {
    //     provider: "google",
    //     apiKey: "API_KEY"
    // }

}
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

## License
IGV Web App is [MIT](/LICENSE) licensed.

