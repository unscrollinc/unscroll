import cookie from 'js-cookie';

// Functions that take no arguments and return either null or
// something.

const util = {
    getAuthHeaderFromCookie: () => {
        const c = cookie.get();
        const hasAuth = (c && c.authToken && c.username);
        const authToken = hasAuth ? c.authToken : null;
        const username = hasAuth ? c.username : null;
        if (authToken) {
            return {'Authorization': `Token ${authToken}`};
        }
        return null;
    }
};

export default util;

