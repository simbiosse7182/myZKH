import {fetchData} from "../fetchData"

const fetchRooms = () => {
    return fetchData(`rooms/${JSON.parse(window.localStorage.getItem('activeRoom')).room_id}`)
        .then(response => response.success && response.data || {})
}
const sendServiceValues = (counter_id, service_id, value) => {
    return fetchData("service-values", {
        method: "POST", data: {
            counter_id,
            service_id,
            value,
            work_id: null,
            is_fact: true
        }
    })
        .then(response => response.success && response.data || {})

}
const sendServiceSppsValues = (subscriber_id, item_id, counter_id, service_id, value) => {
    let data = []
    data.push({
        counter_id,
        item_id,
        service_id,
        subscriber_id,
        value
    })
    return fetchData(`counters-spps`, {
        method: "PUT", data: data

    }, true)
        .then(response => response.success && response.data || {})

}
const fetchCounters = () => {
    return fetchData("counters", { params: { archive: 'true' } } )
        .then(response => response.success && response.data || {})
}
const fetchCountersSpps = () => {
    return fetchData(`counters-spps/${JSON.parse(window.localStorage.getItem('activeRoom')).room_id}`, { params: { archive: 'true' } } )
        .then(response => response.success && response.data || {})
}
const fetchCounterModels = () => {
    return fetchData("counter-models", { params: { archive: 'true' } } )
        .then(response => response.success && response.data || {});
}
const fetchServices = () => {
    return fetchData("services")
        .then(response => response.success && response.data || {});
}
const fetchServiceTypes = () => {
    return fetchData("service-types")
        .then(response => response.success && response.data || {});
}

const fetchServiceValues = () => {
    return fetchData("service-values", {
        params: {
            last: "",
            roomId: JSON.parse(window.localStorage.getItem('activeRoom')).room_id
        }
    })

        .then(response => response.success && response.data || {});
}
const fetchRoomInfo = () => {
    return fetchData("rooms")
        .then(response => response.success && response.data || {});
}
export {
    fetchServices,
    fetchRooms,
    fetchCounters,
    fetchCounterModels,
    fetchServiceTypes,
    fetchServiceValues,
    sendServiceValues,
    fetchCountersSpps,
    fetchRoomInfo,
    sendServiceSppsValues
}
