import React from "react";
import {connect} from "react-redux";
import {
    showHouseGroup,
    fetchRoomDialogData,
    fetchData,
    fetchHouseGroups,
    fetchServices,
    fetchServiceTypes,
    fetchServiceTypeCategories,
    fetchHouses,
    fetchEntrances,
    fetchAccounts,
    fetchHousePersons,
    fetchHouseBalances,
    fetchAllPersons,
    fetchCounters,
    fetchAllOwners,
    fetchAllRooms,
} from '../actions/objects'

import HouseGroupRow from "../components/law/houseGroupRow"
import Spinner from "../components/spinner"

class Law extends React.Component {
    componentWillMount() {
        this.props.loadHouseGroups()
    }

    render() {
        const {
            houseGroups,
            houses,
            rooms,
            balancesMap,
            showHouseGroup,
            showHouseRooms,
            showRoomDialog,
            serviceTypes,
            accounts,
            owners
        } = this.props
        if (Object.keys(houseGroups).length > 0) return (
            <table className="nested-table hovered">
                <colgroup>
                    <col width="50%"/>
                    <col width="50%"/>

                </colgroup>
                <thead>
                <tr>
                    <th>Участок</th>
                    <th colSpan="2">Здания /<br/>Помещения</th>

                </tr>
                </thead>
                <tbody>
                {
                    Object.keys(houseGroups).map((key, index) => {
                        return <HouseGroupRow houseGroup={houseGroups[key]}
                                              houses={houses}
                                              rooms={rooms}
                                              key={index}
                                              balancesMap={balancesMap}
                                              showHouseGroup={showHouseGroup}
                                              showHouseRooms={showHouseRooms}
                                              showRoomDialog={showRoomDialog}
                                              serviceTypes={serviceTypes}
                                              accounts={accounts}
                                              owners={owners}
                        />
                    })
                }
                <tr>
                </tr>
                </tbody>
            </table>

        )
        return <Spinner/>
    }
}

const mapStateToProps = function (store) {
    return {
        reactTestString: store.reactTestString,
        houseGroups: store.houseGroups,
        houses: store.houses,
        entrances: store.entrances,
        rooms: store.rooms,
        room_dialog_shown: store.room_dialog_shown,
        room_dialog_loaded: store.room_dialog_loaded,
        room_dialog_data: store.room_dialog_data,
        room_dialog_active_tab: store.room_dialog_active_tab,
        balancesMap: store.balancesMap,
        serviceTypes: store.serviceTypes,
        accounts:store.accounts,
        owners:store.owners
    };
};

const mapDispatchToProps = function (dispatch, ownProps) {

    return {
        // Подгружает данные для начальной таблички
        loadHouseGroups: () => {
            let houses = [];
            return fetchHouses(dispatch)
                .then(fetched_houses => houses = {...fetched_houses})
                .then(() => dispatch({type: 'SET_HOUSES', houses}))
                .then(() => fetchEntrances(houses))
                .then(responses => dispatch({type: 'SET_ALL_ENTRANCES', responses}))
                .then(() => fetchAllRooms(houses))
                .then(rooms => dispatch({type: 'SET_ALL_ROOMS', rooms}))
                .then(() => fetchAllOwners())
                .then(owners => dispatch({type: 'SET_ALL_OWNERS', owners}))
                // Эта функция выключена, так как fetchAllOwners итак заполняет все persons и entities собственников
                // но е ёё можно вынести в какой-нибудь загрузчик, если нам нужны физ / юрлица, не имеющие собственности
                //.then( () => fetchAllPersons() )
                //.then( responses => dispatch( { type: 'SET_ALL_PERSONS_ENTITIES', persons: responses.persons, entities: responses.entities }) )
                .then(() => fetchHouseGroups(dispatch)) // <--- Здесь можно прятать лоадер
                .then(() => fetchServiceTypes())
                .then(types => dispatch({type: 'SET_SERVICE_TYPES', types}))
                .then(() => fetchServiceTypeCategories())
                .then(categories => dispatch({type: 'SET_SERVICE_TYPE_CATEGORIES', categories}))
                .then(() => fetchServices())
                .then(services => dispatch({type: 'SET_SERVICES', services}))
                // .then(() => fetchCounters())
                // .then(counters => dispatch({type: 'SET_COUNTERS', counters}))
                .then(() => fetchAccounts(dispatch))
                .catch(error => {
                    console.log(error);
                });
        },
        // Развёртывает свёрнутую группу
        showHouseGroup: (houseGroup) => {
            dispatch(showHouseGroup(houseGroup.house_group_id))
        },
        // _showHouseRooms: house => {  // Старая функция, без поддержки промисов
        //     // Если комнаты не подгружены, не показываем.
        //     // TODO: показывать спиннер и менять isShown на true, а показывать когда rooms_loaded и isShown оба true
        //     if (!house.rooms_loaded) return;
        //
        //     // Если не загрузили жильцов
        //     if (!house.residents_loaded) {
        //         fetchHousePersons(house.house_id)
        //             .then(responses => dispatch({type: 'SET_HOUSE_PERSONS', responses, house_id: house.house_id}));
        //     }
        //
        //     // Если не загрузили балансы на дом
        //     // if (!house.balances_loaded) {
        //     //     fetchHouseBalances(house.house_id)
        //     //         .then(response => dispatch({type: 'SET_HOUSE_BALANCES', response, house_id: house.house_id}));
        //     // }
        //
        //     dispatch({type: 'SHOW_HOUSE_ROOMS', house_id: house.house_id});
        // },
        // Развёртывает свёрнутый дом
        showHouseRooms: (house_id, withoutFetch) => {
            if (withoutFetch) {
                return dispatch({type: 'SHOW_HOUSE_ROOMS', house_id})
            }

            else {
                dispatch({type: "START_LOAD_HOUSE_DATA", house_id})
                return fetchHousePersons(house_id)
                    .then(responses => dispatch({type: 'SET_HOUSE_PERSONS', responses, house_id}))
                    .then(() => fetchHouseBalances(house_id))
                    .then(response => dispatch({type: 'SET_HOUSE_BALANCES', response, house_id}))
                    .then(() => dispatch({type: 'SHOW_HOUSE_ROOMS', house_id}))
            }
        },
        // Показывает модалку комнаты
        showRoomDialog: room_id => {
            dispatch({type: 'SHOW_ROOM_DIALOG', room_id: room_id});
            return fetchRoomDialogData(dispatch, room_id)
                .then(() => dispatch({type: 'COPY_ROOM_DIALOG_DATA', room_id: room_id}))
                .then(() => dispatch({type: 'SET_ROOM_DIALOG_LOADED'}));
        },
        // Прячет модалку с комнатой
        hideRoomDialog: () => dispatch({type: 'HIDE_ROOM_DIALOG'}),
        // Меняет вкладки в модалке
        setRoomDialogTab: index => dispatch({type: 'SET_ROOM_DIALOG_TAB', active_tab: index}),
        // После сохранения собственников в диалоге комнаты обновляет данные в redux
        storeRoomOwners: data => {
            return Promise.resolve()
                .then(() => dispatch({type: 'STORE_ROOM_OWNERS', post_data: data}))
                .then(() => dispatch({type: 'COPY_ROOM_DIALOG_DATA', room_id: data.room.room_id}))

        },
        // После сохранения лицевых счетов в диалоге комнаты обновляет данные в redux
        storeRoomAccounts: data => {
            return Promise.resolve()
                .then(() => dispatch({type: 'STORE_ROOM_ACCOUNTS', post_data: data}))
                .then(() => dispatch({type: 'COPY_ROOM_DIALOG_DATA', room_id: data.room.room_id}))
        },
        storeRoomResidents: data => {
            console.log('DATA', data)
            return Promise.resolve()
                .then(() => dispatch({type: 'STORE_ROOM_RESIDENT', post_data: data}))
                .then(() => dispatch({type: 'COPY_ROOM_DIALOG_DATA', room_id: data.room_id}))
        },
        storeRoomService: (type, data) => {
            console.log('DATA', data);
            return Promise.resolve()
                .then(() => dispatch({type: 'STORE_ROOM_SERVICE', data}))
                .then(() => dispatch({type: 'SET_SERVICES', services: {}}))
                .then(() => dispatch({type: 'COPY_ROOM_DIALOG_DATA', room_id: data._room_id}))
        }
    }

};

export default connect(mapStateToProps, mapDispatchToProps)(Law);

