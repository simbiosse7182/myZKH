import React from "react"
import dateformat from "dateformat"
import phoneFormatter from 'phone-formatter'

const monthMap = [
    "Январь",
    "Февраль",
    "Март",
    "Аперль",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
]

class ResourceData extends React.Component {
    state = {
        inputValue: "",
        inputColor: "",
        is_focused: false,
    }

    sendData = () => {
        if ( +this.state.inputValue - +this.props.lastInputValue > 500 ) return
        if (this.state.inputValue !== "") {
            this.props.sendServiceValues(this.props.counterId, this.props.serviceId, this.state.inputValue)
                .then(data => {
                    this.props.checkServiceValues(data)
                    return
                })
                .then(() => {
                    this.setState({inputColor: "#5EB462"})
                    return
                })
                .then(() =>
                    setTimeout(() => {
                        this.setState({inputColor: "", inputValue: ""});
                    }, 1000)
                )
        }
    }

    render() {

        //последнее показание записывается в самый конец,история введется с последнего показания,поэтому массив переворачиваем
        const keys = Object.keys(this.props.service_values).reverse()

        let focusInput = () => {
            this.setState({ is_focused: true })
        }

        let blurInput = () => {
            this.setState({ is_focused: false })
        }

        return (
            <form className="panel-body" style={{ paddingTop: '3px', paddingBottom: 0 }}>

                <div className="row">
                    {/*
                    <div className="col-sm-3 bem-form-group">
                        <div className="form-group form-group-readonly">
                            <span className="form-control">
                                <strong>{this.props.model || "N/A"}</strong>
                                {` `}
                                {this.props.counter.serial_number}
                            </span>
                            <label className="control-label">Модель, серийный номер</label>
                        </div>
                    </div>
                    */
                    }
                    <div className="col-sm-3" style={{ marginTop: '2px'}}>
                        <h4>
                            <strong>{this.props.model || "N/A"}</strong>
                            {` `}
                            {this.props.counter.serial_number}
                        </h4>
                    </div>
                    <div className="col-sm-3" style={{ marginTop: '2px'}}>
                        <div className="row">
                            <div className="col-xs-6">
                                <label className="text-small">Дата поверки</label>
                                <div>
                                    {dateformat(this.props.counter.seal_date, "dd.mm.yyyy")}
                                </div>
                            </div>
                            <div className="col-xs-6">
                                <label className="text-small">Следующая поверка</label>
                                <div>
                                    {dateformat(this.props.counter.next_verify_date, "dd.mm.yyyy")}
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                     /*
                     <div className="col-sm-2 bem-form-group">
                        <div className="bem-form-group__inner-form-group form-group form-group-readonly">
                            <span className="form-control">

                            </span>
                            <label className="control-label">Дата поверки</label>
                        </div>
                        <span className="sub-text bem-form-group__sub-text">
                            Дата следующей <b>{dateformat(this.props.counter.next_verify_date, "dd.mm.yyyy")}</b>
                        </span>
                    </div>
                      */
                    }

                    <div className="col-sm-3">
                        <div className="bem-form-group__inner-form-group form-group form-group-readonly">
                            <div className="input-group">
                                <span className="form-control">
                                    {this.props.lastInputValue}
                                    {` `}
                                    <span className="text-muted">{this.props.units}</span>
                                </span>
                                <button data-toggle="modal" data-target={`#${this.props.counter.counter_id}`}
                                        className="btn btn-success btn-icon btn-history btn-raised"
                                        style={{ margin: '5px' }}
                                        >
                                            История
                                </button>
                            </div>
                            <label className="control-label">
                                <span>Показание от {dateformat(this.props.lastInputDate, "dd.mm.yyyy")}</span>
                            </label>

                        </div>
                    </div>

                    <div className="col-sm-3 bem-form-group ">

                        <div className={`bem-form-group__inner-form-group form-group is-empty ${ ( +this.state.inputValue - +this.props.lastInputValue ) > 500 ? 'has-error' : '' }`}
                             style={{"backgroundColor": `${this.state.inputColor}`}}>

                            {   this.state.is_focused
                                &&  (+this.state.inputValue - +this.props.lastInputValue)
                                &&  (+this.state.inputValue - +this.props.lastInputValue) > 50
                                ?   <div className="input-tooltip__placeholder">
                                        <div className={`input-tooltip__tooltip ${ ( +this.state.inputValue - +this.props.lastInputValue ) > 500 ? 'input-tooltip__tooltip_has_error' : '' }`}>
                                            {   ( +this.state.inputValue - +this.props.lastInputValue ) > 500
                                                ?   <span>
                                                        Очень высокое потребление,{` `}
                                                    <strong>
                                                        { ( +this.state.inputValue - +this.props.lastInputValue ).toFixed(2) }{` `}
                                                        { this.props.units }
                                                        </strong>
                                                    {` `}<br/>
                                                    Обратитесь в управляющую компанию. {` `}
                                                    {   this.props.room && this.props.room.company && this.props.room.company.entity && this.props.room.company.entity.phone
                                                        ? <strong>тел. { phoneFormatter.format(this.props.room.company.entity.phone, '(NNN) NNN-NN-NN') }</strong>
                                                        : null
                                                    }

                                                    </span>
                                                :   <span>
                                                        Высокое потребление,{` `}
                                                        <strong>
                                                            { ( +this.state.inputValue - +this.props.lastInputValue ).toFixed(2) }{` `}
                                                            { this.props.units }
                                                        </strong>
                                                        {` `}
                                                        Проверьте ввод.
                                                    </span>
                                            }
                                        </div>
                                    </div>
                                :   null
                            }

                            <div className="input-group">
                                <input  data-toggle="tooltip"
                                        title="Текст всплывающей подсказки"
                                        className="form-control"
                                        type="number"
                                        step="any"
                                        value={this.state.inputValue}
                                        onChange={(e) => { this.setState({inputValue: e.target.value}) }}
                                        onFocus={ focusInput }
                                        onBlur={ blurInput }
                                        />

                                <button type="submit"
                                        className="btn btn-primary btn-icon btn-forward au-target btn-raised"
                                        style={{ margin: '5px' }}
                                        onClick={() => this.sendData()}
                                        disabled={ (+this.state.inputValue - +this.props.lastInputValue) > 500 }
                                >
                                            Ввести
                                </button>

                            </div>

                            <label className="control-label">
                                <span>Показание</span>
                            </label>
                        </div>

                    </div>


                </div>

                {/*Модалка с историей*/}
                <div className="modal fade " id={`${this.props.counter.counter_id}`} tabIndex="-1"
                     role="dialog"
                     aria-labelledby="myModalLabel">
                    <div className="modal-dialog modal-md " style={{maxWidth: "700px"}} role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal"
                                        aria-label="Close">
                                    <span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">История показаний</h4>
                            </div>
                            <div className="modal-body">
                                <div style={{
                                    borderBottom: "0px",
                                    maxHeight: "400px",
                                    overflow: "auto"
                                }}>
                                    <table className="nested-table">
                                        <colgroup>
                                            <col style={{width: "33%"}}/>
                                            <col style={{width: "33%"}}/>
                                            <col style={{width: "33%"}}/>
                                        </colgroup>
                                        <thead>
                                        <tr>
                                            <th><h5>Дата внесения показаний</h5></th>
                                            <th><h5>Показание</h5></th>
                                            <th><h5>Потребление</h5></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {


                                            keys.map((key, index) => {
                                                    let consumption = (this.props.service_values[key].value - (this.props.service_values[keys[index + 1]] !== undefined ?
                                                        this.props.service_values[keys[index + 1]].value : 0))
                                                    return (
                                                        <tr key={key}>
                                                            <td>{dateformat(new Date(this.props.service_values[key].created), "dd.mm.yyyy")}</td>
                                                            <td>{this.props.service_values[key].value}</td>
                                                            <td> {Number.isInteger(consumption) ? consumption : consumption.toFixed(3)}</td>
                                                        </tr>
                                                    )
                                                }
                                            )
                                        }

                                        </tbody>
                                    </table>
                                </div>


                            </div>
                            <div className="modal-footer" style={{paddingRight: "24px"}}>
                                <button type="button" className="btn btn-default"
                                        data-dismiss="modal">Закрыть
                                    историю
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        )
    }
}

class ResourceDataSpps extends React.Component {

    state = {
        inputValue: "",
        inputColor: ""
    }

    sendData = () => {
        if (this.state.inputValue !== "") {
            this.props.sendServiceValues(this.props.counterId, this.props.serviceId, this.state.inputValue)
                .then(data => {
                    this.props.checkServiceValues(data)
                    return
                })
                .then(() => {
                    this.setState({inputColor: "#5EB462"})
                    return
                })
                .then(() =>
                    setTimeout(() => {
                        this.setState({inputColor: "", inputValue: ""});
                    }, 1000)
                )
        }
    }

    render() {

            return (
                <form className="panel-body" style={{ paddingTop: '3px', paddingBottom: 0 }}>
                    <div className="row">
                        <div className="col-sm-6">
                            {this.props.label }
                        </div>

                        <div className="col-sm-3">
                            <div className="bem-form-group__inner-form-group form-group form-group-readonly">

                                <span className="form-control">
                                    {this.props.lastInputValue}
                                    {` `}
                                    <span className="text-muted">{this.props.units}</span>
                                </span>

                                <label className="control-label">
                                    <span>Последнее показание</span>
                                </label>

                            </div>
                            <span className="sub-text bem-form-group__sub-text">
                                {dateformat(this.props.lastInputDate, "dd.mm.yyyy")}
                            </span>
                        </div>

                        <div className="col-sm-3 bem-form-group ">
                            <div className="bem-form-group__inner-form-group form-group is-empty"
                                 style={{"backgroundColor": `${this.state.inputColor}`}}>
                                <div className="input-group">
                                    <input  className="form-control"
                                            type="number"
                                            value={this.state.inputValue}
                                            onChange={(e) => {
                                                this.setState({inputValue: e.target.value})
                                            }}
                                            />

                                    <button type="submit"
                                            className="btn btn-primary btn-icon btn-forward au-target btn-raised"
                                            style={{ margin: '5px' }}
                                            onClick={() => {
                                                if (this.state.inputValue !== "" && this.state.inputValue > 0) {
                                                    this.props.sendServiceValues(this.props.subscriberId, this.props.itemId, this.props.counterId, this.props.serviceId, this.state.inputValue)
                                                        .then(() => {
                                                            this.setState({inputColor: "#5EB462"})
                                                            return
                                                        })
                                                        .then(() =>
                                                            setTimeout(() => {
                                                                this.setState({inputColor: "", inputValue: ""});
                                                            }, 1000)
                                                        )
                                                }
                                            }}>
                                                Ввести
                                    </button>

                                </div>

                                <label className="control-label">
                                    <span>Показание</span>
                                </label>
                            </div>

                            <span className="sub-text bem-form-group__sub-text">
                                за {monthMap[new Date().getMonth()]}
                            </span>
                        </div>

                    </div>
                </form>
            )

    }
}

class ResourceDataArchiveItem extends React.Component {

    render() {
        const keys = Object.keys(this.props.service_values).reverse()
        return (

                <div className="panel-body">
                    <div className="row">
                        <div className="col-sm-4 text-muted" style={{ paddingTop: '4px'}}>
                            <strong>{this.props.model || "N/A"}</strong>
                            {` `}
                            {this.props.counter.serial_number}
                        </div>

                        <div className="col-sm-2 text-muted text-right text-small" style={{ paddingTop: '7px', paddingRight: 0 }}>
                            Последнее показание:
                        </div>
                        <div className="col-sm-3 text-muted">
                            <div className="pull-left" style={{ paddingTop: '4px'}}>
                                <strong>{this.props.lastInputValue}{` `}{this.props.units}</strong>
                            </div>
                            <button data-toggle="modal" data-target={`#${this.props.counter.counter_id}`}
                                    className="btn btn-success btn-icon btn-history pull-right btn-raised"
                                    style={{ margin: 0, marginRight: '5px' }}>
                                История
                            </button>
                        </div>

                        <div className="col-sm-3 text-muted" style={{ paddingTop: '4px'}}>
                            В архиве с <b>{dateformat(this.props.counter.deleted, "dd.mm.yyyy")}</b>
                        </div>

                    </div>
                    {/*Модалка с историей*/}
                    <div className="modal fade " id={`${this.props.counter.counter_id}`} tabIndex="-1"
                         role="dialog"
                         aria-labelledby="myModalLabel">
                        <div className="modal-dialog modal-md " style={{maxWidth: "700px"}} role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal"
                                            aria-label="Close">
                                        <span aria-hidden="true">&times;</span></button>
                                    <h4 className="modal-title" id="myModalLabel">История показаний</h4>
                                </div>
                                <div className="modal-body">
                                    <div style={{
                                        borderBottom: "0px",
                                        maxHeight: "400px",
                                        overflow: "auto"
                                    }}>
                                        <table className="nested-table">
                                            <colgroup>
                                                <col style={{width: "33%"}}/>
                                                <col style={{width: "33%"}}/>
                                                <col style={{width: "33%"}}/>
                                            </colgroup>
                                            <thead>
                                            <tr>
                                                <th><h5>Дата внесения показаний</h5></th>
                                                <th><h5>Показание</h5></th>
                                                <th><h5>Потребление</h5></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {


                                                keys.map((key, index) => {
                                                        let consumption = (this.props.service_values[key].value - (this.props.service_values[keys[index + 1]] !== undefined ?
                                                            this.props.service_values[keys[index + 1]].value : 0))
                                                        return (
                                                            <tr key={key}>
                                                                <td>{dateformat(new Date(this.props.service_values[key].created), "dd.mm.yyyy")}</td>
                                                                <td>{this.props.service_values[key].value}</td>
                                                                <td> {Number.isInteger(consumption) ? consumption : consumption.toFixed(3)}</td>
                                                            </tr>
                                                        )
                                                    }
                                                )
                                            }

                                            </tbody>
                                        </table>
                                    </div>


                                </div>
                                <div className="modal-footer" style={{paddingRight: "24px"}}>
                                    <button type="button" className="btn btn-default"
                                            data-dismiss="modal">Закрыть
                                        историю
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

        )
    }
}

export { ResourceData, ResourceDataArchiveItem, ResourceDataSpps }
