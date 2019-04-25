import React from "react"

export default class VirtualPayLine extends React.Component {
    state = {
        checked: false
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.parentCheck !== nextProps.parentCheck) {
            this.props.changeCheck(this.props.sppsKey, this.props.index, nextProps.parentCheck && this.props.service.debt > 0)
            this.setState({
                checked: nextProps.parentCheck && this.props.service.debt > 0
            })

        }
    }


    render() {

        const service = this.props.service

        return (
            <tr>
                <td className="text-left" colSpan='2'>
                    <div className="inline">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"
                                       checked={this.state.checked}
                                       onChange={(e) => this.setState({checked: e.target.checked}, () => this.props.changeCheck(this.props.sppsKey, this.props.index, this.state.checked))}
                                />
                            </label>
                        </div>
                    </div>
                    <span> {service.name}</span>
                </td>
                <td>{service.account_number}</td>
                <td className="text-right">{+service.debt + " руб"}
                    <span className="td_sub-text">
                    {+service.balance + " руб"}
                    </span>
                </td>
                <td colSpan='1' className="td-form">
                    <div className={
                        `${this.state.checked && ((+service.pay) <= 0 || (!(service.allowOverpayment) && +service.pay > +service.debt)) ?
                            "form-group has-error" : "form-group "
                            }`}
                    >
                        <input disabled={!this.state.checked}
                               type="text"
                               className="form-control text-right"
                               value={service.pay}
                               onChange={(e) => this.props.changePay(this.props.sppsKey, this.props.index, e.target.value)}
                        />
                    </div>
                </td>

            </tr>
        )

    }


}
