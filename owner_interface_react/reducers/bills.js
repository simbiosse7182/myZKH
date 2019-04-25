import {b64toBlob} from "../../core";

const initialState = {
    loading: true,
    loadingSpps: true,
    monthsMap: [
        "",
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь"
    ]
}
const BillsReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_BILLS_FILE": {
            const data = action.payload.data
            const excel = action.excel
            let b64Data = ((Array.isArray(data) ? data[0] : typeof data === "string" ? data : '') || '').substr(excel ? 78 : 28),
                blob = b64toBlob(b64Data, (excel ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf")),
                blobUrl = window.URL.createObjectURL(blob);



            let save =  ()=> {
                console.log("1")
                window.open(blobUrl, '_blank');

            }
            save()
            return {...state}
        }
        case "START_REQUESTS": {
            return {...state, loading: true}
        }
        case "END_REQUESTS": {
            return {...state, loading: false}
        }
        case "SET_CALCULATIONS": {
            const monthMap = state.monthsMap
            const bills = {...state.bills}
            let periods = {}
            let year
            let monthNumeric
            let calculations = {}
            action.payload.map(calculation => {
                if (Object.keys(bills).some(key => bills[key].calculation_id === calculation.calculation_id)) {
                    calculations[calculation.calculation_id] = calculation

                    year = "20" + calculation.period.toString().substr(0, 2)
                    monthNumeric = calculation.period.toString().substr(2)
                    if (periods[year] === undefined) periods[year] = []
                    let month = {
                        monthNumeric,
                        monthLong: monthMap[parseInt(monthNumeric)],
                        total_cost: bills[calculation.calculation_id].total_cost,
                        total_cost_supplier: bills[calculation.calculation_id].total_cost_supplier,
                        calculation_id: calculation.calculation_id,
                        load_excel: false,
                        load_pdf: false,
                        entries: bills[calculation.calculation_id].entries,
                    }
                    periods[year].push(month)
                }
            })
            return {...state, calculations, periods}
        }

        case "SET_BILL_ENTRY_TYPES": {
            const bill_entry_types = {}
            action.bill_entry_types.map( bill_entry_type => bill_entry_types[ bill_entry_type.bill_entry_type_id] = bill_entry_type )
            return {...state, bill_entry_types}
        }

        case "SET_BILLS": {
            const bills = {}
            action.payload.map(bill => {
                bills[bill.calculation_id] = {...bill}
                Object.keys( bills[bill.calculation_id].entries ).map( key => {
                    let entry = bills[bill.calculation_id].entries[key];

                    // Записываем имена сервисов строкам
                    // и поставщика
                    if(entry.service_id && state.services[entry.service_id] && state.services[entry.service_id].name ){
                        entry.name = state.services[entry.service_id].name;
                        entry.supplier_id = state.services[entry.service_id].supplier_id;
                    }

                    // Записываем тип (0 - периодич, 1- разовая, 2-ресурс)
                    if(entry.service_id
                        && state.services[entry.service_id]
                        && state.services[entry.service_id].service_type_id
                        && state.service_types[state.services[entry.service_id].service_type_id]){
                            entry.service_type = state.service_types[state.services[entry.service_id].service_type_id].type;
                    }

                    // Записываем bill_entry_type
                    if(entry.bill_entry_type_id
                        && state.bill_entry_types[entry.bill_entry_type_id]){
                        entry.bill_entry_type_name = (+entry.bill_entry_type_id === 1) ? 'инд. потр.' : state.bill_entry_types[entry.bill_entry_type_id].name;
                    }


                })
            })
            return {...state, bills}
        }

        case 'SET_SERVICE_TYPES': {
            let service_types = {...state.service_types},
                fetched_service_types = action.service_types || {};

            Object.keys(fetched_service_types).map( service_type_id => {
                let service_type = fetched_service_types[service_type_id];

                service_types[service_type.service_type_id] = {...fetched_service_types[service_type_id]}
            })

            return {...state, service_types}
        }

        case 'SET_SERVICES': {
            let services = {...state.services},
                service_types = {...state.service_types},
                fetched_services = action.services || {};

            Object.keys(fetched_services).map( service_id => {
                services[service_id] = {...fetched_services[service_id]}
                if(service_types[fetched_services[service_id].service_type_id]){
                    services[service_id].name = service_types[fetched_services[service_id].service_type_id].name;
                }
            })

            return {...state, services}
        }

        case 'SET_BALANCES': {
            console.log('BALANCES', action.balances);
            return {...state}
            let services = {...state.services},
                service_types = {...state.service_types},
                fetched_services = action.services || {};

            Object.keys(fetched_services).map( service_id => {
                services[service_id] = {...fetched_services[service_id]}
                if(service_types[fetched_services[service_id].service_type_id]){
                    services[service_id].name = service_types[fetched_services[service_id].service_type_id].name;
                }
            })

            return {...state, services}
        }

        default: {
            return state
        }
    }
}

export default BillsReducer
