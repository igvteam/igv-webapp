
const GtexUtils = {

    trackConfiguration: function (tissueSummary, baseURL) {
        baseURL = baseURL || 'https://gtexportal.org/rest/v1'
        return {
            type: "eqtl",
            sourceType: "gtex-ws",
            url: baseURL + '/association/singleTissueEqtlByLocation',
            tissueSiteDetailId: tissueSummary.tissueSiteDetailId,
            name: (tissueSummary.tissueSiteDetailId.split('_').join(' ')),
            visibilityWindow: 250000
        }
    }
}

export default GtexUtils
