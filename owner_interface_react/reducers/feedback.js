const initialState = {
    requests:   [],
    rooms:      {},
    user:       {},
    data_loaded: false,
}

const FeedbackReducer = (state = initialState, action) => {
    switch (action.type) {

        // Заполняет заявки
        case 'SET_REQUESTS': {
            let requests = {};

            ( action.requests || [] ).map( key => requests[key.request_id] = key )

            return {...state, requests}
        }

        case 'SET_ROOMS': {
            let rooms = {}
            Object.keys( (action.rooms || [] ) ).map( key => {
                let room = action.rooms[key];
                rooms[room.room_id] = room;
            })
            return {...state, rooms}
        }


        case 'SET_USER': {
            let user = action.user || {}

            return {...state, user}
        }

        case 'SET_REQUEST_ENTRIES': {

            let requests = { ...state.requests };

            ( action.entries || [] ).map( entry => {
                if( !entry.request_id || ! requests[entry.request_id] ) return;
                requests[ entry.request_id ].entries = (requests[ entry.request_id ].entries || []);
                requests[ entry.request_id ].entries.push( entry )

                if( !requests[ entry.request_id ].last_entry || +entry.created > requests[ entry.request_id ] ){
                    requests[ entry.request_id ].last_entry = +entry.created;
                }

                // if(entry.employee && entry.status && +entry.status !== +requests[ entry.request_id ].status ){
                //     requests[ entry.request_id ].status = +entry.status
                // }
            } )

            return {...state, requests}
        }

        case 'SET_DATA_LOADED': {
            return {...state, data_loaded: true }
        }

        case 'SET_FILES': {
            return {...state, files: action.files}
        }

        case 'APPEND_REQUEST_ENTRY': {
            let requests = { ...state.requests }
            if( !requests || !requests[ action.entry.request_id ]) return;

            requests[ action.entry.request_id ].entries = ( requests[ action.entry.request_id ].entries || [] )
            requests[ action.entry.request_id ].entries.unshift(action.entry);

            return {...state, requests}
        }

        case 'APPEND_REQUEST': {
            let requests = { ...state.requests },
                files = {...state.files}

            if( !requests) return;

            requests[ action.request.request_id ] = action.request
            files[ action.request.request_id ] = action.files;

            return {...state, requests, files}
        }

        default: {
            return state
        }
    }
}

export default FeedbackReducer
