import cookie from 'js-cookie';
import axios from 'axios';

// Functions that take no arguments and return either null or
// something and that are usually bad/global/messy.

const API = 'http://127.0.0.1:8000/';

const util = {
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
        const username = hasAuth ? c.username : null;
        if (authToken) {
            return {'Authorization': `Token ${authToken}`};
        }
        return null;
    },
    getAPI:(noun) => {
        return `${API}${noun}`;
    },
    web: (that, method, endpoint, params, key) => {
        axios({
            method:method,
            url:`${API}/${endpoint}/`,
            headers:util.getAuthHeaderFromCookie(),
            data:params
        }).then((resp)=> {
            if (resp.data && resp.data.results) {
                that.setState({[key]:resp.data.results});
            }
            else {
                that.setState({[key]:resp.data});            
            }
        })
            .catch((err)=>{console.log(`[Error] ${method} against ${endpoint}`,
                                      {params:params, err:err})});
    }
};

export default util;

