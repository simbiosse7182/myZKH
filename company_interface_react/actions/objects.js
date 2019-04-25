/* src/actions/ObjectsActions.js */
import fetchData from './fetchData.js';
import {nameFormatValueConverter} from "../../../dist/components/global-converter";

export function setHouseGroups(house_groups) {
    return {
        type: 'SET_HOUSE_GROUPS',
        house_groups
    }
}

export function setHouses(houses) {
    return {
        type: 'SET_HOUSES',
        houses
    }
}

export function setRooms(rooms) {
    return {
        type: 'SET_ROOMS',
        rooms
    }
}

export function showHouseGroup(id) {
    return {
        type: 'SHOW_HOUSE_GROUP',
        id: id
    }
}

export function fetchHouseGroups(dispatch) {
    return fetchData('house-groups')
        .then(response => {
            let promises = [];
            (response.success && response.data || []).map(
                key => {
                    promises.push(
                        fetchData(`house-groups/${ key.house_group_id }/houses`)
                            .then(response => {
                                dispatch({type: 'SET_HOUSE_GROUP_HOUSES', response});
                            })
                    );
                }
            );
            return Promise.all(promises).then(() => dispatch({type: 'SET_HOUSE_GROUPS', response}));
            //return response;
        })

}

export function fetchHouses() {

    return fetchData('houses')
        .then(
            payload => {
                let buildings = payload && payload.data ? payload.data : [],
                    promises = [];

                buildings = buildings.filter(el => el.is_active);

                for (let building in buildings) {
                    promises.push(
                        fetchData('houses/' + buildings[building].house_id)
                    )
                }
                return Promise.all(promises);
            }
        ).then(
            responses => {
                let houses = {};
                responses.map(response => {
                    let house = response.success && response.data || {};
                    if (!house.house_id) return;
                    houses[house.house_id] = house;
                })
                return houses;
            }
        )
}

export function fetchEntrances(houses) {
    let promises = [];

    Object.keys(houses).map(house_id => {
        promises.push(
            fetchData('entrances', {params: {house_id: house_id}})
        );
    });
    return Promise.all(promises);
}

export function fetchHouseData(dispatch, payload) {
    let buildings = payload && payload.data ? payload.data : [],
        promises = [];

    buildings = buildings.filter(el => el.is_active);

    for (let building in buildings) {
        promises.push(
            fetchData('houses/' + buildings[building].house_id,
                {
                    onSuccess: (response) => {
                        dispatch({type: 'SET_HOUSE_DATA', response});
                    },
                }
            )
        )

    }
    return Promise.all(promises);
}

/* Загружает квартиры для домов
*  @param { object }    houses
 */
export function fetchAllRooms(houses) {
    let promises = [];

    Object.keys(houses).map(house_id => {
        promises.push(fetchData(`rooms`, {params: {house_id: house_id}}));
    });

    return Promise.all(promises)
        .then(responses => {
            let rooms = {};
            responses.map(response => {
                if (response.success && response.data) {
                    response.data.map(room => {
                        if (room.room_id) {
                            rooms[room.room_id] = room;
                        }
                    })
                }
            });
            return rooms;
        });
}

/* Загружает комнаты для определённого дома
*  @param { object }    house
 */
export function fetchHouseRooms(house) {
    if (!house || !house.house_id) return;
    return fetchData(`rooms`, {params: {house_id: house.house_id}})
        .then(response => response.data);
}

/* Загружает лицевые счета??? (нужны для балансов)
*  @param { numeric }    house_id
 */
export function fetchAccounts(dispatch) {
    fetchData('accounts').then(response => dispatch({type: 'SET_ACCOUNTS', response}));
}

export function fetchHousePersons(house_id) {

    let promises = [],
        residents = {};

    promises.push(fetchData('residents', {params: {house_id}}));
    promises.push(fetchData('dwellers', {params: {house_id}}));
    promises.push(fetchData('owners', {params: {house_id}}));

    return Promise.all(promises)
        .then(responses => {
            return {
                residents: responses[0].success && responses[0].data || [],    // residents
                dwellers: responses[1].success && responses[1].data || [],    // dwellers
                owners: responses[2].success && responses[2].data || []     // owners
            }
        });
}

/*
    УСЛУГИ: Загружает все привязки услуг к дому, комнате и подъезду
    @return {object}
 */
export function fetchServices() {
    return fetchData('services', {params: {archive: 1}})
        .then(response => response.success && response.data || [])
}

/*
    УСЛУГИ: Загружает названия услуг
    @return {object}
 */
export function fetchServiceTypes() {
    return fetchData('service-types')
        .then(response => response.success && response.data || [])
}

/*
    УСЛУГИ: Загружает названия услуг
    @return {object}
 */
export function fetchServiceTypeCategories() {
    return fetchData('service-type-categories')
        .then(response => response.success && response.data || [])
}

/*
    Загружает все последние балансы по квартирам дома
    @return {object}
 */
export function fetchHouseBalances(house_id) {
    return fetchData('balances/houses/' + house_id)
        .then(response => response.success && response.data || [])
}

/*
    Подгружает дополнительные данные для показа диалога комнаты
    @return {promise}
 */
export function fetchRoomDialogData(dispatch, room_id) {
    return Promise.resolve()
        .then(() => fetchRoomPersons(room_id))
        .then(responses => {
            dispatch({type: 'SET_ROOM_PERSONS', responses: responses || {}, room_id: room_id})
            return responses;
        })
        .then(responses => fetchRoomPersonsDocuments(responses, room_id))
        .then(responses => dispatch({type: 'SET_ROOM_DOCUMENTS', documents: responses || [], room_id}))
        .then(() => fetchRoomIndividualServices(room_id))
        .then(services => dispatch({type: 'SET_ROOM_INDIVIDUAL_SERVICES', room_id, services}))
        .then(() => fetchRoomServiceValues(room_id))
        .then(service_values => dispatch({type: 'SET_ROOM_SERVICE_VALUES', room_id, service_values}))

}

/* Загружает показания счётчиков для квартиры */
function fetchRoomServiceValues(room_id) {
    if (!room_id) {
        return;
    }
    return fetchData('service-values', {params: {roomId:room_id}}).catch(error => []).then(response => response.success && response.data || [])
}

/* Загружает индивидуальные услуги для квартиры */
function fetchRoomIndividualServices(room_id) {
    if (!room_id) {
        return;
    }
    return fetchData('rooms/' + room_id + '/services').catch(error => []).then(response => response.success && response.data || [])
}

/* Подгружает собственников, прописанных и жильцов */
function fetchRoomPersons(room_id) {
    if (!room_id) {
        return;
    }
    return Promise.all([fetchData('owners', {params: {room_id: room_id, archive: true}}),
        fetchData('residents', {params: {room_id: room_id, archive: true}}),
        fetchData('dwellers', {params: {room_id: room_id, archive: true}})])
        .then(responses => {
            return {
                owners: responses[0].success && responses[0].data || [],
                residents: responses[1].success && responses[1].data || [],
                dwellers: responses[2].success && responses[2].data || [],
            }
        });
}

/*
    Загружает всех людей (persons) и организации (entities)
    @return {object) - {persons:[], entities:[]}
 */
export function fetchAllPersons() {
    return Promise.all([fetchData('people'), fetchData('entities')])
        .then(responses => ({
            persons: responses[0].success && responses[0].data || [],
            entities: responses[1].success && responses[1].data || []
        }));
}


/*
    Загружает всех собственников
    @return {array) - массив собственников
 */
export function fetchAllOwners() {
    return fetchData('owners').then(response => response.success && response.data || [])
}

/*
    Загружает все счётчики
    @return {array) - массив собственников
 */
export function fetchCounters() {
    return fetchData('counters').then(response => response.success && response.data || [])
}

/*
    Загружает все документы по списку жильцов
    @param {object} owners - список собственников из response от /residents/?room_id ( см. fetchRoomOwners )
 */
function fetchRoomPersonsDocuments(responses, room_id) {

    let promises = [],
        documentsPended = {},
        fetched_owners = responses.owners || [],
        fetched_residents = responses.residents || [];

    fetched_owners.map(owner => {

        let ownership = (owner.ownership || []).filter(el => el.room_id === room_id)[0] || {}

        if (!ownership || !ownership.document_id) return;

        promises.push(fetchData('documents/' + ownership.document_id));
        documentsPended[ownership.document_id] = ownership.document_id; // Чтобы документ не загружался 2 раза

    });

    fetched_residents.map(resident => {

        if (!resident || !resident.document_id) return;

        promises.push(fetchData('documents/' + resident.document_id));
        documentsPended[resident.document_id] = resident.document_id; // Чтобы документ не загружался 2 раза

    });

    return Promise.all(promises);
}

/*
    Вытаскивает из room.owners, room.residents и room.dwellers контакты собственников и жильцов
    @return {object} - список контактов
 */
export function getRoomContacts(room, persons, accounts, owners, residents, dwellers) {
    let res = [],
        people = {};

    if (!room) return res;

    for (let i = 0; i < room.owners.length; ++i) {
        let owner = owners[room.owners[i]] || {};

        if (owner.person && persons[owner.person.person_id]) {
            people['person_' + owner.person.person_id] = people['person_' + owner.person.person_id] ||
                {
                    source: 'owners',
                    id: 'person_' + owner.person.person_id,
                    person_id: owner.person.person_id,
                    type: 'persons',
                    contacts: persons[owner.person.person_id].contacts || [],
                    name: nameFormatValueConverter.getName(owner.person),
                    user: !!owner.user_id,
                    account: room.accounts.some(account_id => (accounts[account_id] || {}).owner_id === owner.owner_id)
                };

            people['person_' + owner.person.person_id].owner = true;
        } else if (owner.entity) {
            people['entity_' + owner.entity.entity_id] = people['entity_' + owner.entity.entity_id] ||
                {
                    source: 'owners',
                    id: 'entity_' + owner.entity.entity_id,
                    entity_id: owner.entity.entity_id,
                    type: 'entities',
                    contacts: [],
                    name: nameFormatValueConverter.getName(owner.entity),
                    user: !!owner.user_id,
                    account: room.accounts.some(account_id => (accounts[account_id] || {}).owner_id === owner.owner_id)
                };
            people['entity_' + owner.entity.entity_id].owner = true;
        }
    }

    for (let i = 0; i < room.residents.length; ++i) {
        let resident = residents[room.residents[i]];

        if (resident.person && persons[resident.person.person_id]) {
            people['person_' + resident.person.person_id] = people['person_' + resident.person.person_id] ||
                {
                    source: 'residents',
                    id: 'person_' + resident.person.person_id,
                    person_id: resident.person.person_id,
                    type: 'persons',
                    contacts: persons[resident.person.person_id].contacts || [],
                    name: nameFormatValueConverter.getName(resident.person),
                    user: false,
                    account: false
                };

            people['person_' + resident.person.person_id].resident = true;
        }
    }

    room.dwellers.map(dweller_id => {
        let dweller = dwellers[dweller_id];
        if (!dweller) {
            console.log('DW!!!', dweller_id, dwellers, room);
        }
        if (dweller.person && persons[dweller.person.person_id]) {
            people['person_' + dweller.person.person_id] = people['person_' + dweller.person.person_id] ||
                {
                    source: 'dwellers',
                    id: 'person_' + dweller.person.person_id,
                    person_id: dweller.person.person_id,
                    type: 'persons',
                    contacts: persons[dweller.person.person_id].contacts || [],
                    name: nameFormatValueConverter.getName(dweller.person),
                    user: false,
                    account: false
                };

            people['person_' + dweller.person.person_id].dweller = true;
        }
    });

    return Object.keys(people).map(key => people[key]).sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);

}

// Распихивает услуги по папочкам
export function getRoomSortedServices(room, services, service_types, service_categories, service_map) {
    let list = {},
        assigned = {},
        house = {},
        individual = {},
        house_types = [0, 1, 3],
        assignment_types = [0]

    if (!service_map.room || !service_map.room[+room.room_id]) return;

    service_map.room[+room.room_id].map(service_id => {

        let service = services[+service_id],
            service_type = service_types[service.service_type_id]

        if (!service || !service.sub_type) return;

        list[service.sub_type] = list[service.sub_type] || {};
        list[service.sub_type][service_type.service_type_category_id || 0] = list[service.sub_type][service_type.service_type_category_id || 0] || {}
        list[service.sub_type][service_type.service_type_category_id || 0][+service_id] = {...services[service_id]};
    });
    /*

    назначаемые
    keys = Object.keys(services).filter(el => !!services[el] && !(services[el].assignment_type === 1 && services[el].type === 1) &&
                ((types.indexOf(services[el].assignment_type) !== -1) || services[el].type === 2) && !services[el].room_id);

    Индивидуальные
    keys = Object.keys(services).filter(el => !!services[el] && services[el].assignment_type === 1 && services[el].type === 1);

    objects.js:4838
     */
    /*
    Object.keys( services ).map( service_id => {
        let service = { ...services[service_id] },
            is_assigned =

    })
    */
    /*

    РАНЬШЕ ВСЁ СЧИТАЛОСЬ ЗДЕСЬ. ТЕПЕРЬ -- В РЕДЬЮСЕРЕ SET_SERVICES
    // Общедомовые
    Object.keys(services).filter( service_id => {
        let service = services[ service_id ],
            service_type = service_types[service.service_type_id];

        return  !!service && !!service_type
                // Общедомовая
                && +service_type.assignment_type === 0
                // Не ресурс
                && +service_type.type !== 2
                // Назначена на этот дом
                && ( !service.house_id || ( +service.house_id && +service.house_id === +room.house_id ) )
        })
        .map( service_id => {
            let service = services[ service_id ],
                service_type = service_types[service.service_type_id];
                list.house[ service_type.service_type_category_id || 0 ] = list.house[ service_type.service_type_category_id || 0 ] || {};

            list.house[ service_type.service_type_category_id || 0 ][service.service_id] = {
                ...service,
                assignment_type:    service_type.assignment_type,
                type:               service_type.type,
                name:               service_type.name,
                category_id:        service_type.service_type_category_id || 0,
            }
        })

    // Назначаемые услуги
    Object.keys(services).filter( service_id => {
        let service = services[ service_id ],
            service_type = service_types[service.service_type_id];

        return  !!service && !!service_type
                //&& !(+service_type.assignment_type === 1 && +service_type.type === 1)
                // не назначается на квартиру и не что? Не что, блядь? я хуй знает, почему не 1
                // +service_type.type !== 1
                // не общедомовая
                && +service_type.assignment_type !== 0
                // не ресурс
                && +service_type.type !== 2
                // не назначено на квартиру
                && !service.room_id
                // Назначена на этот дом
                //  && ( !service.house_id || ( +service.house_id && +service.house_id === +room.house_id ) )
                //  Только для этого дома - подъезда
                &&  (   ( !service.house_id && !service.entrance_id ) // не привязана к дому / подъезду
                        || ( service.house_id && +service.house_id === +room.house_id ) // привязана, к дому квартиры
                        || ( service.entrance_id && +service.entrance_id === +room.entrance_id ) ) // привязана, к подъезду квартиры
                &&  (   !service.assignment_type // нет привязки к дому-квартире-подъезду
                        || ( +service.assignment_type === 1 && service.connection_type === 1 ) // привязка к квартирам: всем
                        || ( +service.assignment_type === 1 && service.connection_type === 2 && !service.connection_details.some( el => +el === +room.room_id ) ) // привязка к квартирам: эта не в числе исключений
                        || ( +service.assignment_type === 1 && service.connection_type === 3 && service.connection_details.some( el => +el === +room.room_id ) ) // привязка к квартирам: эта в числе указанных
                        || ( +service.assignment_type === 2 && service.connection_type === 1 ) // привязка к подъездам: всем
                        || ( +service.assignment_type === 2 && service.connection_type === 2 && !service.connection_details.some( el => +el === +room.entrance_id ) ) // привязка к подъездам: эта не в числе исключений
                        || ( +service.assignment_type === 2 && service.connection_type === 3 && service.connection_details.some( el => +el === +room.entrance_id ) ) // привязка к подъездам: эта в числе указанных
                    )
    })
    .map( service_id => {
        console.log('GOT SRV!', service_id)
        let service = services[ service_id ],
            service_type = service_types[service.service_type_id];
            list.assigned[ service_type.service_type_category_id || 0 ] = list.assigned[ service_type.service_type_category_id || 0 ] || {};

        list.assigned[ service_type.service_type_category_id || 0 ][service.service_id] = {
            ...service,
            assignment_type:    service_type.assignment_type,
            type:               service_type.type,
            name:               service_type.name,
            category_id:        service_type.service_type_category_id || 0,
        }
    })
    */
    return {...list}
}
