import React        from 'react';
import RoomRow     from './roomRow';

const RoomList = (props) => {

    return  <table className="nested-table hovered">
                <colgroup>
                    <col width="7%" />
                    <col width="20%" />
                    <col width="5%" />
                    <col width="5%" />
                    <col width="11%" />
                    <col width="11%" />
                    <col width="11%" />
                    <col width="8%" />
                    <col width="8%" />
                    <col width="14%" />
                    <col className="col-btn" />
                </colgroup>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Тип</th>
                        <th>Эт.</th>
                        <th>Секц.</th>
                        <th>Собст-ть</th>
                        <th>Собств-ков</th>
                        <th>Жильцы</th>
                        <th>Площадь</th>
                        <th>Доступ</th>
                        <th colSpan="2">Баланс</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.house.rooms
                        .sort( (a, b) => {
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
                        .map( (key) => {
                             return <RoomRow    house={ props.house }
                                                room={ props.rooms[key] }
                                                balancesMap = { props.balancesMap }
                                                showRoomDialog = { props.showRoomDialog }
                                                key={ key } />
                        })
                    }
                </tbody>
            </table>;
}

export default RoomList;

