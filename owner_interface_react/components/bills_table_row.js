import React from "react"
import {fetchPrintBills} from "../actions/bills/fetch";

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(',', '.');
}

export default class BillsTableRow extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            processing_pdf: false,
            processing_xls: false,
        }
    }
    render() {

        let exportPdf = () => {


            this.setState({ processing_pdf: true })

            fetchPrintBills( this.props.month, false )
                .then( ( blob ) => this.props.setBillsFile( this.props.month, blob, false ) )
                .then( () => this.setState({ processing_pdf: false }) )
                .catch( () => this.setState({ processing_pdf: false }) )

        }

        let exportXls = () => {


            this.setState({ processing_xls: true })

            fetchPrintBills( this.props.month, true)
                .then( ( blob ) => this.props.setBillsFile( this.props.month, blob, true ) )
                .then( () => this.setState({ processing_xls: false }) )
                .catch( () => this.setState({ processing_xls: false }) )

        }

        return (
            [   <tr className={`au-target nested ${ this.props.opened ? 'opened' : ''}`} key={0}>
                    <td className="text-left" onClick={ this.props.openMonth }>
                        {this.props.month.monthLong}
                    </td>
                    {

                    /*
                        <td className="text-right"
                            {(numberWithCommas((+this.props.month.total_cost_supplier).toFixed(2) ))}
                        </td>
                        <td className="text-right">{numberWithCommas(((+this.props.month.total_cost).toFixed(2) - (+this.props.month.total_cost_supplier).toFixed(2)).toFixed(2) )}</td>
                        */

                    }
                    <td>
                        <div className={`btn btn-primary btn-icon btn-block btn-download disabled ${ this.state.processing_pdf ? 'btn-processing' : '' }`} onClick={ ()=>{}}>
                            PDF
                        </div>
                    </td>
                    <td>
                        <div className={`btn btn-success btn-icon btn-block btn-download ${ this.state.processing_xls ? 'btn-processing' : '' }`} onClick={ exportXls }>
                            Excel
                        </div>
                    </td>
                    <td className="text-right">
                        {(numberWithCommas((+this.props.month.total_cost).toFixed(2)))}
                    </td>

                    {
                        /*
                        <td className="td-dropdown au-target">
                            <div className="dropdown">

                                <button className="btn btn-default btn-icon-sm " data-toggle="dropdown">
                                    <i className="material-icons">print</i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-right">

                                    <li>
                                        <a href="javascript:void(0);"
                                           onClick={() => {
                                               fetchPrintBills( this.props.month, false )
                                                   .then( ( blob ) => this.props.setBillsFile( this.props.month, blob, false ) )
                                           }}>
                                            <i className="material-icons">print</i>
                                            Печать ЕПД PDF
                                        </a>
                                        <a href="javascript:void(0);"
                                           onClick={() => {
                                               fetchPrintBills( this.props.month, true )
                                                   .then( ( blob ) => this.props.setBillsFile( this.props.month, blob, true ) )
                                           }}>
                                            <i className="material-icons">file_download</i>
                                            Генерация ЕПД EXCEL
                                        </a>

                                    </li>
                                </ul>
                            </div>
                        </td>
                        */
                    }
                </tr>,
                this.props.opened
                ?   [
                        <tr key={1} />,
                        <tr key={2} className="nest">
                            <td colSpan={5}>
                                <BillsTableRowEntries entries={ this.props.month.entries }/>
                            </td>
                        </tr>
                    ]
                :   null
            ]
        )
    }
}

const BillsTableRowEntries = (props) => {
    return (
        <table className="table table-condensed" style={{ marginBottom: 0 }}>
            <colgroup>
                <col width="47.6%" />
                <col width="20%" />
                <col width="10.10%" />
                <col width="10.15%" />
                <col width="12.15%" />
            </colgroup>
            <thead className="thead">
                <tr>
                    <td className="text-left">Услуга</td>
                    <td className="text-left">Тип</td>
                    <td className="text-right">Объём</td>
                    <td className="text-right">Тариф</td>
                    <td className="text-right">Начислено</td>
                </tr>
            </thead>
            <tbody>
            <tr><td colSpan={5} className="text-left text-bold">Содержание и ремонт помещения</td></tr>
            {
                props.entries
                .filter( el => !el.supplier_id || el.bill_entry_type_id === 2 )
                .map( entry => (
                    <BillsTableEntryRow entry={ entry } key={ entry.bill_entry_id } />
                ))
            }
            <tr><td colSpan={5} className="text-left text-bold">К оплате сторонним поставщикам</td></tr>
            {
                props.entries
                    .filter( el => !!el.supplier_id && el.bill_entry_type_id !== 2)
                    .map( entry => (
                        <BillsTableEntryRow entry={ entry } key={ entry.bill_entry_id } />
                    ))
            }
            </tbody>
        </table>
    )
}

const BillsTableEntryRow = (props) => {
    return (
        <tr key={ props.entry.bill_entry_id }>
            <td className="text-left">
                { props.entry.name }
            </td>
            <td className="text-left">
                { props.entry.bill_entry_type_name }
            </td>
            <td className="text-right">
                { numberWithCommas(props.entry.quantity) }
            </td>
            <td className="text-right">
                { numberWithCommas(props.entry.price) }
            </td>
            <td className="text-right">
                { numberWithCommas(props.entry.cost) }
            </td>
        </tr>
    )
}
