import React from "react"
import BillsTable from "../components/bills_table"
import {connect} from "react-redux"
import {    fetchBills,
            fetchCalculations,
            fetchServices,
            fetchServiceTypes,
            fetchBillEntryTypes,
            fetchBalances,
        } from "../actions/bills/fetch"

const mapDispatchToProps = dispatch => {
    return {
        startRequests: () => {
            dispatch({type: "START_REQUESTS"})
        },
        endRequests: () => {
            dispatch({type: "END_REQUESTS"})
        },

        setBillsFile: (month, blob, excel) => dispatch({
            type: "SET_BILLS_FILE",
            payload: blob,
            month: month,
            excel: excel
        }),
        setBills: bills => dispatch({type: "SET_BILLS", payload: bills}),
        setCalculations: calculation => dispatch({type: "SET_CALCULATIONS", payload: calculation}),
        setServices: services => dispatch({type: "SET_SERVICES", services}),
        setServiceTypes: service_types => dispatch({type: "SET_SERVICE_TYPES", service_types}),
        setBillEntryTypes: bill_entry_types => dispatch({type: "SET_BILL_ENTRY_TYPES", bill_entry_types}),
        setBalances: balances => dispatch({type: "SET_BALANCES", balances}),
    }
}
const mapStateToProps = state => ({
    loading: state.loading,
    periods: state.periods,
    bills:  state.bills,
    services:  state.services,
    service_types: state.service_types
})

export class Bills extends React.Component {
    componentWillMount() {
        let chain = Promise.resolve();
        chain
            .then(() => this.props.startRequests())
            .then(() => fetchBillEntryTypes())
                .then(bill_entry_types => this.props.setBillEntryTypes(bill_entry_types))
            .then(() => fetchServiceTypes())
                .then(service_types => this.props.setServiceTypes(service_types))
            .then(() => fetchServices())
                .then(services => this.props.setServices(services))
            .then(() => fetchBills())
                .then(bills => this.props.setBills(bills))
            .then(() => fetchCalculations())
                .then(calculations => this.props.setCalculations(calculations))
            .then(() => fetchBalances())
                .then(balances => this.props.setBalances(balances))
            .then(() => this.props.endRequests())

    }

    render() {
        if (!this.props.loading) return (<div>
                <h2 className="page-heading">Счета</h2>
                <table className="nested-table hovered">
                    <colgroup>
                        <col/>
                        <col width="12%" />
                    </colgroup>
                    <thead className="thead">
                        <tr>
                            <th>Период</th>
                            <th className="text-right">Начислено</th>
                        </tr>
                    </thead>

                    {Object.keys(this.props.periods).map(year => (
                        <BillsTable setBillsFile={this.props.setBillsFile}
                                    year={year}
                                    key={year}
                                    months={this.props.periods[year]}
                                    />
                    ))}

                </table>
            </div>
        )
        return (
            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
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
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Bills);
