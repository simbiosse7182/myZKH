import React        from 'react';
import HouseRow     from './houseRow';

const HouseList = (props) => {

    return  <table className="nested-table hovered">
                <colgroup>
                    <col width="32%"/>
                    <col width="8%"/>
                    <col width="8%"/>
                    <col width="8%"/>
                    <col width="8%"/>
                    <col width="8%"/>
                    <col width="8%"/>
                    <col width="8%"/>
                    <col width="12%"/>
                    <col className="col-btn"/>
                </colgroup>
                <thead>
                    <tr>
                        <th>Адрес</th>
                        <th colSpan="2">Подъезды /<br/>Помещения</th>
                        <th>Тех. сост.</th>
                        <th colSpan="4">Площади&nbsp;(м<sup>2</sup>)
                                                    <br/>помещений (общая / жилые / нежилые) / МОП
                        </th>
                        <th colSpan="2">Баланс</th>
                    </tr>
                </thead>
                <tbody>
                    {
                         props.houseGroup.houses.sort(
                             (a, b) => {
                                 return props.houses[a].shortAddress > props.houses[b].shortAddress ? 1 : props.houses[a].shortAddress < props.houses[b].shortAddress ? -1 : 0
                             }
                        )
                        .map( (key) => {
                             //let key = props.houseGroup.houses[index];
                             //console.log( 'houses', index )
                             return     <HouseRow   house={ props.houses[key] }
                                                    rooms={ props.rooms }
                                                    balancesMap = { props.balancesMap }
                                                    showHouseRooms={props.showHouseRooms}
                                                    showRoomDialog = { props.showRoomDialog }
                                                    key={ key } />
                        })
                    }
                </tbody>
            </table>;
}

export default HouseList;

