import cookie from 'js-cookie';

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
    }
};

export default util;

