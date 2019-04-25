import React from "react"
import {connect} from "react-redux";
import {ResourceData, ResourceDataSpps, ResourceDataArchiveItem} from "../components/resource_data"
import {
    fetchCounterModels,
    fetchCounters,
    fetchCountersSpps,
    fetchRooms,
    fetchServices,
    fetchServiceTypes,
    fetchServiceValues,
    fetchRoomInfo,
    sendServiceSppsValues,
    sendServiceValues
} from "../actions/counters_value/fetch";


const mapStateToProps = state => ({
    loading: state.loading,
    loadingSpps: state.loadingSpps,
    counters: state.counters,
    counters_spps: state.counters_spps,
    counter_models: state.counter_models,
    services: state.services,
    service_types: state.service_types,
    service_values: state.service_values,
    room_info:      state.room_info,

})
const counterZones = {
    0: 'однозонный',
    2: 'двухзонный',
    3: 'трехзонный'
}
const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
};
/*
  <div className="panel-group">
                    {
                     Object.keys(this.props.services).map(key=><div>{this.props.service_types[this.props.services[key].service_type_id].name}</div>)
                    }
                </div>
 */
const mapDispatchToProps = dispatch => {
    return {
        startRequests: () => {
            dispatch({type: "START_REQUESTS"})
        },
        endRequests: () => {
            dispatch({type: "END_REQUESTS"})
        },


        setRoom: room => dispatch({type: "SET_ROOMS", payload: room}),
        setCounters: counters => dispatch({type: "SET_COUNTERS", payload: counters}),
        setCountersSpps: counters => dispatch({type: "SET_COUNTERS_SPPS", payload: counters}),
        setCounterModels: counterModels => dispatch({type: "SET_COUNTER_MODELS", payload: counterModels}),
        setServices: services => dispatch({type: "SET_SERVICES", payload: services}),
        setServiceTypes: serviceTypes => dispatch({type: "SET_SERVICE_TYPES", payload: serviceTypes}),
        setServiceValues: serviceValues => dispatch({type: "SET_SERVICE_VALUES", payload: serviceValues}),
        checkServiceValues: serviceValue => dispatch({type: "CHECK_SERVICE_VALUES", payload: serviceValue}),
        setRoomInfo: room => dispatch({type: "SET_ROOM_INFO", room }),
    }
}

class CountersValue extends React.Component {
    componentWillMount() {
        //this.props.fetchRooms()
        //let chain = ;

        Promise.resolve()
                .then(() => this.props.startRequests())
            .then(() => fetchRooms())
                .then(room => this.props.setRoom(room))
            .then(() => fetchCounters())
                .then(counters => this.props.setCounters(counters))
            .then(() => fetchCounterModels())
                .then(counterModels => this.props.setCounterModels(counterModels))
            .then(() => fetchServices())
                .then(services => this.props.setServices(services))
            .then(() => fetchServiceTypes())
                .then(serviceTypes => this.props.setServiceTypes(serviceTypes))
            .then(() => fetchServiceValues())
                .then(serviceValues => this.props.setServiceValues(serviceValues))
            .then(() => fetchRoomInfo())
                .then(roomInfo => this.props.setRoomInfo(roomInfo))
            .then(() => this.props.endRequests())
            .then(() => fetchCountersSpps())
                .then(counters => this.props.setCountersSpps(counters))
    }

    render() {
        if (this.props.loading) {
            return <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg className="spinner"
                     width="65px"
                     height="65px"
                     viewBox="0 0 66 66"
                     xmlns="http://www.w3.org/2000/svg">
                    <circle className="path"
                            fill="none"
                            strokeWidth="6"
                            strokeLinecap="round" cx="33" cy="33"
                            r="30"/>
                </svg>
            </div>
        }
        if (!this.props.loading) {
            const services = this.props.services
            const counters = this.props.counters
            const service_types = this.props.service_types
            const counter_models = this.props.counter_models
            const service_values = this.props.service_values
            const counters_spps = this.props.counters_spps
            return (
                <div>
                    <div style={{ marginBottom: '20px'}}>
                        <h2 className="page-heading">Ввод показаний приборов учета</h2>
                        <div className="panel-group">
                            {
                                Object.keys(services).map(service_id => {
                                    let numberOfCounters = 0
                                    let numberOfTab = 0
                                    let numberOfTabPane = 0
                                    return  <div className="panel panel-default" key={service_id} style={{ marginBottom: '20px' }}>
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">{service_types[services[service_id].service_type_id].name}</h4>
                                                </div>
                                                {/*
                                                    <div className="panel-body">
                                                        <h5 className="heading">Ввести показания прибора учета</h5>
                                                    </div>
                                                    */
                                                }

                                                {
                                                    Object.keys(counters)
                                                    .filter( counter => !counters[counter].deleted || !Date.parse( counters[counter].deleted ) || +Date.parse( counters[counter].deleted ) > +Date.now() )
                                                    .map(counter => {
                                                        if (counters[counter].service_id == service_id) {

                                                            let lastInputValue = service_values[counter][Object.keys(service_values[counter]).slice(-1)].value
                                                            let lastInputDate = service_values[counter][Object.keys(service_values[counter]).slice(-1)].created;

                                                            numberOfCounters++;
                                                            return (

                                                                <ResourceData       service_values={service_values[counter]}
                                                                                    key={counter}
                                                                                    model={counter_models[counters[counter].counter_model_id].name}
                                                                                    counter={counters[counter]}
                                                                                    lastInputValue={lastInputValue}
                                                                                    lastInputDate={lastInputDate.toLocaleString("ru-Ru", {
                                                                                        year: 'numeric',
                                                                                        month: 'numeric',
                                                                                        day: 'numeric'
                                                                                    })}
                                                                                    counterId={counters[counter].counter_id}
                                                                                    serviceId={counters[counter].service_id}
                                                                                    sendServiceValues={sendServiceValues}
                                                                                    checkServiceValues={this.props.checkServiceValues}
                                                                                    units={service_types[services[service_id].service_type_id].units}
                                                                                    room={this.props.room_info}
                                                                                    />

                                                            )
                                                        }
                                                    })
                                                }
                                                {
                                                    Object.keys(counters)
                                                        .filter( counter => counters[counter].deleted && Date.parse( counters[counter].deleted ) && +Date.parse( counters[counter].deleted ) <= +Date.now() )
                                                        .map(counter => {
                                                            if (counters[counter].service_id == service_id) {

                                                                let lastInputValue = service_values[counter][Object.keys(service_values[counter]).slice(-1)].value
                                                                let lastInputDate = service_values[counter][Object.keys(service_values[counter]).slice(-1)].created;

                                                                numberOfCounters++;
                                                                return (
                                                                    <ResourceDataArchiveItem   service_values={service_values[counter]}
                                                                                    key={counter}
                                                                                    model={counter_models[counters[counter].counter_model_id].name}
                                                                                    counter={counters[counter]}
                                                                                    lastInputValue={lastInputValue}
                                                                                    lastInputDate={lastInputDate.toLocaleString("ru-Ru", {
                                                                                        year: 'numeric',
                                                                                        month: 'numeric',
                                                                                        day: 'numeric'
                                                                                    })}
                                                                                    counterId={counters[counter].counter_id}
                                                                                    serviceId={counters[counter].service_id}
                                                                                    sendServiceValues={sendServiceValues}
                                                                                    checkServiceValues={this.props.checkServiceValues}
                                                                                    units={service_types[services[service_id].service_type_id].units}
                                                                    />
                                                                )
                                                            }
                                                        })
                                                }
                                         </div>
                                })
                            }

                        </div>

                    </div>
                    <h2 className="page-heading">Показания ИПУ по прямым договорам с поставщиками ресурсов:</h2>
                    <div className="alert alert-info virtual-counters-alert">
                        <div className="alert-content">
                            По вопросам показаний ИПУ по услугам поставщиков необходимо обращаться
                            непосредственно к поставщикам
                        </div>
                    </div>
                    {this.props.loadingSpps ?
                        <div className="center-block text-muted pay-line-loading">
                            <span className="loader-spinner pull-left"/>
                            <span>Загружаем данные от ресурсоснабжающих организаций</span>
                        </div> :
                        <div>

                            <div className="panel-group">
                                {
                                    Object.keys(counters_spps).map(key => {
                                        return (
                                            <div className="panel panel-default" key={key} style={{ marginBottom: '20px' }}>
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">{counters_spps[key].name}</h4>
                                                </div>
                                                {
                                                    counters_spps[key].accounts.map(el => {
                                                        return (
                                                            <div key={el.account}>
                                                                <div className="panel-body">
                                                                    <h5 className="heading">Ввести показания прибора учета по Л/C № {el.account}</h5>
                                                                </div>
                                                                {el.items.map(item => {

                                                                    let lastInputValue = item.values.slice(-1)[0].value

                                                                    return (
                                                                        <ResourceDataSpps   key={item.counter_id}
                                                                                            label={`Серийный номер неизвестен`}
                                                                                            lastInputValue={lastInputValue}
                                                                                            counterId={item.counter_id}
                                                                                            serviceId={item.service_id}
                                                                                            itemId={item.item_id}
                                                                                            subscriberId={item.subscriber_id}
                                                                                            sendServiceValues={sendServiceSppsValues}
                                                                                            checkServiceValues={() => {
                                                                                            }}
                                                                                            units={"кВт/ч"}
                                                                                            />
                                                                    )
                                                                })}
                                                            </div>
                                                        )
                                                    })
                                                }

                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>

                    }
                </div>
            )
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CountersValue);
