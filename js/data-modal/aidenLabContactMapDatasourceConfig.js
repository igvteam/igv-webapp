
const aidenLabContactMapDatasourceConfigurator = genomeId => {

    return {
        isJSON: true,
        genomeId,
        dataSetPathPrefix: undefined,
        urlPrefix: undefined,
        dataSetPath: 'https://aidenlab.org/juicebox/res/hicfiles.json',
        addIndexColumn: true,
        columns:
            [
                'index',
                'url',
                'NVI',
                'name',
                'author',
                'journal',
                'year',
                'organism',
                'reference genome',
                'cell type',
                'experiment type',
                'protocol'
            ],
        hiddenColumns:
            [
                'index',
                'NVI',
                'url'
            ],
        parser,
        selectionHandler: undefined
    }

}

const parser = (obj, columnDictionary, addIndexColumn) => {

    return Object.entries(obj).map(([ path, record ], i) => {

        const cooked = {};
        Object.assign(cooked, record);

        for (let key of Object.keys(columnDictionary)) {
            cooked[ key ] = cooked[ key ] || '-';
        }

        const output = {};
        Object.assign(output, cooked);

        output['url'] = '-' === cooked[ 'NVI' ] ? `${ path }` : `${ path }?nvi=${ cooked[ 'NVI' ] }`;

        if (true === addIndexColumn) {
            output['index'] = i;
        }

        return output;
    });

};

export { aidenLabContactMapDatasourceConfigurator }
