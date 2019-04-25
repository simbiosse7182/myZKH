import React from 'react';
import HouseRow from './houseRow';

const HouseList = (props) => {

    return <table className="nested-table hovered">


        <tbody>
        {
            props.houseGroup.houses
                .sort((a, b) => props.houses[a].shortAddress > props.houses[b].shortAddress ? 1 : props.houses[a].shortAddress < props.houses[b].shortAddress ? -1 : 0)
                .map(key => <HouseRow house={props.houses[key]}
                                      rooms={props.rooms}
                                      balancesMap={props.balancesMap}
                                      showHouseRooms={props.showHouseRooms}
                                      showRoomDialog={props.showRoomDialog}
                                      serviceTypes={props.serviceTypes}
                                      accounts={props.accounts}
                                      owners={props.owners}
                                      key={key}
                />)

        }
        </tbody>
    </table>;
}

export default HouseList;

