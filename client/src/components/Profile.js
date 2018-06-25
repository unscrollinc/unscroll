import React from 'react';
import AppContext from './AppContext';

class Profile extends React.Component {

    render() {
        return (
                <AppContext.Consumer>
                {(context)=>{
                    return(
                        <div className="Editor">
                            <div className="Profile">
                            <h1>Profile</h1>
                            Username: {context.state.user.username}
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

