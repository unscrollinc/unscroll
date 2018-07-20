import React from 'react';
// import AppContext from '../AppContext';
// import { Link } from 'react-router-dom' ;
// TextArea, Checkbox
import validator from 'email-validator';
import { Form, Text } from 'react-form';
import axios from 'axios';
import utils from '../Util/Util';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  validate(k, v) {
    if (k === 'email') {
      return validator.validate(v);
    }
    if (k === 'password_confirm') {
      return this.state.password === this.state.password_confirm;
    }
    return true;
  }
  edit(key, value) {
    this.setState({
      [key]: value,
      ['__valid_' + key]: this.validate(key, value)
    });
  }

  renderError(key) {
    const k = this.state['__error_' + key];
    return <div class="error">{k ? k.join('; ') : null}</div>;
  }
  register(event) {
    event.preventDefault();
    const _this = this;
    console.log(_this);
    axios({
      method: 'post',
      url: utils.getAPI('auth/register/'),
      data: _this.state
    })
      .then(function(response) {})
      .catch(err => {
        const erd = err.response.data;
        const errs = Object.keys(err.response.data).reduce((h, k, i, s) => {
          console.log('HHHHHHHHHHHHHH', h);
          h['__error_' + k] = erd[k];
          return h;
        }, {});
        this.setState(errs);
        console.log('#######', errs);
      })
      .finally(() => {});
  }

  componentDidUpdate() {}

  render() {
    return (
      <div className="Auth">
        <h1>Register for Unscroll</h1>
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
                        {this.renderError('username')}
                      </td>
                    </tr>
                    <tr>
                      <th>First Name</th>
                      <td>
                        <Text
                          field="first_name"
                          value={form.values.first_name}
                          onChange={e => this.edit('first_name', e)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Last Name</th>
                      <td>
                        <Text
                          field="last_name"
                          value={form.values.last_name}
                          onChange={e => this.edit('last_name', e)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Password</th>
                      <td>
                        <Text
                          field="password"
                          type="password"
                          onChange={e => this.edit('password', e)}
                        />
                        {this.renderError('password')}
                      </td>
                    </tr>
                    <tr>
                      <th>Confirm password</th>
                      <td>
                        <Text
                          field="password_confirm"
                          type="password"
                          onChange={e => this.edit('password_confirm', e)}
                        />
                        {this.renderError('password')}
                      </td>
                    </tr>
                    <tr>
                      <th>
                        Email{' '}
                        {this.state.__valid_email
                          ? 'Looks valid!'
                          : '(Need a valid email)'}
                      </th>
                      <td>
                        <Text
                          field="email"
                          type="email"
                          onChange={e => this.edit('email', e)}
                        />
                        {this.renderError('password')}
                      </td>
                    </tr>
                    <tr>
                      <th />
                      <td>
                        <button
                          type="submit"
                          onClick={this.register.bind(this)}
                          className="btn btn-primary"
                        >
                          Submit
                        </button>
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
}

export default Register;
