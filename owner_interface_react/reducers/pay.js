const initialState = {
    loading: true,
    loading_spps_debt: true,
    totalPay: {uk: 0, spps: 0},
    screen: 1,
    confirmRules: false,

}

const PayReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GENERATE_PAYMENTS": {

        }
        case "CONFIRM_RULES": {
            return {...state, confirmRules: action.payload}
        }
        case "START_PAY": {
            const balances = state.balances
            const spps_debt = state.spps_debt
            const forTable = {}

            const forPay = {
                source_type: 1,
                account_id: JSON.parse(window.localStorage.getItem("activeRoom")).account_id,
                payments: []
            }
            if (Object.keys(balances).some(key => balances[key].checked)) {
                forTable.uk = {}
                forTable.uk.name = state.room.company.name
                forTable.uk.account_number = state.account.number
                forTable.uk.services = []
                forTable.uk.pay = 0
            }

            Object.keys(balances).map(key => {
                const balance = balances[key]
                if (balance.checked) {
                    forTable.uk.services.push(balance.service_type_name)
                    forTable.uk.pay += +balance.pay
                    forPay.payments.push({
                        service_id: balance.service_id,
                        bill_entry_type_id: balance.bill_entry_type_id,
                        amount: balance.pay,
                        service_component_id: balance.service_component_id,
                        subscriber_id: typeof(balance.subscriber_id) === undefined ? null : balance.subscriber_id,
                        supplier_inn: typeof (balance.supplier_id) === undefined ? null : balance.supplier_id

                    })
                }
            })
            Object.keys(spps_debt).map(key => {
                const spps = spps_debt[key]
                if (spps.services.some(service => service.checked)) {
                    forTable[key] = {
                        name: spps.name,
                        account_number: spps.services[0].account_number,
                        pay: 0,
                        services: []
                    }
                }
                spps.services.map(service => {
                    if (service.checked) {
                        forTable[key].services.push(service.name)
                        forTable[key].pay += +service.pay
                        forPay.payments.push({
                            service_id: service.service_id,
                            bill_entry_type_id: service.bill_entry_type_id,
                            amount: service.pay,
                            service_component_id: service.service_component_id,
                            subscriber_id: typeof (service.subscriber_id) === undefined ? null : service.subscriber_id,
                            supplier_inn: typeof(service.supplier_id) === undefined ? null : service.supplier_id
                        })
                    }
                })
            })

            const screen = 2
            return {...state, forPay, forTable, screen}
        }
        case "CHANGE_SCREEN": {
            const screen = action.payload
            return {...state, screen}
        }
        case "START_REQUESTS": {
            return {...state, loading: true}
        }
        case "SET_ROOM": {
            const room = action.payload
            return {...state, room}
        }
        case "SET_ACCOUNT": {
            const account = action.payload
            return {...state, account}
        }
        case "SET_SERVICES": {
            const services = action.payload
            return {...state, services}
        }
        case "SET_SERVICE_TYPES": {
            let service_types = {}
            action.payload.map(service_type => {
                service_types[service_type.service_type_id] = service_type
            })
            return {...state, service_types}
        }
        case "SET_BALANCES": {
            const services = state.services
            const service_types = state.service_types
            const bill_entry_types = state.bill_entry_types
            let balances = {}
            let total_debt = 0
            action.payload.map(balance => {

                //у балансов должен отсутствовать поставщик, тогда это УК, услуга не должна быть закртой или, если она закрыта, у нее должен быть долг
                if (balance.supplier_id === null && (services[balance.service_component_id].end_date == null || services[balance.service_component_id].end_date != null && balance.amount != 0)) {
                    const bill_entry_type_name = bill_entry_types[balance.bill_entry_type_id].name
                    const service_type_name = service_types[services[balance.service_component_id].service_type_id].name
                    total_debt += (-1) * (+balance.amount)
                    balances[balance.balance_id] = {
                        ...balance,
                        pay: +balance.amount === 0 ? 0 : (-1) * (+balance.amount),
                        commission: +balance.amount === 0 ? 0 : (Math.ceil(((-1) * +balance.amount) * 0.015 * 100) / 100),
                        checked: false,
                        bill_entry_type_name,
                        service_type_name,

                    }

                }
                return balance
            })
            balances

            total_debt = total_debt.toFixed(2)
            return {...state, balances, total_debt}
        }
        case "SET_BILL_ENTRY_TYPES": {
            let bill_entry_types = {}
            action.payload.map(el => {
                bill_entry_types[el.bill_entry_type_id] = el
            })
            return {...state, bill_entry_types}
        }
        case "SET_SPPS_DEBT": {
            const spps_debt = {}
            if (Array.isArray(action.payload)) {
                action.payload.map((el) => {
                    spps_debt[el.supplier_id] = el
                })
            }
            else console.log("err")
            const loading_spps_debt = false
            return {...state, spps_debt, loading_spps_debt}
        }
        case "SET_COMPANY_SETTINGS": {
            let company_settings = {}
            action.payload.map(el => {
                company_settings[el.name] = el.value
            })
            return {...state, company_settings}
        }
        case "END_REQUESTS": {
            return {...state, loading: false}
        }
        case "CHANGE_PAY": {
            const settings =  {...state.company_settings}
            let totalPay = {...state.totalPay}
            let uk_pay = 0
            let balances = {...state.balances};
            let val = action.value.replace(',','.').replace(/[^0-9\.]/ig,'')
            balances[action.key].pay = val;
            val!==""?(+val>0?balances[action.key].checked=true:null):null
            if(settings["commission"]==="true"){ balances[action.key].commission = Math.ceil(+val * 0.015 * 100) / 100}
            Object.keys(balances).map(key => {
                if (balances[key].checked) {
                    uk_pay += +balances[key].pay
                    if (+balances[key].commission > 0) uk_pay += +balances[key].commission
                }
            })
            totalPay.uk = uk_pay.toFixed(2)
            return {...state, balances: balances, totalPay};
        }
        case "CHANGE_CHECK": {
            const settings =  {...state.company_settings}
            let balances = {...state.balances}
            let totalPay = {...state.totalPay}
            let uk_pay = 0
            if (action.value) {
                if (balances[action.key].pay > 0) {
                    balances[action.key].checked = action.value
                }
            }
            else {
                balances[action.key].checked = action.value
            }
            Object.keys(balances).map(key => {
                if (balances[key].checked) {
                    uk_pay += +balances[key].pay
                    if ((settings["commission"]==="true")&&(+balances[key].commission > 0)) uk_pay += +balances[key].commission
                }
            })
            uk_pay = Math.ceil(+uk_pay * 100) / 100
            totalPay.uk = uk_pay.toFixed(2)
            return {...state, balances, totalPay}

        }


        case "CHANGE_SPPS_PAY": {

            let totalPay = {...state.totalPay}
            let spps_pay = 0
            let spps_debt = {...state.spps_debt};
            let val = action.value.replace(',','.').replace(/[^0-9\.]/ig,'')
            spps_debt[action.key].services[action.index].pay =val;
            Object.keys(spps_debt).map(key => spps_debt[key].services.map(service => {
                    if (service.checked) {
                        spps_pay += +service.pay
                    }
                })
            )
            totalPay.spps = spps_pay.toFixed(2)
            return {...state, spps_debt: spps_debt, totalPay};
        }
        case "CHANGE_SPPS_CHECK": {
            let totalPay = {...state.totalPay}
            let spps_debt = {...state.spps_debt};
            let spps_pay = 0
            let service = spps_debt[action.key].services[action.index]
            if (action.value) {
                if (service.pay > 0) {
                    if (service.allowOverpayment || !service.allowOverpayment && service.pay <= service.debt)
                        service.checked = action.value

                }
            }
            else {
                service.checked = action.value
            }
            Object.keys(spps_debt).map(key => spps_debt[key].services.map(service => {
                    if (service.checked) {
                        spps_pay += +service.pay
                    }
                })
            )
            totalPay.spps = spps_pay.toFixed(2)
            return {...state, spps_debt, totalPay}

        }
        default : {
            return state
        }
    }
}
export default PayReducer
