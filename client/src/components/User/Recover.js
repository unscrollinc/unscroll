import React from 'react';
import AppContext from '../AppContext';
import { Link } from 'react-router-dom';
import { Form, Text } from 'react-form';

class Recover extends React.Component {
  render() {
    return (
      <div className="Auth">
        <h1>Recover your password</h1>
        <Form>
          {form => {
            return (
              <form>
                <table>
                  <tbody>
                    <tr>
                      <th>Email</th>
                      <td>
                        <Text field="email" type="email" />
                      </td>
                    </tr>
                    <tr>
                      <th />
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
    );
  }
}

export default Recover;
