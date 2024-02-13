import { genarkColumns } from "./genarkDatasourceConfigurator.js"

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
                    record[ genarkColumns[ i ] ] = tokens[ i ]
                }

                records.push(record)
            }

            return records
        }
    };

export { genarkParser }
