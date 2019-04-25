/*
http://prgssr.ru/development/pogruzhenie-v-react-redux.html
https://habrahabr.ru/post/269831/
 */
import {getRoomContacts, getRoomSortedServices} from "../actions/objects";

const initialState = {
    counters: {},
    houseGroups: {},
    houses: {},
    rooms: {},
    entrances: {},
    accounts: {},
    dwellers: {},
    serviceTypes: {},
    serviceTypeCategories: {},
    serviceMap: {}, // Привязка услуг будет иметь вид { house: {[],[]}, entrance: {[],[]}, room: {[],[]} }
    services: {},
    balancesMap: {
        houseGroups: {},
        houses: {},
        rooms: {},
        accounts: {}
    },
    house_dialog_shown: false,
    room_dialog_shown: false,
    room_dialog_loaded: false,
    room_dialog_active_tab: 0,
    room_dialog_data: {
        /*
        room: {},
        house: {},
        balances: {},
        accounts: {},
        residents: {},
        dwellers: {},
        owners: {},
        ownersAll: {},
        ownershipTypes: {},
        persons: {},
        entities: {},
        */
    },
    owners: {},
    owners_persons: {},
    owners_entities: {},
    persons_owners: {},
    entities_owners: {},
    persons: {},
    entities: {},
    people: {},
    residents: {},
    roomTypes: {
        1: {title: 'квартира'},
        2: {title: 'овощехранилище/склад'},
        3: {title: 'парковка'},
        4: {title: 'офис'}
    },
    ownerTypes: {
        1: {title: 'аренда'},
        2: {title: 'инд.'}
    },
    ownershipTypes: {
        'private': 'частная',
        'municipal': 'муниципальная',
        'state': 'государственная'
    },
    emptyDocument: {
        document_id: null,
        serial: null,
        number: null,
        type: null,
        title: null,
        text: null,
        issuer: null,
        issuer_code: null,
        created: null
    },
};

export default function objectsReducer(state = initialState, action) {

    switch (action.type) {
        case 'SHOW_ROOM_DIALOG': {
            return {...state, room_dialog_shown: true};
        }

        case 'COPY_ROOM_DIALOG_DATA': {
            let room_dialog_data = {...state.room_dialog_data},
                room = action.room_id && state.rooms[action.room_id] || null,
                house = state.houses[room.house_id] || null,
                owners = {...state.owners},
                accounts = {...state.accounts},
                residents = {...state.residents},
                dwellers = {...state.dwellers},
                data = room_dialog_data

            if (!room || !house) return;

            data.room = {...room}

            data.house = {...house}
            data.balances = state.balancesMap.rooms[room.room_id] || {
                all: 0,
                resources: 0,
                services: {null: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
            };

            data.owners = {};
            room.owners.map(owner_id => {
                if (owners[owner_id]) {
                    data.owners[owner_id] = owners[owner_id]
                }
            });
            room.owners_history.map(owner_id => {
                if (owners[owner_id]) {
                    data.owners[owner_id] = owners[owner_id]
                }
            });

            room_dialog_data.accounts = {};
            room.accounts.map(account_id => {
                if (accounts[account_id]) {
                    data.accounts[account_id] = accounts[account_id]
                }
            });

            room_dialog_data.dwellers = {};
            room.dwellers.map(dweller_id => {
                if (dwellers[dweller_id]) {
                    data.dwellers[dweller_id] = dwellers[dweller_id]
                }
            });

            room_dialog_data.residents = {};
            room.residents.map(resident_id => {
                if (residents[resident_id]) {
                    data.residents[resident_id] = residents[resident_id]
                }
            });
            room.residents_history.map(resident_id => {
                if (residents[resident_id]) {
                    data.residents[resident_id] = residents[resident_id]
                }
            });

            data.ownershipTypes = {...state.ownershipTypes};
            data.persons = {...state.persons};
            data.persons_owners = {...state.persons_owners};
            data.entities = {...state.entities};
            data.entities_owners = {...state.entities_owners};
            data.ownersAll = {...state.owners};
            data.emptyDocument = {...state.emptyDocument};
            data.room.contacts = getRoomContacts(room, {...state.persons}, {...state.accounts}, {...state.owners}, {...state.residents}, {...state.dwellers}) || {};

            data.services = {...state.services};
            data.service_types = {...state.serviceTypes}
            data.service_categories = {...state.serviceTypeCategories}
            data.services_sorted = getRoomSortedServices(room, {...state.services}, {...state.serviceTypes}, {...state.serviceTypeCategories}, {...state.serviceMap})
            data.counters = {...state.counters}
            return {...state, room_dialog_data}
        }

        case 'SET_ROOM_DIALOG_LOADED': {
            return {...state, room_dialog_loaded: true}
        }

        case 'HIDE_ROOM_DIALOG': {
            return {...state, room_dialog_shown: false, room_dialog_loaded: false};
        }

        case 'SET_ROOM_DIALOG_TAB': {
            return {...state, room_dialog_active_tab: action.active_tab};
        }
        /* REDUX: развёртывает группу домов.
        * @param {number} id - house_group_id
        */
        case 'SHOW_HOUSE_GROUP': {

            let houseGroups = {...state.houseGroups};
            if (!state.houseGroups[action.id]) return state;

            houseGroups[action.id].isShown = !houseGroups[action.id].isShown;

            return {...state, houseGroups};
        }

        /* REDUX: Обрабатывает и записывает группы домов в redux:houseGroups
        * @param {object} response - ответ от /api/house-groups
        *
        * Убрать continue когда запилят поддержку групп
        * */
        case 'SET_HOUSE_GROUPS': {

            let groups = action.response.success && action.response.data || false,
                houses = {...state.houses},
                houseGroups = {};

            if (groups) {
                for (let g = 0; g < groups.length; g++) {
                    //continue; // Когда запилят поддержку групп - убрать
                    let group = groups[g];
                    houseGroups[group.house_group_id] = group;
                    houseGroups[group.house_group_id].houses = [];
                    houseGroups[group.house_group_id].rooms_count = 0;
                    houseGroups[group.house_group_id].area_inside = 0;
                    houseGroups[group.house_group_id].mop = 0;
                }
            }

            // Группа "Без участка". Не выдаётся в ответе от сервера. А зря.
            if (!houseGroups[0]) {
                let group = {house_group_id: 0, title: 'Без участка'};
                houseGroups[group.house_group_id] = group;
                houseGroups[group.house_group_id].houses = [];
                houseGroups[group.house_group_id].rooms_count = 0;
                houseGroups[group.house_group_id].area_inside = 0;
                houseGroups[group.house_group_id].mop = 0;
            }

            // Дома по группам
            Object.keys(houses).map(key => {
                if (!houses[key] || !houseGroups[houses[key].house_group_id]) return;
                houseGroups[houses[key].house_group_id].houses.push(key);
            });

            // Если группа всего одна - развертываем её сразу
            if (Object.keys(houseGroups).length === 1) houseGroups[0].isShown = true;

            // Собираем данные из домов для групп: количество помещений, площади жилые и МОП
            Object.keys(houseGroups).map(
                key => {
                    houseGroups[key].houses.map(
                        house_id => {
                            houseGroups[key].rooms_count += +(houses[house_id].rooms_count);
                            houseGroups[key].area_inside += +(houses[house_id].total_area);
                            houseGroups[key].mop += +(houses[house_id].mop);
                        }
                    )

                }
            )

            return {...state, houseGroups};

        }

        /*
        Проставляет домам группы.
         */
        case 'SET_HOUSE_GROUP_HOUSES': {
            let houses = {...state.houses},
                group_houses = action.response.success && action.response.data || [];

            group_houses.map(key => {
                if (houses[key.house.house_id]) {
                    houses[key.house.house_id].house_group_id = +key.house_group_id;
                }
            });

            return {...state}
        }

        /* REDUX: Обрабатывает и записывает общие сведения о домах в redux:houses
        * @param {array} action.response - ответы от /api/houses/N/ в формате массива
        * */
        case 'SET_HOUSES': {
            let fetched_houses = action.houses || [],
                houses = {};

            //buildings = buildings.filter(el => el && el.success && el.data && el.data.is_active);

            Object.keys(fetched_houses).map(house_id => {
                //let house = fetched_houses[ house_id ];
                let house = houses[house_id] = {...fetched_houses[house_id]}
                house.data_loading = false;
                house.data_loaded = false;
                house.rooms_loaded = false;
                house.rooms_loading = false;
                house.residents_loaded = false;
                house.balances_loaded = false;
                house.house_group_id = 0;
                house.balances_diff = 0;
                house.isShown = false;
                house.services = {};
                house.entrances = [];
                house.rooms = [];
                house.rooms_area = {
                    common: 0,
                    live: 0,
                    nolive: 0
                };
                house.area_inside = 0;
                house.announcements = [];
                house.services = {};

                house.shortAddress = house.address.street + ', ' + house.address.building;
                house.mop = +(+house.attic_area + +house.cellar_area + +house.stairs_area).toFixed(2);
            });
            return {...state, houses};
        }

        /*
        * Выставляет подъезды домам
        * @param action.responses - ответы от /api/entrances/?house_id=house_id
         */
        case "START_LOAD_HOUSE_DATA": {
            let houses = {...state.houses};
            houses[action.house_id].data_loading = true;
            return {...state, houses}
        }
        case 'SET_ALL_ENTRANCES': {
            let houses = {...state.houses},
                entrances = {}

            action.responses.map(response => {
                if (!response || !response.data || !response.data.length // не пустой ответ
                    // все элементы принадлежат одному дому, возьмём его id из первого элемента
                    || !response.data[0].house_id || !houses || !houses[response.data[0].house_id]
                    || !houses[response.data[0].house_id].entrances
                ) return

                houses[response.data[0].house_id].entrances = Object.keys(response.data);
                Object.keys(response.data).map(key => entrances[response.data[key].entrance_id] = response.data[key])

            });
            return {...state, houses, entrances};

        }

        case 'START_FETCHING_HOUSE_ROOMS': {
            let houses = {...state.houses};

            if (!action.house || !action.house.house_id || !houses[action.house.house_id]) return {...state}
            houses[action.house.house_id].rooms_loading = true;

            return {...state, houses}
        }

        /*
        Заполняет все квартиры, подсчитывает площадь домов
         */
        case 'SET_ALL_ROOMS': {

            let houses = {...state.houses},
                rooms = {...state.rooms},
                fetched_rooms = action.rooms;

            Object.keys(fetched_rooms).map(room_id => {

                let room = rooms[room_id] = {...fetched_rooms[room_id]},
                    house = houses[room.house_id];

                // Да, собственность вот так выставляется.
                room.owner_type = room.entity ? 1 : 2;
                // Массив под владельцев
                room.accounts = [];
                room.counters = [];
                room.owners = [];
                room.owners_history = [];
                room.ownerships = {};
                room.documents = {};
                room.residents = [];
                room.residents_history = [];
                room.dwellers = [];
                room.balances = {};
                room.balances_diff = 0;
                room.room_type = state.roomTypes[room.type].title;
                room.owner_type = state.ownerTypes[room.owner_type].title;
                room.service_values = [];
                room.balances_loaded = false;
                room.accounts_loaded = false;
                room.dwellers_loaded = false;
                room.owners_loaded = false;
                room.residents_loaded = false;
                room.documents_loaded = false;

                house.area_inside += Number(room.total_area) || 0;
                house.rooms_area.common += +room.total_area;
                house.rooms.push(room_id);
                house.rooms_loading = false;
                house.rooms_loaded = true;
                house.area_inside = parseFloat(house.area_inside.toFixed(2));

                if (room.type === 1) {
                    house.rooms_area.live += +room.total_area;
                } else {
                    house.rooms_area.nolive += +room.total_area;
                }
            });

            return {...state, houses, rooms}
        }

        case 'SHOW_HOUSE_ROOMS': {
            if (!action.house_id || !state.houses[action.house_id]) return {...state}
            let houses = {...state.houses};

            houses[action.house_id].isShown = !houses[action.house_id].isShown;

            return {...state, houses}
        }

        case 'SET_ACCOUNTS': {
            let _accounts = action.response.success && action.response.data || [],
                rooms = {...state.rooms},
                accounts = {...state.accounts};

            for (let i = 0; i < _accounts.length; i++) {
                let account = _accounts[i],
                    room = rooms[account.room_id];
                room.accounts = [];
            }

            for (let i = 0; i < _accounts.length; i++) {
                let account = _accounts[i],
                    room = rooms[account.room_id];
                if (account.is_deleted || !room) continue;

                room.accounts.push(account.account_id);
                accounts[account.account_id] = account;
                room.accounts_loaded = true;

            }

            return {...state, rooms, accounts}
        }

        /*
            Заполняет жильцов (dwellers) и временно прописанных (residents) в их комнаты и дома.
            Заполняет state.persons контактами лиц
         */
        case 'SET_HOUSE_PERSONS': {
            let _residents = action.responses && action.responses.residents || [],
                _dwellers = action.responses && action.responses.dwellers || [],
                _owners = action.responses && action.responses.owners || [],
                rooms = {...state.rooms},
                houses = {...state.houses},
                dwellers = {...state.dwellers},
                residents = {...state.residents},
                owners = {...state.owners},
                persons = {...state.persons},
                entities = {...state.entities}

            _owners.map(owner => {
                owners[owner.owner_id] = owner;
                if (owner.person && owner.person.person_id) persons[owner.person.person_id] = owner.person;
                if (owner.entity && owner.entity.entity_id) entities[owner.entity.entity_id] = owner.entity;
                /*
                if( resident.end_date && +(new Date(resident.end_date).getTime()) < +Date.now() ) return;
                rooms[resident.room_id].residents.push( resident.resident_id )
                rooms[resident.room_id].residents_loaded = true;
                */
            });

            _residents.map(resident => {
                residents[resident.resident_id] = resident;
                if (resident.end_date && +(new Date(resident.end_date).getTime()) < +Date.now()) return;
                rooms[resident.room_id].residents.push(resident.resident_id)
                rooms[resident.room_id].residents_loaded = true;

                if (resident.person && resident.person.person_id) persons[resident.person.person_id] = resident.person;

            });

            _dwellers.map(dweller => {
                dwellers[dweller.dweller_id] = dweller;
                rooms[dweller.room_id].dwellers.push(dweller.dweller_id);
                rooms[dweller.room_id].dwellers_loaded = true;
                if (dweller.person && dweller.person.person_id) persons[dweller.person.person_id] = dweller.person;
            });

            houses[action.house_id].residents_loaded = true;
            if (houses[action.house_id].residents_loaded && houses[action.house_id].balances_loaded) {
                houses[action.house_id].data_loading = false
                houses[action.house_id].data_loaded = true
            }
            return {...state, houses, rooms, dwellers, residents, owners, persons, entities};
        }

        /* Распихивает балансы по домам, квартирам и аккаунтам
         */
        case 'SET_HOUSE_BALANCES': {
            let balancesMap = {...state.balancesMap},
                rooms = {...state.rooms},
                houses = {...state.houses},
                house = houses[action.house_id];

            Object.keys(action.response).map(key => {
                let balance_groups = action.response[key],
                    room = rooms[key] || null; // квартира, к которой привязан баланс

                if (!room) return;

                Object.keys(balance_groups).map(bal_group => {
                    Object.keys(balance_groups[bal_group]).map(balance_id => {
                        let balance = balance_groups[bal_group][balance_id],
                            service = state.services[balance.service_id],
                            serviceType = service && state.serviceTypes[service.service_type_id];

                        balancesMap.accounts[balance.account_id] = balancesMap.accounts[balance.account_id] || {
                            all: 0,
                            lastDate: null
                        } // если нет строки с этим акком, создаём
                        balancesMap.rooms[room.room_id] = balancesMap.rooms[room.room_id] || {
                            all: 0,
                            resources: 0,
                            services: {null: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0},
                            sub_services: {}
                        }
                        balancesMap.houses[room.house_id] = balancesMap.houses[room.house_id] || {all: 0, resources: 0}

                        if (!serviceType || balance.supplier_id) return;

                        balancesMap.accounts[balance.account_id].all += +balance.amount;
                        balancesMap.rooms[room.room_id].all += +balance.amount;
                        balancesMap.houses[room.house_id].all += +balance.amount;

                        if (serviceType.type === 2) {
                            balancesMap.rooms[room.room_id].resources += +balance.amount;
                            balancesMap.houses[room.house_id].resources += +balance.amount;
                            balancesMap.rooms[room.room_id].services[serviceType.service_type_id] += +balance.amount;
                        } else {
                            // TODO: записывать в отдельный массивчик
                            balancesMap.rooms[room.room_id].services[null] += +balance.amount;
                            balancesMap.rooms[room.room_id].sub_services[serviceType.service_type_id] = (balancesMap.rooms[room.room_id].sub_services[serviceType.service_type_id] || 0) + +balance.amount;
                        }

                    })
                });

            });

            houses[action.house_id].balances_loaded = true;
            if (houses[action.house_id].residents_loaded && houses[action.house_id].balances_loaded) {
                houses[action.house_id].data_loading = false
                houses[action.house_id].data_loaded = true
            }
            return {...state, houses, rooms, balancesMap};
        }

        case 'SET_SERVICES': {
            let serviceMap = {
                    house: {}, // Сервисы, назначенные на дом
                    entrance: {}, // ... на подъезд
                    room: {} // ... на конкретную квартиру
                },
                houses = {...state.houses},
                rooms = {...state.rooms},
                services = {...state.services},
                service_types = {...state.serviceTypes},
                response = action.services;

            for (let i = 0; i < response.length; i++) {
                let service = response[i];
                services[service.service_id] = service;

                if (service.end_date && +new Date(service.end_date) < Date.now()) continue;

                if (service.house_id) { // Если услуга привязана к дому

                    let house = houses[service.house_id];
                    if (house) {
                        house.services[service.service_id] = service;
                    }
                    serviceMap.house[service.house_id] = serviceMap.house[service.house_id] || [];
                    serviceMap.house[service.house_id].push(service.service_id)

                } else if (service.entrance_id) { // Если услуга привязана к подъезду

                    serviceMap.entrance[service.entrance_id] = serviceMap.entrance[service.entrance_id] || [];
                    serviceMap.entrance[service.entrance_id].push(service.service_id);

                } else if (service.room_id) { // Если услуга привязана к квартире
                    /*
                    let room = rooms[service.room_id];
                    if (room) {
                        room.services[service.service_id] = service;
                    }
                    serviceMap.room[service.room_id] = serviceMap.room[service.room_id] || [];
                    serviceMap.room[service.room_id].push(service.service_id);
                    */
                }
            }

            // Здесь будем по конкретным квартирам разбирать услуги
            Object.keys(services).map(service_id => {

                let service = services[service_id],
                    service_type = service_types[service.service_type_id],
                    house = houses[service.house_id]

                if (!service || !service_type || +service_type.type === 2) return;

                service.name = service_type.name;
                service.is_active = !service.end_date || !Date.parse(service.end_date) || +Date.parse(service.end_date) >= +Date.now() - 86400000

                if (+service.assignment_type === 0 && house) { // общедомовая услуга

                    service.sub_type = 'house_common';

                    house.rooms.map(room_id => {
                        (serviceMap.room[room_id] = serviceMap.room[room_id] || []).push(+service.service_id);
                    })

                } else if (+service.assignment_type === 1) { // назначается на квартиры

                    if (+service.assignment_type === 1 && +service.room_id) {

                        service.sub_type = 'individual';
                        (serviceMap.room[service.room_id] = serviceMap.room[service.room_id] || []).push(+service.service_id);
                        console.log('INDIE', service.service_id, service)

                    } else if (house) {
                        service.sub_type = 'assigned';

                        house.rooms.map(room_id => {

                            if (+service.connection_type !== 1 // не всем
                                && ((+service.connection_type === 2 && service.connection_details.some(el => +el === +room_id)) // входит в исключения
                                    || (+service.connection_type === 3 && !service.connection_details.some(el => +el === +room_id)) // не входит во включения
                                )
                            ) {
                                return
                            }

                            (serviceMap.room[room_id] = serviceMap.room[room_id] || []).push(+service.service_id);

                        });
                    }
                } else if (+service.assignment_type === 2 && house) { // назначается на подъезды
                    service.sub_type = 'assigned';
                    house.rooms.map(room_id => {
                        let room = rooms[room_id];
                        if (!room) return
                        if (+service.connection_type !== 1 // не всем
                            && ((+service.connection_type === 2 && service.connection_details.some(el => +el === +room.entrance_id)) // входит в исключения
                                || (+service.connection_type === 3 && !service.connection_details.some(el => +el === +room.entrance_id)) // не входит во включения
                            )
                        ) {
                            return
                        }

                        (serviceMap.room[room_id] = serviceMap.room[room_id] || []).push(+service.service_id);

                    })
                } else if (+service.assignment_type === 3 && house) { // назначается на дома
                    // отличается от общедомовых тем, что assignment_type === 3
                    service.sub_type = 'assigned';
                    house.rooms.map(room_id => {
                        (serviceMap.room[room_id] = serviceMap.room[room_id] || []).push(+service.service_id);
                    })
                }

                services[service.service_id] = {...service};
            })


            return {...state, houses, rooms, serviceMap, services}
        }

        case 'STORE_ROOM_SERVICE': {
            let service = action.data || {},
                services = {...state.services}

            if (!service.service_id) return;
            services[service.service_id] = {...service}
            return {...state, services}
        }

        case 'SET_SERVICE_TYPES': {
            let types = action.types,
                serviceTypes = {};


            types.map(_service_type => {
                let service_type = {..._service_type};

                service_type.sub_type = +service_type.assignment_type === 0
                    ? 'house_common'  // Общедомовые услуги
                    : +service_type.assignment_type === 1 && service_type.type === 1
                        ? 'individual'    // Разовые услуги, назначаемые на квартиры -- индивидуальные
                        : 'assigned'      // Назначаемые на что-либо ещё и не разовые -- назначаемые

                serviceTypes[service_type.service_type_id] = service_type;
            });

            return {...state, serviceTypes};
        }

        case 'SET_SERVICE_TYPE_CATEGORIES': {
            let serviceTypeCategories = {},
                categories = action.categories;

            serviceTypeCategories[0] = {service_type_category_id: 0, name: 'Без категории'}
            categories.map(category => {
                serviceTypeCategories[category.service_type_category_id] = category;
            })

            return {...state, serviceTypeCategories}
        }

        case 'SET_ROOM_OWNERS': {
            let rooms = {...state.rooms},
                room = rooms[action.room_id],
                owners = {...state.owners},
                fetched_owners = action.owners || {};

            if (!action.room_id || !room) return state;

            room.owners = [];

            Object.keys(fetched_owners).map(key => {
                let owner = fetched_owners[key];

                if (!owner) return;

                room.ownerships[owner.owner_id] = Array.isArray(owner.ownership)
                    ? (owner.ownership || []).filter(el => el.room_id === room.room_id)[0] || {}
                    : owner.ownership || {};

                if (room.ownerships[owner.owner_id]) {
                    let ownership = room.ownerships[owner.owner_id];
                    if (!ownership.end_date || +(new Date(ownership.end_date).getTime()) >= +Date.now()) {
                        room.owners.push(owner.owner_id);
                    } else {
                        room.owners_history.push(owner.owner_id);
                    }
                }

                owners[fetched_owners[key].owner_id] = fetched_owners[key];

            });

            room.owners_loaded = true;

            return {...state, rooms, owners}
        }

        case 'SET_ROOM_PERSONS': {
            let rooms = {...state.rooms},
                room = rooms[action.room_id],
                persons = {...state.persons},
                entities = {...state.entities},
                residents = {...state.residents},
                dwellers = {...state.dwellers},
                owners = {...state.owners},
                fetched_owners = action.responses.owners || [],
                fetched_residents = action.responses.residents || [],
                fetched_dwellers = action.responses.dwellers || []


            if (!action.room_id || !room) return state;

            room.residents = [];
            room.residents_history = [];
            room.dwellers = [];
            room.owners = [];
            room.owners_history = [];

            fetched_owners.map(owner => {
                room.ownerships[owner.owner_id] = Array.isArray(owner.ownership)
                    ? (owner.ownership || []).filter(el => el.room_id === room.room_id)[0] || {}
                    : owner.ownership || {};

                if (room.ownerships[owner.owner_id]) {
                    let ownership = room.ownerships[owner.owner_id];
                    if (!ownership.end_date || +(new Date(ownership.end_date).getTime()) >= +Date.now()) {
                        room.owners.push(owner.owner_id);
                    } else {
                        room.owners_history.push(owner.owner_id);
                    }
                }
                owners[owner.owner_id] = owner;
            });

            fetched_residents.map(resident => {
                    if (resident.room_id !== room.room_id) return;
                    residents[resident.resident_id] = resident;
                    if (resident.person && resident.person.person_id) persons[resident.person.person_id] = resident.person;
                    if (resident.end_date && +(new Date(resident.end_date).getTime()) < +Date.now()) {
                        room.residents_history.push(resident.resident_id);
                    } else {
                        room.residents.push(resident.resident_id);
                    }
                }
            )
            fetched_dwellers.map(dweller => {
                    if (dweller.room_id !== room.room_id) return;
                    if (dweller.person && dweller.person.person_id) persons[dweller.person.person_id] = dweller.person;
                    dwellers[dweller.dweller_id] = dweller;
                    room.dwellers.push(dweller.dweller_id);
                }
            )

            return {...state, residents, dwellers, rooms, persons, entities, owners}
        }

        case 'SET_ROOM_DOCUMENTS': {
            let rooms = {...state.rooms},
                room = rooms[action.room_id],
                documents = action.documents;

            if (!documents || !documents.length || !room) return state;

            documents.map(response => {

                    let document = response.success && response.data || {};

                    if (!document || !document.document_id) return;
                    room.documents[document.document_id] = document;
                }
            );

            return {...state, rooms};
        }

        case 'SET_ALL_OWNERS': {
            let owners = {},
                rooms = {...state.rooms},
                persons = {},
                entities = {},
                owners_persons = {},
                owners_entities = {},
                persons_owners = {},
                entities_owners = {},
                fetched_owners = action.owners || [];


            fetched_owners.map(owner => {
                owners[owner.owner_id] = owner;

                // Сразу расставляем комнатам собственников
                if (Array.isArray(owner.ownership)) {
                    owner.ownership.map(ownership => {
                        if (!ownership.room_id || !rooms[ownership.room_id]) return;
                        rooms[ownership.room_id].owners.push(owner.owner_id);
                    })
                } else if (owner.ownership && owner.ownership.room_id) {
                    if (!owner.ownership.room_id || !rooms[owner.ownership.room_id]) return;
                    rooms[owner.ownership.room_id].owners.push(owner.owner_id);
                }

                // Выставляем соответствие собственника физ.лицу или юрлицу
                if (owner.person) {
                    persons[owner.person.person_id] = owner.person;
                    owners_persons[owner.owner_id] = owner.person.person_id;
                    persons_owners[owner.person.person_id] = owner.owner_id;
                } else if (owner.entity) {
                    entities[owner.entity.entity_id] = owner.entity;
                    owners_entities[owner.owner_id] = owner.entity.entity_id;
                    entities_owners[owner.entity.entity_id] = owner.owner_id;
                }
            });

            return {
                ...state,
                owners,
                owners_persons,
                persons_owners,
                owners_entities,
                entities_owners,
                persons,
                entities
            };
        }

        case 'SET_ALL_PERSONS_ENTITIES': {
            let persons = {...state.persons},
                entities = {...state.entities},
                fetched_persons = action.persons || [],
                fetched_entities = action.entities || [];

            fetched_persons.map(person => {
                persons[person.person_id] = person;
            })
            fetched_entities.map(entity => {
                entities[entity.entity_id] = entity;
            })

            return {...state, persons, entities};
        }

        case 'STORE_ROOM_OWNERS': {
            let room = {...state.room_dialog_data.room, ...action.post_data.room},
                rooms = {...state.rooms},
                owners = {...state.owners},
                persons = {...state.persons},
                entities = {...state.entities},
                owners_persons = {...state.owners_persons},
                persons_owners = {...state.persons_owners},
                owners_entities = {...state.owners_entities},
                entities_owners = {...state.entities_owners},
                room_dialog_data = {...state.room_dialog_data, room},
                documents = {...state.documents}

            console.log('POST_DATA', action.post_data);

            // Обновляем комнату
            rooms[room.room_id] = {...rooms[room.room_id], ...room}
            rooms[room.room_id].owners = [];
            rooms[room.room_id].owners_history = [];
            //rooms[ room.room_id ].ownerships = {};

            if (action.post_data.document.document_id) {
                console.log('POSTING DOCUMENT')
                rooms[room.room_id].documents[action.post_data.document.document_id] = {...action.post_data.document};
            } else {
                console.log('NOT POSTING DOCUMENT')
            }
            // Обновляем физ.лица и их отношение к собственникам (для новых собственников)
            action.post_data.owners.map(owner => {

                owners[owner.owner_id] = {...owner};

                if (owner.person && owner.person.person_id) {
                    persons[owner.person.person_id] = owner.person;
                    owners_persons[owner.owner_id] = owner.person.person_id;
                    persons_owners[owner.person.person_id] = owner.owner_id;
                } else if (owner.entity && owner.entity.entity_id) {
                    entities[owner.entity_id] = owner.entity;
                    owners_entities[owner.owner_id] = owner.entity.entity_id;
                    entities_owners[owner.entity.entity_id] = owner.owner_id;
                }

            })

            // Обновляем собственности в комнате
            Object.keys(action.post_data.ownerships).map(index => {

                let ownership = action.post_data.ownerships[index];

                if (ownership.document) {
                    ownership.document_id = ownership.document.document_id
                }

                rooms[room.room_id].ownerships[ownership.owner_id] = {...ownership}
                if (!ownership.end_date || +(new Date(ownership.end_date).getTime()) >= +Date.now()) {
                    rooms[room.room_id].owners.push(ownership.owner_id);
                } else {
                    rooms[room.room_id].owners_history.push(ownership.owner_id);
                }

            });
            return {
                ...state,
                room_dialog_data,
                persons,
                owners_persons,
                persons_owners,
                rooms,
                owners,
                documents,
                owners_entities,
                entities_owners
            }
        }

        case 'STORE_ROOM_ACCOUNTS': {

            let rooms = {...state.rooms},
                room = rooms[state.room_dialog_data.room.room_id],
                accounts = {...state.accounts}

            room.accounts = [];
            action.post_data.accounts.map(account => {
                accounts[account.account_id] = {...account}
                room.accounts.push(account.account_id);
            });

            return {...state, accounts, rooms};
        }

        case 'STORE_ROOM_RESIDENT': {
            let rooms = {...state.rooms},
                room = rooms[state.room_dialog_data.room.room_id],
                residents = {...state.residents},
                dwellers = {...state.dwellers},
                persons = {...state.persons},
                post_data = action.post_data

            if (!post_data || !room) return state;

            // Добавить документ
            if (!!post_data.document && !!post_data.document.document_id) {
                room.documents[post_data.document.document_id] = {...post_data.document}
            }
            // Добавить в persons
            if (!!post_data.person && !!post_data.person.person_id) {
                persons[post_data.person.person_id] = {...post_data.person}
            }

            // Добавить в residents / dwellers
            if (post_data.resident_id) {
                residents[post_data.resident_id] = {...post_data};
                if (post_data.document && post_data.document.document_id) {
                    residents[post_data.resident_id].document_id = post_data.document.document_id;
                }
                if (room.residents.indexOf(post_data.resident_id) < 0) room.residents.push(post_data.resident_id);
            } else if (post_data.dweller_id) {
                dwellers[post_data.dweller_id] = {...post_data};
                if (room.dwellers.indexOf(post_data.dweller_id) < 0) room.dwellers.push(post_data.dweller_id);
            }

            return {...state, rooms, residents, dwellers, persons}
        }

        case 'SET_ROOM_INDIVIDUAL_SERVICES': {
            let services = {...state.services},
                service_types = {...state.serviceTypes},
                serviceMap = {...state.serviceMap}

            action.services.map(service => {

                service.sub_type = 'individual'
                service.name = service.service_type_id && service_types[service.service_type_id] && service_types[service.service_type_id].name || 'Без названия'
                service.is_active = !service.end_date || !Date.parse(service.end_date) || +Date.parse(service.end_date) >= +Date.now() + 86400000

                services[service.service_id] = service;
                (serviceMap.room[action.room_id] = serviceMap.room[action.room_id] || []).push(service.service_id);

            })

            return {...state, services, serviceMap}
        }
        case 'SET_ROOM_SERVICE_VALUES': {
            const room_id = action.room_id
            const service_values = action.service_values
            let rooms = {...state.rooms}
            rooms[room_id].service_values = service_values
            return {...state, rooms}
        }
        case 'SET_COUNTERS': {
            let counters = {...state.counters},
                rooms = {...state.rooms},
                fetched_counters = action.counters

            fetched_counters.map(counter => {
                    let room = rooms[counter.room_id]

                    if (!room) return;

                    counters[counter.counter_id] = counter;
                    room.counters = (room.counters || []);
                    room.counters.push(counter.counter_id)
                }
            )
            return {...state, rooms, counters}
        }

        default: {
            return state;
        }
    }
}
