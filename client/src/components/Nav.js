import React from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';
import utils from './Util/Util';
import axios from 'axios';
import cookie from 'js-cookie';
import AppContext from './AppContext';

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = { height: 16, ...utils.getCookie() };
        this.myRef = React.createRef();
    }

    edit(key, event) {
        this.setState({ [key]: event.target.value });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.state.height !== nextState.height ||
            this.props.context.state.authToken !==
                nextProps.context.state.authToken
        );
    }

    renderLoginState() {
        if (this.props.context.state.authToken) {
            return (
                <Link to="/user/login">
                    {this.props.context.state.username}
                </Link>
            );
        } else {
            return (
                <React.Fragment>
                    <Link to="/user/login">Log in</Link>
                    <Link to="/user/register">Register</Link>
                </React.Fragment>
            );
        }
    }

    renderLoginForm() {
        return (
            <form className="login">
                <table>
                    <tbody>
                        <tr>
                            <th>Username</th>
                            <td>
                                <input
                                    name="username"
                                    onChange={e => this.edit('username', e)}
                                    type="text"
                                />
                            </td>
                            <th>Password</th>
                            <td>
                                <input
                                    name="password"
                                    onChange={e => this.edit('password', e)}
                                    type="password"
                                />
                            </td>
                            <td colSpan="2">
                                <input
                                    className="inputButton loginButton"
                                    type="submit"
                                    onClick={this.login.bind(this)}
                                    value="login"
                                />
                                <Link to="/user/register">Create account</Link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        );
    }

    componentDidMount() {
        const br = this.myRef.current.getBoundingClientRect();
        this.setState({
            height: br.height,
            width: br.width
        });
    }

    render() {
        const horizontal = this.state.horizontal ? 'RIGHT' : 'DOWN';
        console.log('STATE IS', this.state);
        return (
            <div
                style={{
                    height: this.state.height + 'px',
                    width: '100%',
                    fontSize: this.state.height / 1.4 + 'px'
                }}
                className="Nav"
                ref={this.myRef}
            >
                <Link className="logo" to="/">
                    UNSCROLL
                </Link>
                <Link to="/about">?</Link>
                <Link to="/timelines">Timelines</Link>
                <Link to="/notebooks">Notebooks</Link>
                <Search />
                {this.renderLoginState()}
            </div>
        );
    }
}

export default props => (
    <AppContext.Consumer>
        {context => <Nav {...props} context={context} />}
    </AppContext.Consumer>
);
