
const encodeTrackDatasourceSignalConfigurator = genomeId => {

    return {
        isJSON: false,
        genomeId,
        suffix: '.signals.txt',
        dataSetPathPrefix: 'https://www.encodeproject.org',
        urlPrefix: 'https://s3.amazonaws.com/igv.org.app/encode/',
        dataSetPath: undefined,
        addIndexColumn: false,
        columns:
            [
                'ID',           // hide
                'Assembly',     // hide
                'Biosample',
                'AssayType',
                'Target',
                'BioRep',
                'TechRep',
                'OutputType',
                'Format',
                'Lab',
                'HREF',         // hide
                'Accession',
                'Experiment'
            ],
        titles:
            {
                AssayType: 'Assay Type',
                OutputType: 'Output Type',
                BioRep: 'Bio Rep',
                TechRep: 'Tech Rep'
            },
        hiddenColumns:
            [
                'ID',
                'Assembly',
                'HREF'
            ],
        parser: undefined,
        selectionHandler: selectionList => {
            return selectionList.map(({ name, HREF }) => {
                return { name, url: HREF }
            })
        }

    }

}

export { encodeTrackDatasourceSignalConfigurator }
