import {fetchData} from "../fetchData"
import fetch from "cross-fetch"

const fetchRooms = () => {
    return fetchData(`rooms/${JSON.parse(window.localStorage.getItem('activeRoom')).room_id}`)
        .then(response => response.success && response.data || {})
}

const fetchPrintBills = (month, excel) => {
    let data = {
        account_id: `${JSON.parse(window.localStorage.getItem('activeRoom')).account_id}`,
        calculation_id: month.calculation_id
    }
    return fetch((excel ? '/api/forms/epd/epd4/?format_doc=xls' : '/api/forms/epd/epd3/'), {
        headers: {
            "Authorization": `Bearer ${window.localStorage.getItem("aurelia_token")} `,
            "Accept": "application/json", // old firefox fix :-)
            "Content-Type": "application/json"
        },
        method: 'post',
        body: JSON.stringify(data),
    })
        .then(response =>response.json())


}


const fetchBills = () => {
    return fetchData("bills", {params: {fields: "total_cost,total_cost_supplier,entries,service_id"}})
        .then(response => response.success && response.data || {})
}

const fetchCalculations = () => {
    return fetchData(`calculations`)
        .then(response => response.success && response.data || {})
}

const fetchServices = () => {
    return fetchData("services")
        .then(response => response.success && response.data || {})
}

const fetchServiceTypes = () => {
    return fetchData("service-types")
        .then(response => response.success && response.data || {})
}

const fetchBillEntryTypes = () => {
    return fetchData("bill-entry-types")
        .then(response => response.success && response.data || {})
}

const fetchBalances = () => {
    return fetchData("balances")
        .then(response => response.success && response.data || {})
}

export {
    fetchRooms,
    fetchCalculations,
    fetchBills,
    fetchPrintBills,
    fetchServiceTypes,
    fetchServices,
    fetchBillEntryTypes,
    fetchBalances
}
