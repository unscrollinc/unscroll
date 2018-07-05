import React from 'react';
// import AppContext from '../AppContext';
// import { Link } from 'react-router-dom' ;
// TextArea, Checkbox 
import { Form, Text } from 'react-form';

class Register extends React.Component {
    
    render() {
        return (
            <div className="Editor">
              <div className="About">
                <h1>Register for Unscroll</h1>
                <Form>
                  {(form) => {
                      return (
                          <form>
                            <table>
                              <tbody>
                                <tr>
                                  <th>Username</th>
                                  <td><Text field="username"/></td>
                                </tr>
                                <tr>
                                  <th>Full Name</th>
                                  <td><Text field="fullname"/></td>
                                </tr>                                
                                <tr>
                                  <th>Password</th>
                                  <td><Text field="password" type="password"/></td>
                                </tr>
                                <tr>
                                  <th>Confirm password</th>
                                  <td><Text field="password-confirm" type="password"/></td>
                                </tr>
                                <tr>
                                  <th>Email</th>
                                  <td><Text field="email" type="email"/></td>
                                </tr>
                                <tr>
                                  <th></th>
                                  <td>
                                    <button type="submit" className="btn btn-primary">
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
                </div>
        );
    }
}


export default Register;

