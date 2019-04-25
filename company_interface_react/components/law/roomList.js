import React from 'react';
import RoomRow from './roomRow';

const RoomList = (props) => {

    return <table className="nested-table hovered">
        <colgroup>
            <col width="10%"/>
            <col width="5%"/>
            <col width="35%"/>
            <col width="20%"/>
            <col width="15%"/>
            <col width="15%"/>

        </colgroup>
        <thead>
        <tr>

            <th>Тип</th>
            <th>№</th>
            <th>ФИО</th>
            <th>Лицевой счет</th>
            <th className="text-right">Задолжность</th>
            <th>Дата последней оплаты</th>
        </tr>
        </thead>
        <tbody>
        {
            props.house.rooms
                // .filter(key => props.rooms[key].accounts
                //     .some(account_id => {
                //         if (!props.balancesMap.accounts[account_id]) return false
                //         const service_types = props.balancesMap.accounts[account_id].service_types
                //         return Object.keys(service_types).some(service_type => service_types[service_type] < 0)
                //     })
                // )
                // //Отфильтровываем комнаты  в которых есть должники

                .sort((a, b) => {
                    //+props.rooms[a].number > +props.rooms[b].number ? 1 : +props.rooms[a].number < +props.rooms[b].number ? -1 : 0
                    let a_room = props.rooms[a] || {};
                    let b_room = props.rooms[b] || {};
                    if (a_room.type > b_room.type) {
                        return 1;
                    } else if (a_room.type < b_room.type) {
                        return -1;
                    } else {
                        let a_number = Number(a_room.number.replace(/\D+/g, ""));
                        let b_number = Number(b_room.number.replace(/\D+/g, ""));
                        if (a_number > b_number) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }
                })
                .map((key) => props.rooms[key].accounts
                    .filter(account_id => {
                        const service_types = props.balancesMap.accounts[account_id]?  props.balancesMap.accounts[account_id].service_types:{}
                        return Object.keys(service_types).some(service_type => service_types[service_type].amount < 0)

                    }) //Отфильтровываем аккаунты должников
                    .map((account_id, index) => {

                        return <RoomRow house={props.house}
                                        room={props.rooms[key]}
                                        balancesMap={props.balancesMap}
                                        showRoomDialog={props.showRoomDialog}
                                        key={index}
                                        account_id={account_id}
                                        serviceTypes={props.serviceTypes}
                                        accounts={props.accounts}
                                        owners={props.owners}

                        />
                    })
                )
        }
        </tbody>
    </table>;
}

export default RoomList;

