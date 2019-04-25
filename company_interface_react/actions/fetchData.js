
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
export default function fetchData( url, options = {} ) {

    if( !(url) ) return;

    let method = !!options.method ? options.method.toLowerCase() : 'get'

    let paramString = ( method === 'get' ) && options.params ? serialize( options.params ) : '',
        data        = new FormData;

    if( (method === 'put' || method === 'post') && !!options.data ){
        data.append( "json", JSON.stringify( options.data ) );
    }

    return fetch(`https://мойжкх.рф/api/${ url }/${ paramString }` , {
        method,
        headers:    {
                    "Authorization":    `Bearer ${window.localStorage.getItem("aurelia_token")}` ,
                    "Accept":           "application/json", // old firefox fix :-)
                    "Content-Type":     "application/json"
        },
        body:       (method === 'put' || method === 'post') && !!options.data ? JSON.stringify( options.data ) : null,
        mode:       'no-cors'
    })
    .then( response => response.json() )
    .then( response => {
        if( !response || !response.statusCode || response.statusCode != 200) throw response && response.data && response.data.error || response.data || 'error'
        return response
    })
    .catch( error => {
        throw error || 'Error in fetchData()';
        //return error || 'Error in fetchData()';
    });
}
