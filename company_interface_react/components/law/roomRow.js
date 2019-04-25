import React from 'react';
//onClick={() => props.showRoomDialog(props.room.room_id)}
export default class RoomRow extends React.Component {
    state = {
        opened: false
    }

    render() {
        const billEntryTypes = {
            1: 'Индивидуальное потребление',
            2: 'СОИ',
            3: 'Кпов',
            4: 'Перерасчеты',
            5: 'Корректировки',
            6: 'Льготы, субсидии',
            7: 'Пеня',
            8: 'Другое'
        };
        const {accounts, account_id, balancesMap, serviceTypes, room, owners} = this.props
        const service_types_balance = balancesMap.accounts[account_id] ? balancesMap.accounts[account_id].service_types : {}
        const account_number = accounts[account_id] ? accounts[account_id].number : "Л/С не найден"
        let sum_balance = 0
        Object.keys(service_types_balance).map(key => service_types_balance[key].amount > 0 ? sum_balance += 0 : sum_balance += service_types_balance[key].amount)

        let name = "Ф.И.О неизсвесно"
        if (owners && owners[accounts[account_id].owner_id] && owners[accounts[account_id].owner_id].person) {
            name = owners[accounts[account_id].owner_id].person.last_name + " " + owners[accounts[account_id].owner_id].person.first_name + " " + owners[accounts[account_id].owner_id].person.middle_name
        }
        else if (owners && owners[accounts[account_id].owner_id] && owners[accounts[account_id].owner_id].entity) {
            name = owners[accounts[account_id].owner_id].entity.short_name
        }
        return [
            <tr className={`nested ${this.state.opened ? "opened" : "closed"}`} key="1"
                onClick={() => this.setState({opened: !this.state.opened})}>
                <td>{room.room_type || '-'} </td>
                <td>{room.number}</td>
                <td className="text-left">{name}</td>
                <td className="text-center">{account_number}</td>
                <td className="text-right">{sum_balance.toFixed(2) + " руб."}</td>
                <td className="text-center">---</td>
            </tr>,
            !this.state.opened ||
            <tr className={this.state.opened ? 'nest' : ''} key="2">
                <td colSpan={6}>
                    <table className="nested-table hovered">
                        <colgroup>
                            <col width="5%"/>
                            <col width="35%"/>
                            <col width="15%"/>
                            <col width="20%"/>
                            <col width="15%"/>
                            <col width="15%"/>

                        </colgroup>
                        <thead>
                        <tr>
                            <th>кв.</th>
                            <th>Ф.И.О</th>
                            <th>Лицевой счет</th>
                            <th>Услуга</th>
                            <th>Задолжнсть</th>
                            <th>Срок задолжности</th>

                        </tr>
                        </thead>
                        <tbody>

                        {Object.keys(service_types_balance)
                            .filter(key => service_types_balance[key].amount < 0)
                            .map((key, index) => [<tr key={index}>
                                <td className="text-center">{room.number}</td>
                                <td className="text-left">{name}</td>
                                <td className="text-left">{account_number}</td>
                                <td className="text-left">{`${serviceTypes[key].name} (${billEntryTypes[service_types_balance[key].bill_entry_type_id]})`}</td>
                                <td className="text-right">{service_types_balance[key].amount.toFixed(2) + " руб."}</td>
                                <td>-</td>
                            </tr>])
                        }

                        </tbody>
                    </table>
                </td>
            </tr>

        ]
    }
}


