import {fetchData} from "../fetchData"

const fetchRequests = () => {
    return  fetchData('requests')
                .then( response => response.success && response.data || [] )
                .catch( () => [] )
}

const fetchRoom = () => {
    return  fetchData('rooms')
        .then( response => response.success && response.data || [] )
        .catch( () => [] )
}


const fetchUser = () => {
    return  fetchData('users')
        .then( response => response.success && response.data || {} )
        .catch( () => {} )
}

const fetchRequestEntries = () => {
    return  fetchData('request-entries')
    .then( response => response.success && response.data || [] )
    .catch( () => [] )
}

const fetchRequestFiles = requests => {
    return Promise.all( Object.keys(requests)
    .map( key => {
        return  fetchData( 'uploads/requests/' + requests[key].request_id )
                    .then( response => response.success && response.data || [] )
                    .catch( () => [] )
    } ) )
    .then( responses => {
        let files = {}
        responses.map( key => key.map( response => {
            files[response.model_id] = ( files[response.model_id] || {} )
            files[response.model_id][ response.upload_id ] = response
        } ) )

        return files;
    })
}

export { fetchRoom, fetchRequests, fetchUser, fetchRequestEntries, fetchRequestFiles }
