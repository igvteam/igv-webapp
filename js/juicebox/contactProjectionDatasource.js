
class ContactProjectionDatasource {

    constructor(config) {
        this.getFeaturesHelper = config.getFeaturesHelper
    }

    async getFeatures({chr, start, end}) {
        const features = await this.getFeaturesHelper({chr, start, end})
        return features
    }
}

export default ContactProjectionDatasource
