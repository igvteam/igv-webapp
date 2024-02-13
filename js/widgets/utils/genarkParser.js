const genarkParser =
    {
        parse: string => {
            const lines = string.split('\n')
            const headerLines = lines.filter(line => line.startsWith('#'))

            // columns
            const columns = headerLines.pop().split('\t')
            const cooked = columns.shift().split('').filter(char => (/[a-zA-Z]/).test(char)).join('')
            columns.unshift(cooked)

            // records
            const records = lines.filter(line => !line.startsWith('#')).map(line => line.split(`\t`))

            return records
        }
    };

export { genarkParser }
