import cookie from 'js-cookie';
import axios from 'axios';

// Functions that take no arguments and return either null or
// something and that are usually bad/global/messy.

const API = 'http://127.0.0.1:8000/';

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
    web: (that, method, endpoint, params) => {
        const dataKey = method==='GET' ? 'params' : 'data' ;
        axios({
            method:method,
            url:`${API}${endpoint}/`,
            headers:util.getAuthHeaderFromCookie(),
            [dataKey]:params
        }).then((resp)=> {
            that.setState({[endpoint]:resp.data.results});
        })
            .catch((err)=>{console.log('[Error]', {method:method, endpoint:endpoint, params:params, err:err})});
        return null;
    },
    GET: (that, endpoint, params) => {
        util.web(that, 'GET', endpoint, params);
    },
    DELETE: (that, endpoint) => {
        util.web(that, 'DELETE', endpoint);
    },
    POST: (that, endpoint, params) => {
        util.web(that, 'POST', endpoint, params);
    },    
    PATCH: (that, endpoint, params) => {
        util.web(that, 'PATCH', endpoint, params);
    },
    PUT: (that, endpoint, params) => {
        util.web(that, 'PUT', endpoint, params);
    },    
    
};

export default util;

