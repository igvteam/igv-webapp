
const encodeContactMapDatasourceConfigurator = genomeId => {

    const urlPrefix = 'https://www.encodeproject.org';

    return {
        isJSON: false,
        genomeId,
        dataSetPathPrefix: undefined,
        urlPrefix,
        dataSetPath: 'https://s3.amazonaws.com/igv.org.app/encode/hic/hic.txt',
        addIndexColumn: true,
        columns:
            [
                'index',
                'HREF',
                'Assembly',
                'Biosample',
                'Description',
                'BioRep',
                'TechRep',
                'Lab',
                'Accession',
                'Experiment'
            ],
        hiddenColumns:
            [
                'index',
                'HREF'
            ],
        parser,
        selectionHandler: selectionList => {
            return selectionList.map(({ HREF, Description }) => {
                const url = `${ urlPrefix }${ HREF }`
                return { url, name: Description }
            })
        },
        // _selectionHandler: selectionList => {
        //     const selection = selectionList[ 0 ]
        //     const url = `${ urlPrefix }${ selection[ 'HREF' ] }`
        //     const name = selection[ 'Description' ]
        //     return { url, name }
        // }

    }

}

const parser = (str, columnDictionary, addIndexColumn) => {

    const lines = str.split('\n').filter(line => "" !== line);

    // Discard first line. Column name descriptions.
    lines.shift();

    const keys = Object.keys(columnDictionary);

    return lines.map((line, index) => {

        const values = line.split('\t');

        if (true === addIndexColumn) {
            values.unshift(index)
        }

        const obj = {};
        for (let key of keys) {
            obj[key] = values[ keys.indexOf(key) ]
        }

        return obj;
    });

};

export { encodeContactMapDatasourceConfigurator }
