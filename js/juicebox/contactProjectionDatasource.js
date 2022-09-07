
class ContactProjectionDatasource {

    constructor(getFeaturesHelper) {
        this.getFeaturesHelper = getFeaturesHelper
    }

    async getFeatures({chr, start, end}) {
        const features = await this.getFeaturesHelper({chr, start, end})
        return features
    }
}

export default ContactProjectionDatasource
