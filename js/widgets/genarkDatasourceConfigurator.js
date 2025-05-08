// accession	assembly	scientific name	common name	taxonId	GenArk clade

const genarkColumns =
    [
        'accession',
        'assembly',
        'scientificName',
        'commonName',
        'taxonId',
        'genArkClade',

    ]

const genarkParser =
    {
        parse: string => {
            const lines = string.split('\n')

            // columns
            // const headerLines = lines.filter(line => line.startsWith('#'))
            // const columns = headerLines.pop().split('\t')
            // const cooked = columns.shift().split('').filter(char => (/[a-zA-Z]/).test(char)).join('')
            // columns.unshift(cooked)

            // records
            let dataLines = lines.filter(line => !line.startsWith('#')).map(line => line.split(`\t`))
            dataLines = dataLines.filter(tokens => 6 === tokens.length)

            const records = []
            for (const tokens of dataLines) {
                const record = {}
                for (let i = 0; i < tokens.length; i++) {
                    record[genarkColumns[i]] = tokens[i]
                }

                records.push(record)
            }

            return records
        }
    }


function genarkDatasourceConfigurator() {

    const url = 'https://hgdownload.soe.ucsc.edu/hubs/UCSC_GI.assemblyHubList.txt'

    return {
        isJSON: false,
        url,
        columns: genarkColumns,
        columnDefs:
            {
                accession: {title: 'Accession'},
                assembly: {title: 'Assembly'},
                scientificName: {title: 'Scientific Name'},
                commonName: {title: 'Common Name'},
                genArkClade: {title: 'GenArk clade'},
            },

        parser: genarkParser

    }
}

export {genarkDatasourceConfigurator}
