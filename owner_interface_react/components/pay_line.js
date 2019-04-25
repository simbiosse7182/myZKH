import React from "react"
const numberWithCommas = (x) => {
    return x.toString().replace(",", ".");
}
export default class PayLine extends React.Component {
    state = {
        checked: false
    }


    componentWillReceiveProps(nextProps) {

        if (this.props.parentCheck !== nextProps.parentCheck) {
            this.props.changeCheck(this.props.balance.balance_id, nextProps.parentCheck && this.props.balance.pay > 0)
            this.setState({
                checked: nextProps.parentCheck && this.props.balance.pay >0
            })


        }

    }

    render() {

        const balance = this.props.balance
        return (
            <tr>
                <td className="text-left" colSpan='2'>
                    <div className="inline">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"
                                       checked={this.state.checked}
                                       onChange={(e) => this.setState({checked: e.target.checked}, () => this.props.changeCheck(balance.balance_id, this.state.checked))}
                                />
                            </label>
                        </div>
                    </div>
                    <span> {`${balance.service_type_name} ${balance.bill_entry_type_id != 1 ? `(${balance.bill_entry_type_name})` : ""}`}</span>
                </td>
                <td>{this.props.account_number}</td>
                <td className="text-right">{-1 * (+balance.amount  ) + " руб."}
                    {/*<span className="td_sub-text">*/}
                    {/*{+balance.amount}*/}
                    {/*</span>*/}
                </td>
                <td colSpan='1' className="td-form">
                    <div className={
                        `${this.state.checked && ((+balance.pay) <= 0) ?
                            "form-group has-error" : "form-group "
                            }`}>
                        <input disabled={!this.state.checked}
                               type="text"
                               className="form-control text-right"
                               value={balance.pay}
                               onChange={(e) => this.props.changePay(balance.balance_id, e.target.value)}
                        />
                    </div>
                </td>
                <td className="text-right">
                    {
                        this.state.checked && balance.pay > 0 ?
                            !this.props.commission ?
                                "-"
                                :
                                balance.commission + " руб."
                            :
                            ""
                    }
                </td>
            </tr>
        )

    }


}
