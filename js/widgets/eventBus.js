let subscribers = {}

class EventBus {
    constructor() {

    }

    subscribe(eventType, object) {

        let subscriberList = subscribers[eventType]
        if (undefined === subscriberList) {
            subscriberList = []
            subscribers[eventType] = subscriberList
        }
        subscriberList.push(object)
    }

    post(event) {

        const subscriberList = subscribers[event.type]
        if (subscriberList) {

            for (let subscriber of subscriberList) {

                if ("function" === typeof subscriber.receiveEvent) {
                    subscriber.receiveEvent(event)
                } else if ("function" === typeof subscriber) {
                    subscriber(event)
                }
            }
        }
    }

    static createEvent(type, data, propogate) {
        return {type: type, data: data || {}, propogate: propogate !== undefined ? propogate : true}
    }

}

// Global event bus
EventBus.globalBus = new EventBus()

export default EventBus
