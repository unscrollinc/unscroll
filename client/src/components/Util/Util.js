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
            .catch((err)=>{console.log('[Error]',
				       {method:method,
					endpoint:endpoint,
					params:params,
					err:err})});
        return null;
    },
    sortNotes: (notes) => {
	// Sort by linked uuids. notes have uuids and
	// following_uuids. If a following_uuid is null that's the
	// last in the sequence. If there's more than one null it just
	// pushes them to the end and resequences.

	function sortLinkedUUIDs(notes) {
	    /* This is a trash function for a trash world.

	       It takes the notes and it links them together into a
	       chain.  
	       
	       Object O in array A has 'uuid' and 'following_uuid' keys
	       
	       We make a dict D of the form D[O.uuid] = O

	       Make a dict hashed of the form D[O.uuid]=O.following_uuid

	       Make a dict inverted of the form D[O.following_uuid] = O.uuid

	       Keeping in mind that O.following_uuid can be null.

	       Now make an empty array B.

	       Make an array from the keys of hashed.

	       I stopped writing here because programming is very
	       tiring.
	    */
	    const hashedNotes = notes.reduce(
		(hashes, n) => { hashes[n.uuid]=n;
				 return hashes}, {});
	    
	    function sortIt(notes) {

		const hashed = notes.reduce(
		    (hashes, n) =>
			{ const fid = n.following_uuid?n.following_uuid:null;
			  hashes[n.uuid]=fid;
			  return hashes}, {});
		
		const inverted = Object.keys(hashed).reduce(function(obj,key){
		    obj[ hashed[key] ] = key;
		    return obj;
		},{});
		
		let global = [];
		
		const ks =  Object.keys(hashed);
		for (let i=0;i<ks.length;i++) {
		    if (global.length === ks.length) {
			return global;
		    }
		    if (i===0) {
			global.push(ks[i]);
		    }
		    else if (hashed[ks[i]]===null) {
			global.push(ks[i]);
		    }
		    
		    else {
			const kfirst = global[0];
			if (inverted[kfirst]||kfirst==='null') {
		    	    global.unshift(inverted[kfirst]);
			}
			
			const klast = global[global.length - 1];
			if (hashed[klast]||hashed[klast]===null) {
			    global.push(hashed[klast]);	
			}		    
		    }
		}
		return global;
	    }
	    const resorted = sortIt(notes);
	    console.log('SORTIT>>>>',resorted);
	    
	    return resorted.map((uuid)=>{return hashedNotes[uuid]});
	}
	const sorted = sortLinkedUUIDs(notes);
	const updated = sorted.map(
	    (current, i) => {
		console.log('SORTING>>>', current, i);

		const next = sorted[i+1];
		const next_uuid = next ? next.uuid : null;
		// This is the last one; it's supposed to be null
		if (sorted.length === (i + 1)) {
		    if (current.following_uuid) {
			return update(current, {$merge:
						{following_uuid:null,
						 __isSaved:false,
						 __edits:{following_uuid:null}}});
		    }
		    else {
			return current;
		    }
		}
		// Everything else
		else {
		    if (current.following_uuid!==next_uuid) {
			const updated = update(current, {$merge:
						{following_uuid:next.uuid,
						 __isSaved:false,						 
						 __edits:{following_uuid:next.uuid}}});
			return updated;
			
		    }
		    else {
			return current;
		    }
		}
	    });
	return updated;
    },
    getNotes: (that, id) => {
	util.webPromise(that, 'GET', 'notes', {in_notebook__id:parseInt(id, 10)})
	    .then((resp)=>{
		const addSavedState = (n) =>{return update(n, {$merge: {__isSaved:true, __edits:{}}})};
		const notes = resp.data.results.map(addSavedState);
		console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$NOTES', notes);
		if (notes.length > 0) {
		    const sorted = util.sortNotes(notes);
		    console.log({SORTED:sorted});
		    that.setState({notes:sorted});
		}
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
    removeLocalKeys(o) {
	return Object.keys(o).map(
	    (k) => {
		if (k.substring(0,2)!=='__') {
		    return {[k]:o[k]}}
	    });
    }
    
};

export default util;

