import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Text, Checkbox } from 'react-form';
import utils from '../Util/Util';
import axios from 'axios';
import cookie from 'js-cookie';
import AppContext from '../AppContext';

class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  edit(key, value) {
    this.setState({ [key]: value });
  }

  login(event) {
    console.log(event, this.props.context.state);
    event.preventDefault();
    const _this = this;
    const expires = this.state.expireOnClose ? undefined : { expires: 100 };
    axios({
      method: 'post',
      url: utils.getAPI('auth/login/'),
      data: _this.state
    })
      .then(function(response) {
        const token = response.data.auth_token;
        _this.props.context.setState(
          {
            authToken: token,
            username: _this.state.username
          },
          () => {
            console.log('setting cookeis', token, expires);
            cookie.set('authToken', token, expires);
            cookie.set('username', _this.state.username, expires);
            // Keep this tidy in case someone comes along and looks
            // inside the React state
            _this.setState({ password: null });
          }
        );
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {});
  }
  componentDidUpdate() {
    console.log('DID UPDATE');
    console.log(this.props.context.state);
  }
  renderLoginForm() {
    return (
      <div className="login-form">
        <h1>Log in</h1>
        <Form>
          {form => {
            return (
              <form>
                <table>
                  <tbody>
                    <tr>
                      <th>Username</th>
                      <td>
                        <Text
                          field="username"
                          value={form.values.username}
                          onChange={e => this.edit('username', e)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Password</th>
                      <td>
                        <Text
                          field="password"
                          value={form.values.password}
                          onChange={e => this.edit('password', e)}
                          type="password"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th />
                      <td>
                        <Checkbox
                          field="forget"
                          value={form.values.expire}
                          onChange={e => this.edit('expireOnClose', e)}
                        />{' '}
                        Log me out automatically when I close my browser
                      </td>
                    </tr>
                    <tr>
                      <th />
                      <td>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          onClick={this.login.bind(this)}
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th />
                      <td>
                        <Link to="/user/recover">Forgot password?</Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>
            );
          }}
        </Form>
      </div>
    );
  }

  renderLoggedInMessage() {
    return (
      <div class="login-message">
        <h1>Welcome back, {this.props.context.state.username}</h1>
        <p>
          <Link to="/my/timelines">Your timelines</Link>
        </p>
        <p>
          <Link to="/my/notebooks">Your notebooks</Link>
        </p>
        <p>
          <Link to="/user/logout">Log out</Link>
        </p>
      </div>
    );
  }

  render() {
    return (
      <div className="Auth">
        {this.props.context.state.authToken
          ? this.renderLoggedInMessage()
          : this.renderLoginForm()}
      </div>
    );
  }
}

export default props => (
  <AppContext.Consumer>
    {context => <Login {...props} context={context} />}
  </AppContext.Consumer>
);
