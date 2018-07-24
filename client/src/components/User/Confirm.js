import React from 'react';
import axios from 'axios';
import utils from '../Util/Util';
// import AppContext from '../AppContext';
// import { Link } from 'react-router-dom' ;

class Confirm extends React.Component {
    constructor(props) {
	super(props);
	console.log('HERE THEM PROPS', props);
	this.login();
    }
    
    login() {
	axios({
	    method: 'post',
	    url: utils.getAPI('auth/activate'),
	    data: this.props
	})
	    .then(response=> {
		console.log(response);
	    })
	    .catch(error => {
		console.log(error);
	    })

    }
    
    render() {
	return (
		<div className="Editor">
		<div className="About">Register</div>
		</div>
	);
    }
}

export default Confirm;
