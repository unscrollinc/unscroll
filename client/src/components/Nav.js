import React from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';
import utils from './Util/Util';
import AppContext from './AppContext';

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 16,
            ...utils.getCookie()
        };
        this.myRef = React.createRef();
    }

    edit(key, event) {
        this.setState({ [key]: event.target.value });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.context.state.notebook !==
                nextProps.context.state.notebook ||
            this.props.context.state.notes.length !==
                nextProps.context.state.notes.length ||
            this.props.context.state.authToken !==
                nextProps.context.state.authToken
        );
    }

    componentDidMount() {
        const br = this.myRef.current.getBoundingClientRect();
        this.setState({
            height: br.height,
            width: br.width
        });
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

    renderCurrentNotebook() {
        const tpcs = this.props.context.state;
        const nb = tpcs.notebook;
        if (nb !== null) {
            return (
                <Link
                    to={`/notebooks/${tpcs.username}/${nb.id}/edit`}
                    className="current-notebook"
                >
                    <span dangerouslySetInnerHTML={{ __html: nb.title }} /> [
                    {tpcs.notes.length}]
                </Link>
            );
        }
        return null;
    }

    render() {
        // const horizontal = this.state.horizontal ? 'RIGHT' : 'DOWN';
        return (
            <div
                style={{
                    width: '100%'
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
                View: <Link to="/?view=vertical">Vertical</Link>
                {this.renderLoginState()}
                {this.renderCurrentNotebook()}
            </div>
        );
    }
}

export default props => (
    <AppContext.Consumer>
        {context => <Nav {...props} context={context} />}
    </AppContext.Consumer>
);
