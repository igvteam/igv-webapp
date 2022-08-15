const configuration =
    {
        isJSON: true,
        columns:
            [
                // 'url',
                // 'NVI',
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
        parser: {parse: aidenLabParser} //(str) => Object.entries(JSON.parse(str))}
    }

const aidenLabContactMapDatasourceConfigurator = url => {
    return {url, ...configuration}
}

function aidenLabParser(str) {

    const results = Object.entries(JSON.parse(str)).map(([url, obj]) => {

        obj['url'] = obj['NVI'] ? `${url}?nvi=${obj['NVI']}` : url;

        // Ensure that all visible columns have a value
        for (let key of configuration.columns) {
            obj[key] = obj[key] || '-'
        }

        return obj
    })

    return results

}

export {aidenLabContactMapDatasourceConfigurator}
