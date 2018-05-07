import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import Timeline from './Timeline/Timeline';
import Timelist from './Timelist/Timelist';
import Notebook from './Notebook/Notebook';
import TimelineEventEditor from './Timeline/TimelineEventEditor';
import AppContext, {AppProvider} from './AppContext';
import axios from 'axios';
import cachios from 'cachios';
import '../index.css';

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editorOn:false,
            timelineOn:false,            
            notes:[],
            username:undefined,
            password:undefined,
            auth_token:undefined
        };
    }

    addNote = (e) => {
        console.log(e);
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
                {this.state.editorOn ? 'Notebook' : 'Notebook'}
            </button>
        );
    }

    renderViewButton() {
        return(
            <button onClick={this.handleViewButtonClick}>
                {this.state.timelineOn ? 'Timelist' : 'Timeline'}
            </button>
        );
    }

    renderLoginForm(context) {
        if (context.state.user.isLoggedIn) {
            return(
                <div className="login">
                  <a href="/profile">{context.state.user.username}</a>
                  <button className="logout" onClick={context.doLogout}>Log out</button>
                </div>);
        }
        return(
            <form class="login">
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
                    <td colspan="2">
                      <button onClick={context.doRegister}>Create account</button>                      
                      <input className="inputButton loginButton" type="submit" onClick={context.doLogin} value="login"/>
                    </td>                      
                  </tr>
                </tbody>
              </table>
            </form>
        );
    }

    renderSearch() {
        return(
            <div className="searchBox">
              <span className="subsearch">
                Search: <input type="text" value="all events"/>
              </span>
              <span className="subsearch">
                By: <input type="text" value="all creators"/>
              </span>
              <span className="subsearch">                
                In: <input type="text" value="all scrolls"/>
              </span>
              <span className="subsearch">                
                About: <input type="text" value="all topics"/>
              </span>
            </div>
        );
    }

    render() {
        const timelineOn = this.state.timelineOn;

        const display = timelineOn ?
              (<ReactCursorPosition>
               <Timeline addNote={this.addNote}/>
               </ReactCursorPosition>) :
              (<Timelist addNote={this.addNote}/>);
        
        return (
            <AppProvider>           
                <div className="App">
                  <div className="Nav">
                    <AppContext.Consumer>
                      {(context) => this.renderLoginForm(context)}
                    </AppContext.Consumer>                      
                    <AppContext.Consumer>                      
                      {(context) => this.renderSearch(context)}
                    </AppContext.Consumer>
                    {this.renderEditButton()}
                    {this.renderViewButton()}
                    <button>+ Scroll</button>
                  </div>
                  {display}
                  <Notebook status={this.state.editorOn}/>
                  <TimelineEventEditor/>
                </div>
            </AppProvider>
        );
    }
}


export default App;

