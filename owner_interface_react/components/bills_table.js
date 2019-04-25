import React from 'react'
import BillsTableRow from "./bills_table_row"


const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
export default class billTable extends React.Component {
    state = {
        opened: {}
    }

    render() {

        const toggleOpened = () => this.setState({opened: !this.state.opened})

        let openMonth = month => {
            let opened = {...this.state.opened}
            opened[ month ] = !opened[ month ]
            Object.keys( opened )
                .filter( month_number => month_number !== month )
                .map( month_number => opened[month_number] = false )
            this.setState({ opened })
        }

        return (

            <tbody>
            <tr className={`nested ${this.state.opened ? "opened" : ""}`} onClick={() => toggleOpened()}>
                <td className="text-left">{this.props.year}</td>
                {
                    //<td className="text-right">{numberWithCommas((this.props.months.reduce((sum, month) => (sum + parseFloat(month.total_cost_supplier)), 0)).toFixed(2))}</td>
                    //<td className="text-right">{numberWithCommas((this.props.months.reduce((sum, month) => (sum + parseFloat(month.total_cost) - parseFloat(month.total_cost_supplier)), 0)).toFixed(2))}</td>
                }
                <td className="text-right">{numberWithCommas((this.props.months.reduce((sum, month) => (sum + parseFloat(month.total_cost)), 0)).toFixed(2))}</td>

            </tr>
            <tr className="nest" style={this.state.opened ? {} : {display: "none"}}>
                <td colSpan="2">
                    <div>
                        <table className="nested-table hovered">
                            <colgroup>
                                <col width="68%"/>
                                <col width="10%"/>
                                <col width="10%" />
                                <col width="12%"/>
                            </colgroup>
                            <tbody>
                            {   this.props.months
                                .sort((a, b) => parseInt(a.monthNumeric) > parseInt(b.monthNumeric) ? 1 : -1)
                                .map(month =>   <BillsTableRow  setBillsFile={this.props.setBillsFile}
                                                                key={month.monthNumeric}
                                                                month={month}
                                                                openMonth={ () => openMonth( month.monthNumeric )}
                                                                opened={ this.state.opened[month.monthNumeric] }
                                                                />
                                )
                            }
                            <tr className="expand-less au-target">
                                <td colSpan="5">
                                    <button type="button" onClick={() => toggleOpened()} className="btn">Скрыть счета
                                        за <strong>{`${this.props.year} г.`}</strong></button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>

            </tbody>
        )
    }
}
