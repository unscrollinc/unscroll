import React from 'react';
import AppContext from './AppContext';

class Profile extends React.Component {

    render() {
        return (
                <AppContext.Consumer>
                {(context)=>{
                    return(<div className="Profile">Profile</div>);
                }}
o            </AppContext.Consumer>
        );
    }
}

export default Profile;

