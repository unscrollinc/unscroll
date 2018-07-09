import cookie from 'js-cookie';
import axios from 'axios';
import update from 'immutability-helper';

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;


// Functions that take no arguments and return either null or
// something and that are usually bad/global/messy.

const API = 'http://localhost/api/';

const util = {
    getCookie: () => {
        const c = cookie.get();
	if (c) {
            return c;
	}
	return null;
    },
    setCookie: (k,v) => {
	cookie.set(k,v);	
    },
    getUsernameFromCookie: () => {
        const c = cookie.get();
        const hasAuth = (c && c.authToken && c.username);
        const username = hasAuth ? c.username : null;
        if (username) {
            return username;
        }
        return null;
    },
    // This is purely front-end. We're comfortable checking against username on the frontend.
    isAuthed: (usernameToCheck) => {
        const username = util.getUsernameFromCookie();
        if (username === usernameToCheck) {
            return true;
        }
        return false;
    },
    getAuthHeaderFromCookie: () => {
        const c = cookie.get();
        const hasAuth = (c && c.authToken && c.username);
        const authToken = hasAuth ? c.authToken : null;
        if (authToken) {
            return {'Authorization': `Token ${authToken}`};
        }
        return null;
    },
    getAPI:(noun) => {
        return `${API}${noun}`;
    },
    webPromise: (that, method, endpoint, params, id, key) => {
	const dataKey = method==='GET' ? 'params' : 'data' ;
	const API='http://localhost/api/';
	const url = `${API}${endpoint}/${id?id+'/':''}`;
//	console.log({dataKey:dataKey, params:params, url:url});
        return axios({
            method:method,
            url:url,
            headers:util.getAuthHeaderFromCookie(),
            [dataKey]:params
        });
    },
    web: (that, method, endpoint, params, id, key) => {
	const stateEndpoint = key ? key : endpoint;
	util.webPromise(that, method, endpoint, params, id, key)
	    .then((resp)=> {
		const data = resp.data.results ? resp.data.results : resp.data;
		that.setState({[stateEndpoint]:data}
			      /*			  , ()=>{console.log(
							  'HERE COMES THAT BOI',
							  url,
							  stateEndpoint,
							  data,
							  that.state)}
			      */
			     );
            })
            .catch((err)=>{console.log('[Error]', {method:method, endpoint:endpoint, params:params, err:err})});
        return null;
    },
    getNotes: (that, id) => {
	const addSavedState = (n) =>{return update(n, {$merge: {__isSaved:true, __edits:{}}})};
	util.webPromise(that, 'GET', 'notes', {in_notebook__id:parseInt(id, 10)})
	    .then((resp)=>{
		that.setState({notes:resp.data.results.map(addSavedState)});
	    });
    },
    GET: (that, endpoint, params, id, key) => {
        util.web(that, 'GET', endpoint, params, id, key);
    },
    DELETE: (that, endpoint, id, key) => {
        util.web(that, 'DELETE', endpoint, id, key);
    },
    POST: (that, endpoint, params, id, key) => {
        util.web(that, 'POST', endpoint, params);
    },    
    PATCH: (that, endpoint, params, id, key) => {
        util.web(that, 'PATCH', endpoint, params, id, key);
    },
    PUT: (that, endpoint, params, id, key) => {
        util.web(that, 'PUT', endpoint, params, id, key);
    },    
    
};

export default util;

