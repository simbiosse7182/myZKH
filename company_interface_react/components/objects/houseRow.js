import React from 'react';
import RoomList from './roomList';

const HouseRow = (props) => {
    const house = props.house
    return [
        <tr className={`nested ${ house.data_loading? "loading" : house.isShown&&house.data_loaded  ? 'opened' : 'closed'}`}
            onClick={() => {
                props.showHouseRooms(house.house_id,house.data_loaded||house.data_loading);
            }} key="1">

            <td className="text-left"> {house.shortAddress} </td>
            <td className="text-right"> {house.entrances && house.entrances.length ? house.entrances.length : '-'} </td>
            <td className="text-right"> {house.rooms && house.rooms.length ? house.rooms.length : house.rooms_count || '-'} </td>
            <td className="text-right"> {house.tech_status || '-'}</td>
            <td className="text-right"> {house.rooms_area.common ? house.rooms_area.common.toFixed(2) : '-'}</td>
            <td className="text-right"> {house.rooms_area.live ? house.rooms_area.live.toFixed(2) : '-'}</td>
            <td className="text-right"> {house.rooms_area.nolive ? house.rooms_area.nolive.toFixed(2) : '-'} </td>
            <td className="text-right"> {house.mop.toFixed(2) || '-'} </td>
            <td colSpan="2"> {house.balances_loaded && props.balancesMap.houses[house.house_id] && props.balancesMap.houses[house.house_id].all ? props.balancesMap.houses[house.house_id].all.toFixed(2) + " руб": ''} </td>
        </tr>,
        !house.isShown || !house.balances_loaded || !house.residents_loaded ||
        <tr className={house.isShown ? 'nest' : ''} key="2">
            {house.isShown && house.rooms_loaded ?
                <td colSpan="10">
                    <RoomList house={house}
                              rooms={props.rooms}
                              balancesMap={props.balancesMap}
                              showRoomDialog={props.showRoomDialog}
                    />
                </td> : null
            }
        </tr>
    ]
}

export default HouseRow;

