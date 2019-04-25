import React            from 'react';

const RoomRow = (props) => {
    return  <tr className = { `${ props.house.isShown ? 'opened' : 'closed' }`} onClick={ () => props.showRoomDialog(props.room.room_id) }>
                <td>{ props.room.number }</td>
                <td>{ props.room.room_type || '-' } </td>
                <td>{ props.room.floor || '-' } </td>
                <td>{ props.room.section || '-' } </td>
                <td>{ props.room.owner_type } </td>
                <td className="text-right">{ props.room.owners.length || '-'  }</td>
                <td className="text-right">{ +props.room.dwellers.length || '-' } + { +props.room.residents.length || '-'}</td>
                <td>{ props.room.total_area }</td>
                <td>...</td>
                <td colSpan="2">{ props.balancesMap.rooms[ props.room.room_id ] && props.balancesMap.rooms[ props.room.room_id ].all ? props.balancesMap.rooms[ props.room.room_id ].all.toFixed(2) : '0' }</td>
            </tr>
}

export default RoomRow;
