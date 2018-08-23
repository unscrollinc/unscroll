import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Search from './Search';
import utils from './Util/Util';
import AppContext from './AppContext';
import ReactToolTip from 'react-tooltip';
import qs from 'qs';

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
        const tpcs = this.props.context.state;
        const npcs = nextProps.context.state;
        function ne(s) {
            return tpcs[s] !== npcs[s];
        }
        return (
            this.props.isHorizontal !== nextProps.isHorizontal ||
            ne('notebook') ||
            tpcs.notes.length !== npcs.notes.length ||
            ne('authToken')
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
        if (nb !== null && utils.isLoggedIn()) {
            return (
                <React.Fragment>
                    <Link
                        to={`/notebooks/${tpcs.username}/${nb.id}/edit`}
                        className="current-notebook"
                    >
                        <span data-tip={nb.title}>{tpcs.notes.length}</span>
                    </Link>
                    <ReactToolTip />
                </React.Fragment>
            );
        }
        return null;
    }
    renderHorizontalOrVertical() {
        const makeURL = () => {
            if (this.props.slug) {
                return (
                    '/timelines/' +
                    this.props.user +
                    '/' +
                    this.props.slug +
                    '/'
                );
            }
            return '/timelines/';
        };
        const makeQString = dir => {
            const ps =
                '?' +
                qs.stringify({
                    start: this.props.start,
                    before: this.props.before,
                    q: this.props.searchQuery,
                    view: dir
                });

            return makeURL() + ps;
        };

        if (this.props.isHorizontal !== undefined) {
            if (this.props.isHorizontal) {
                return <Link to={makeQString('vertical')}>[Line]</Link>;
            } else {
                return <Link to={makeQString('horizontal')}>[List]</Link>;
            }
        }
        return null;
    }

    render() {
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
                <NavLink to="/about">?</NavLink>
                <NavLink to="/timelines">Timelines</NavLink>

                {this.renderHorizontalOrVertical()}

                <NavLink to="/notebooks">Notebooks</NavLink>

                <Search />

                {this.renderCurrentNotebook()}
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
