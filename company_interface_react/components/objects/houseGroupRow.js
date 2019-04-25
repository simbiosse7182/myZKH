import React from 'react';
import HouseList from './houseList';

const HouseGroupRow = (props) => {

    return props.houseGroup.houses.length ? [
        <tr className={`nested ${ props.houseGroup.isShown ? 'opened' : 'closed' }`} key="1"
            onClick={() => {
                props.showHouseGroup(props.houseGroup.house_group_id)
            }}>
            <td className="text-left">  {props.houseGroup.title} </td>
            <td className="text-right"> {props.houseGroup.houses.length || '-'} </td>
            <td className="text-right"> {props.houseGroup.rooms_count || '-'} </td>
            <td className="text-right"> {props.houseGroup.area_inside ? props.houseGroup.area_inside.toFixed(2) : '-'} </td>
            <td className="text-right" colSpan={2}> {props.houseGroup.mop ? props.houseGroup.mop.toFixed(2) : '-'} </td>

        </tr>,
        <tr className={props.houseGroup.isShown ? 'nest' : ''} key="2">
            {!props.houseGroup.isShown ||
            <td colSpan="7">
                <HouseList houseGroup={props.houseGroup}
                           houses={props.houses}
                           rooms={props.rooms}
                           balancesMap={props.balancesMap}
                           showHouseRooms={props.showHouseRooms}
                           showRoomDialog={props.showRoomDialog}
                />
            </td>
            }
        </tr>
    ] : null;
}

export default HouseGroupRow;

