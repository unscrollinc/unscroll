import React from 'react';
import { Form, Text } from 'react-form';
import { Link } from 'react-router-dom';
import utils from '../Util/Util';
import axios from 'axios';
import cookie from 'js-cookie';
import AppContext from '../AppContext';

class Logout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoggedOut: false };
    this.logout();
  }

  logout() {
    const _this = this;
    axios({
      method: 'post',
      url: utils.getAPI('auth/logout/'),
      headers: utils.getAuthHeaderFromCookie()
    })
      .then(resp => {
        this.props.context.setState({ username: null, authToken: null });
      })
      .catch(function(error) {
        console.log(error);
      })
      .finally(function(x) {
        cookie.remove('authToken');
        cookie.remove('username');
        _this.setState({
          isLoggedOut: true
        });
      });
  }

  render() {
    if (this.state.authToken) {
      return (
        <div className="Auth">
          <h1>You are still logged in.</h1>
        </div>
      );
    } else {
      return (
        <div className="Auth">
          <h1>You are logged out.</h1>
          <p>
            <Link to="/user/login">Log in</Link>
          </p>
        </div>
      );
    }
  }
}

export default props => (
  <AppContext.Consumer>
    {context => <Logout {...props} context={context} />}
  </AppContext.Consumer>
);
