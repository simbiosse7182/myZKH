import React from "react"
import PayLine from "./pay_line";

export default class PayTable extends React.Component {
    state = {
        opened: false,
        checked: false,
        checkedOne: false

    }

    toggleOpened = () => {
        this.setState({opened: !this.state.opened})
    }

    componentWillMount() {
        const checked = Object.keys(this.props.balances).some(key => this.props.balances[key].checked === true)
        this.setState({checkedOne: checked})
    }

    componentWillReceiveProps(nextProps) {

        if (this.props.balances !== nextProps.balances) {
            const checked = Object.keys(nextProps.balances).some(key => nextProps.balances[key].checked === true)
            this.setState({checkedOne: checked})
        }

    }


    render() {
        const toggleCheck = (e) => {
            if (e.target.checked) {
                this.setState({checked: e.target.checked})
            }
            else {
                this.setState({checked: true, checkedOne: e.target.checked}, () => {
                    this.setState({checked: false})
                })
            }
        }

        const balances = this.props.balances
        let totalCommission = 0
        let totalPay = 0


        for (let key in balances) {
            if (balances[key].pay > 0 && balances[key].checked) {
                totalPay += (+balances[key].pay)
                totalCommission += (+balances[key].commission)
            }

        }


        totalPay = Math.ceil(parseInt(totalPay * 100)) / 100
        totalCommission = Math.ceil(parseInt(totalCommission * 100)) / 100

        return (
            <tbody>
            <tr onClick={() => {
                this.toggleOpened()
            }}
                className={`nested ${this.state.opened ? "opened" : null}`}>
                <td data-label="Получатель платежа"
                    className="text-left">
                    <div className="inline">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"
                                       onChange={(e) => toggleCheck(e)}
                                       checked={this.state.checked || this.state.checkedOne}
                                />
                            </label>
                        </div>
                    </div>
                    <span>{this.props.label} </span>
                </td>
                <td data-label="№ Л/С">{this.props.account_number}</td>
                <td data-label="Долг" className="text-right">{this.props.total_debt + " руб."}</td>
                <td colSpan='1' data-label="Оплатить"
                    className="text-right">{this.state.checked ? totalPay.toFixed(2) + " руб." : ""}</td>
                <td data-label="Комиссия"
                    className="text-right">{this.props.commission && this.state.checked ? totalCommission + " руб.": ""}</td>
            </tr>


            <tr className="nest" style={this.state.opened ? {null} : {display: "none"}}>
                <td colSpan="5">
                    <div>
                        <table className="nested-table">
                            <colgroup>
                                <col width="20%"/>
                                <col width="28%"/>
                                <col width="13%"/>
                                <col width="13%"/>
                                <col width="13%"/>
                                <col width="13%"/>
                            </colgroup>


                            <thead>
                            <tr>
                                <th colSpan='2'>Наименование услуги</th>
                                <th>№ Л/С</th>
                                <th>К оплате<span className="td_sub-text">Баланс</span></th>
                                <th colSpan='1'>Оплатить</th>
                                <th>Комиссия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                Object.keys(balances)
                                    .sort((a, b) => (
                                        balances[a].service_type_name > balances[b].service_type_name ? 1 : -1
                                    ))
                                    .map(key => (
                                        <PayLine
                                            changeCheck={this.props.changeCheck}
                                            changePay={this.props.changePay}
                                            account_number={this.props.account_number}
                                            commission={this.props.commission}
                                            balance={balances[key]}
                                            balance_key={key}
                                            key={key}
                                            parentCheck={this.state.checked}
                                        />)
                                    )

                            }
                            <tr className="text-bold">
                                <td className="text-left" colSpan="2">Итого:</td>
                                <td className="text-left">-</td>
                                <td className="text-right">{(+this.props.total_debt).toFixed(2) + " руб."}</td>
                                <td className="text-right" colSpan="1">{totalPay.toFixed(2) + " руб."}</td>
                                <td className="text-right"> {this.props.commission ? totalCommission.toFixed(2) + " руб." : "-"}</td>
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
