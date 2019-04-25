import React from 'react';
import HouseList from './houseList';

const HouseGroupRow = (props) => {

    return props.houseGroup.houses.length ? [
        <tr className={`nested ${ props.houseGroup.isShown ? 'opened' : 'closed' }`} key="1"
            onClick={() => {
                props.showHouseGroup(props.houseGroup, props.houses)
            }}>
            <td className="text-left">  {props.houseGroup.title} </td>
            <td className="text-center"> {props.houseGroup.houses.length || '-'} </td>
        </tr>,
        <tr className={props.houseGroup.isShown ? 'nest' : ''} key="2">
            {!props.houseGroup.isShown ||
            <td colSpan="2">
                <HouseList houseGroup={props.houseGroup}
                           houses={props.houses}
                           rooms={props.rooms}
                           balancesMap={props.balancesMap}
                           showHouseRooms={props.showHouseRooms}
                           showRoomDialog={props.showRoomDialog}
                           serviceTypes={props.serviceTypes}
                           accounts={props.accounts}
                           owners={props.owners}
                />
            </td>
            }
        </tr>
    ] : null;
}

export default HouseGroupRow;

