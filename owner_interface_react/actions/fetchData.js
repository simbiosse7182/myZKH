
import fetch from "cross-fetch";

function serialize( obj ) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
}

/* fetch: загружает данные с /api/url
* @param {url} url-запроса, после /api/
* @param {options} - параметры запроса
*                    method - post/get/put ...
*                    params - query-параметры для GET-запросов
*                    data - объект для put, post запросов
* */
export function fetchData( url, options = {}, mode ) {

    if( !(url) ) return;

    let method = !!options.method ? options.method.toLowerCase() : 'get'

    let headers = {
            "Authorization":    "Bearer " + +localStorage.getItem('aurelia_token'),
            "Accept":           "application/json", // old firefox fix :-)
    }

    if( method !== 'upload' ){
        headers['Content-Type'] = options.headers && options.headers['Content-Type'] || "application/json"
    }

    let paramString = ( method === 'get' ) && options.params ? serialize( options.params ) : '',
        data        = new FormData();

    if( (method === 'put' || method === 'post' || method === 'upload') && !!options.data ){
        if( method === 'upload' ){
            data.append( "file", options.data );
            data.append( "description", 'desc' )
        }else{
            data.append( "json", JSON.stringify( options.data ) );
        }
    }

    let body    =   (method === 'put' || method === 'post' || method === 'upload' )
                    ? method === 'upload'
                        ?   data
                        :   JSON.stringify( options.data )
                    : null;

    return fetch(`https://мойжкх.рф/api/${ url }/${ paramString }` , {
        method: method === 'upload' ? 'post' : method,
        headers,
        body,
        mode:       mode || 'no-cors'
    })
        .then( response => response.json() )
        .then( response => {
            if( !response || !response.statusCode || response.statusCode != 200) console.log( response && response.data && response.data.error || response.data || 'error')
            return response
        })
        .catch( error => {
            throw error || 'Error in fetchData()';
            //return error || 'Error in fetchData()';
        });
}
