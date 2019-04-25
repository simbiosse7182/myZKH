import React from 'react';
import RoomList from './roomList';

const HouseRow = (props) => {
    const house = props.house
    return [
        <tr className={`nested ${ house.data_loading? "loading" : house.isShown&&house.data_loaded  ? 'opened' : 'closed' }`}
            onClick={() => {
                if (house.data_loading) return;
                return props.showHouseRooms(house.house_id, house.data_loaded)
            }} key="1">


            <td colSpan={10} className="text-left"> {house.shortAddress} </td>

            {/*<td className="text-right"> {house.entrances && house.entrances.length ? house.entrances.length : '-'} </td>*/}
            {/*<td className="text-right"> {house.rooms && house.rooms.length ? house.rooms.length : house.rooms_count || '-'} </td>*/}

        </tr>,
        !house.isShown || !house.balances_loaded || !house.residents_loaded ||
        <tr className={house.isShown ? 'nest' : ''} key="2">
            {house.isShown && house.rooms_loaded ?
                <td colSpan="10">
                    <RoomList house={house}
                              rooms={props.rooms}
                              balancesMap={props.balancesMap}
                              showRoomDialog={props.showRoomDialog}
                              serviceTypes={props.serviceTypes}
                              accounts={props.accounts}
                              owners={props.owners}
                    />
                </td> : null
            }
        </tr>
    ]
}

export default HouseRow;

