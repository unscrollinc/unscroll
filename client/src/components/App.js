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

    handleNotebookButtonClick = () => {
        this.setState(prevState => ({
            editorOn: !prevState.editorOn
        }));
    }

    renderNotebooksButton() {
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
                    <th>Password</th>
                    <td>
                      <input name="password" onChange={context.handlePasswordUpdate} type="password"/>
                    </td>
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
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          [U]
                        </td>
                        <td>
                          <button>Timelines</button>
                        </td>
                        <td>
                          <button onClick={this.handleNotebookButtonClick}>Notebook</button>
                        </td>
                        <td>
                          <Search/>
                        </td>
                        <td>
                          <AppContext.Consumer>
                            {(context) => this.renderLoginForm(context)}
                          </AppContext.Consumer>

                        </td>
                      </tr>
                    </tbody>
                  </table>
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

