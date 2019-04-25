import {fetchData} from "../fetchData";

const fetchAccount = () => {
    return fetchData(`accounts/${JSON.parse(window.localStorage.getItem('activeRoom')).account_id}`)
        .then(response => response.success && response.data || {})
}
const fetchRooms = () => {
    return fetchData(`rooms/${JSON.parse(window.localStorage.getItem('activeRoom')).room_id}`)
        .then(response => response.success && response.data || {})
}
const generatePayments=(payments)=>{
    return fetchData('payments',{
        method:"POST",data:payments
    })

}
const fetchServices = () => {
    return fetchData("services/?archive=1")
        .then(response => response.success && response.data || {});
}
const fetchBalances = () => {
    return fetchData(`balances/${JSON.parse(window.localStorage.getItem('activeRoom')).account_id}`)
        .then(response => response.success && response.data || {});
}
const fetchSppsDebt = () => {
    return fetchData(`counters-spps/debt/${JSON.parse(window.localStorage.getItem('activeRoom')).room_id}`)
        .then(response => response.success && response.data || {});
}
const fetchSuppliers = () => {
    return fetchData("suppliers")
        .then(response => response.success && response.data || {});
}
const fetchBillEntryTypes = () => {
    return fetchData("bill-entry-types")
        .then(response => response.success && response.data || {});
}
const fetchServiceTypes = () => {
    return fetchData("service-types")
        .then(response => response.success && response.data || {});
}
const fetchCompanySettings = () => {
    return fetchData("company-settings")
        .then(response => response.success && response.data || {})

}

export {
    fetchServices,
    fetchBalances,
    fetchSuppliers,
    fetchServiceTypes,
    fetchCompanySettings,
    fetchBillEntryTypes,
    fetchRooms,
    fetchAccount,
    fetchSppsDebt,
    generatePayments
}
