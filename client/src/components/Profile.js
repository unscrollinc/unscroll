import React from 'react';
import AppContext from './AppContext';
import utils from './Util/Util';

class Profile extends React.Component {
    constructor(props) {
	super(props);
	this.state = utils.getCookie();
    }
    componentDidMount() {
        document.title = 'My Profile (Unscroll)';
    }    
    render() {
        return (
                <AppContext.Consumer>
                {(context)=>{
                    return(
                        <div className="Editor">
                            <div className="Profile">
                            <h1>Profile</h1>
                            <p>Username: {this.state.username}</p>
			    <p>Full name: [Not provided]</p>
			    <p>Member since: </p>
			    <p>Notebooks: </p>
			    <p>Scrolls: </p>
			    <p>Biography: </p>
                            <br/>
                        </div>
                            </div>
                    );
                }}
            </AppContext.Consumer>
        );
    }
}

export default Profile;

