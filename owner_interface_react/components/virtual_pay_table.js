import React from "react"
import VirtualPayLine from "./virtual_pay_line"

export default class VirtualPayTable extends React.Component {
    state = {
        opened: false,
        checked: false,
        checkedOne: false

    }

    toggleOpened = () => {
        this.setState({opened: !this.state.opened})
    }

    componentWillMount() {
        const checked = this.props.spps.services.some((service, index) => this.props.spps.services[index].checked === true)
        this.setState({checkedOne: checked})
    }

    componentWillReceiveProps(nextProps) {
        const checked = this.props.spps.services.some((service, index) => this.props.spps.services[index].checked === true)
        this.setState({checked: checked})

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


        const spps = this.props.spps
        let accounts = []

        let totalDebt = 0
        let totalPay = 0;
        spps.services.map(service => {
            totalDebt += Math.ceil(parseInt(+service.debt * 100)) / 100
            if (service.checked) {
                totalPay += Math.ceil(parseInt(+service.pay * 100)) / 100
            }
            if (accounts.indexOf(service.account_number) === -1) {
                accounts.push(service.account_number)
            }
        })


        totalPay=totalPay.toFixed(2)
        totalDebt=totalDebt.toFixed(2)


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
                    <span>{spps.name}</span>
                </td>
                <td data-label="№ Л/С">{accounts.map(account => <div key={account}>{account}</div>)}</td>
                <td data-label="Долг" className="text-right">{totalDebt + " руб."} </td>
                <td colSpan='1' data-label="Оплатить"
                    className="text-right">{this.state.checked ? totalPay + " руб." : ""}</td>

            </tr>


            <tr className="nest" style={this.state.opened ? {null} : {display: "none"}}>
                <td colSpan="5">
                    <div>
                        <table className="nested-table">
                            <colgroup>
                                <col width="21%"/>
                                <col width="28%"/>
                                <col width="17%"/>
                                <col width="17%"/>
                                <col width="17%"/>

                            </colgroup>


                            <thead>
                            <tr>
                                <th colSpan='2'>Наименование услуги</th>
                                <th>№ Л/С</th>
                                <th>К оплате<span className="td_sub-text">Баланс</span></th>
                                <th colSpan='1'>Оплатить</th>

                            </tr>
                            </thead>
                            <tbody>
                            {
                                spps.services.map((service, index) => (
                                    <VirtualPayLine
                                        index={index}
                                        sppsKey={this.props.sppsKey}
                                        service={service}
                                        key={index}
                                        parentCheck={this.state.checked}
                                        changeCheck={this.props.changeCheck}
                                        changePay={this.props.changePay}
                                    />
                                ))

                            }
                            <tr className="text-bold">
                                <td className="text-left" colSpan="2">Итого:</td>
                                <td className="text-left">-</td>
                                <td className="text-right">{totalDebt + " руб."}</td>
                                <td className="text-right" colSpan="1">{totalPay +" руб."}</td>
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
