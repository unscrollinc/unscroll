import React from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';
import utils from './Util/Util';
import axios from 'axios';
import cookie from 'js-cookie';

class Nav extends React.Component {
    constructor(props) {
	super(props);
	this.state = utils.getCookie();
    }
    
    handleNotebookButtonClick = () => {
        this.setState(prevState => ({
            editorOn: !prevState.editorOn
        }));
    }
    
    edit(key, event) {
        this.setState({[key]:event.target.value});
    }
    
    renderNotebooksButton() {
        return(
            <button onClick={this.handleViewButtonClick}>
              {this.state.timelineOn ? 'Horizontally' : 'Vertically'}
            </button>
        );
    }
    
    login(event) {
        event.preventDefault();
        const _this = this;
        axios(
	    {method:'post',
	     url:utils.getAPI('auth/login/'),
	     data:_this.state})
            .then(function(response) {
		const token = response.data.auth_token;
		_this.setState({authToken:token},
			       ()=>{
				   cookie.set('authToken', token);
				   cookie.set('username', _this.state.username);
			       });
	    })
            .catch(err => {console.log(err);})
	    .finally(()=> {
		// Keep this tidy in case someone comes along and looks
		// inside the React state
		_this.setState({password:null});
	    });
    }

    logout(event) {
        event.preventDefault();
        const _this = this;
        axios(
	    {method:'post',
	     url:utils.getAPI('auth/logout/'),
             headers:utils.getAuthHeaderFromCookie()
            })
            .then(resp => {
		
	    })
            .catch(function(error) {
                console.log(error);
            })
            .finally(function(x) {
                cookie.remove('authToken');
                cookie.remove('username');                            
                _this.setState({
		    password:null,
		    authToken:null,
		    username:null
		});
            });
    }

    shouldComponentUpdate(nextProps, nextState) {
	return (this.state.authToken !== nextState.authToken);
    }

    renderLoginForm() {
        if (this.state.authToken) {
            return(
                <div className="login">
		  <Link to="/my/profile">{this.state.username}</Link>
                  <button className="logout" onClick={this.logout.bind(this)}>Log out</button>
                </div>
            );
        }

        return(
            <form className="login">
              <table>
                <tbody>
                  <tr>
                    <th>Username</th>
                    <td>
                      <input name="username" onChange={e=>this.edit('username', e)} type="text"/>
                    </td>
                    <th>Password</th>
                    <td>
                      <input name="password" onChange={e=>this.edit('password', e)} type="password"/>
                    </td>
                    <td colSpan="2">
                      <input className="inputButton loginButton" type="submit" onClick={this.login.bind(this)} value="login"/>
                      <Link to="/user/register">Create account</Link>
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
			  <Link className="logo" to="/">UNSCROLL</Link>
                        </td>
                        <td>
			  <Link to="/about">?</Link>
                        </td>                
                        <td>
			  <Link to="/timelines">Timelines</Link>
                        </td>
                        <td>
			  <Link to="/notebooks">Notebooks</Link>
                        </td>
		
                        <td>
                          <Search/>
                        </td>
                        <td>
                {this.renderLoginForm()}
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

