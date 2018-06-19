import React from 'react';
import Search from './Search';
import AppContext from './AppContext';
import { Link } from 'react-router-dom' ;


class Nav extends React.Component {
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
        return (
	      <div className="App">
                <div className="Nav">
                  <table>
                    <tbody>
		      <tr>
                        <td>
			  <Link to="/about">[U]</Link>
                        </td>
                        <td>
			  <Link to="/notebook">Notebooks</Link>
                        </td>
                        <td>
			  <Link to="/timeline">Timelines</Link>
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
              </div>

        );
    }
}


export default Nav;

