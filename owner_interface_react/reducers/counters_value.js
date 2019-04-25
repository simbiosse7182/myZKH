const initialState = {
    loading: true,
    loadingSpps:true,
    room_info: {}
}
const CountersValueReducer = (state = initialState, action) => {
    switch (action.type) {

        case "START_REQUESTS": {
            return {...state, loading: true}
        }

        case "END_REQUESTS": {
            return {...state, loading: false}
        }

        case "SET_ROOMS": {
            const room = action.payload
            return {...state, room}
        }

        case "SET_COUNTERS": {
            const counters = {}
            Object.keys(action.payload).map(key => {
                if (action.payload[key].room_id === JSON.parse(window.localStorage.getItem('activeRoom')).room_id) {
                    counters[action.payload[key].counter_id] = action.payload[key]
                }
            })

            return {...state, counters}
        }

        case "SET_COUNTERS_SPPS": {
            const counters_spps = {}
            if (Array.isArray(action.payload)) {
                action.payload.map(el => {
                    if (el.name == "Электроэнергия") counters_spps[el.service_id] = el
                })
            }


            return {...state, counters_spps,loadingSpps:false}
        }

        case "SET_COUNTER_MODELS": {
            const counter_models = {}
            action.payload.map(el => {
                counter_models[el.counter_model_id] = el
            })
            return {...state, counter_models}
        }

        case "SET_SERVICES": {
            const services = {}
            const counters = state.counters
            Object.keys(counters).map(key => {
                if (Object.keys(action.payload).indexOf(counters[key].service_id.toString()) !== -1) {
                    services[counters[key].service_id] = action.payload[counters[key].service_id]
                }
            })

            return {...state, services}
        }

        case "SET_SERVICE_TYPES": {
            const service_types = {}
            action.payload.map((el, index) => {

                service_types[action.payload[index].service_type_id] = el
            })
            return {...state, service_types}
        }

        case "SET_SERVICE_VALUES": {
            let service_values = {}
            let counters_id = Object.keys(state.counters)
            action.payload.map(el => {
                if (service_values[el.counter_id] === undefined) service_values[el.counter_id] = {}
                service_values[el.counter_id][el.service_value_id] = el
                })
            return {...state, service_values}
        }

        case "CHECK_SERVICE_VALUES": {
            const services = {...state.services}
            const service_value = action.payload
            let service_values = {...state.service_values}
            const counter_id = service_value.counter_id
            delete service_values[counter_id][Object.keys( service_values[counter_id]).slice(-1)]
            service_values[counter_id][service_value.service_value_id] = action.payload
            return {...state, service_values, services}
        }

        case "SET_ROOM_INFO": {
            return {...state, room_info: action.room[0] || {} }
        }

        default: {
            return state
        }
    }
}

export default CountersValueReducer
