import React from 'react';
import ReactCursorPosition from 'react-cursor-position';

import Search from './Search';
import Timeline from './Timeline/Timeline';
import Timelist from './Timelist/Timelist';
import Notebook from './Notebook/Notebook';
import TimelineEventEditor from './Timeline/TimelineEventEditor';
import AppContext, {AppProvider} from './AppContext';
import '../index.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search:undefined,
            timelineOn:false,
            editorOn:false
        };
    }

    handleEditButtonClick = () => {
        this.setState(prevState => ({
            editorOn: !prevState.editorOn
        }));
    }

    handleViewButtonClick = () => {
        this.setState(prevState => ({
            timelineOn: !prevState.timelineOn
        }));
    }    

    renderEditButton() {
        return(
            <button onClick={this.handleEditButtonClick}>
                {this.state.editorOn ? 'Notebook Off' : 'Notebook On'}
            </button>
        );
    }

    renderViewButton() {
        return(
            <button onClick={this.handleViewButtonClick}>
                {this.state.timelineOn ? 'Horizontally' : 'Vertically'}
            </button>
        );
    }

    renderLoginForm(context) {

        if (context.state.user.isLoggedIn) {
            return(
                    <div className="login">
                      <a href="/profile">{context.state.user.username}</a>
                      <button className="logout" onClick={context.doLogout}>Log out</button>
                      {this.renderEditButton()}
                    </div>
            );
        }

        // Otherwise...
        return(
            <form className="login">
              <table>
                <tbody>
                  <tr>
                    <th>Username</th>
                    <td>
                      <input name="email" onChange={context.handleUsernameUpdate} type="text"/>
                    </td>
                  </tr>
                  <tr>
                    <th>Password</th>
                    <td>
                      <input name="password" onChange={context.handlePasswordUpdate} type="password"/>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <button onClick={context.doRegister}>Create account</button>                      
                      <input className="inputButton loginButton" type="submit" onClick={context.doLogin} value="login"/>
                    </td>                      
                  </tr>
                </tbody>
              </table>
            </form>
        );
    }

 
    render() {
        const timelineOn = this.state.timelineOn;

        const display = timelineOn ?
              (<ReactCursorPosition>
               <Timeline addNote={this.addNote}/>
               </ReactCursorPosition>) :
              (<Timelist addNote={this.addNote}/>);

        const notebook = this.state.editorOn ?
              (<Notebook/>) : (undefined);        
        return (
            <AppProvider>           
              <div className="App">
                
                <div className="Nav">

                  <AppContext.Consumer>
                    {(context) => this.renderLoginForm(context)}
                  </AppContext.Consumer>

                  
                  <Search/>

                {this.renderViewButton()}
                
                  
                </div>

                {display}

                {notebook}

                
                <TimelineEventEditor/>
              </div>
            </AppProvider>
        );
    }
}


export default App;

