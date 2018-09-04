import React from 'react';
import { Route } from 'react-router-dom';
import qs from 'qs';

import Nav from './Nav';
// import News from './News';
import Profile from './Profile';
import UserProfile from './User/Profile';
import About from './About';

import Login from './User/Login';
import Register from './User/Register';
import Logout from './User/Logout';
import Recover from './User/Recover';

import Confirm from './User/Confirm';
import Timeline from './Timeline/Timeline';
import Timelist from './Timeline/Timelist';
import TimelineList from './Timeline/TimelineList';
import Notebook from './Notebook/Notebook';
import NotebookList from './Notebook/NotebookList';
import { AppProvider } from './AppContext';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            urlParams: null
        };
        this.routes = [
            {
                path: '/',
                exact: true,
                Body: props => {
                    const urlParams = this.getParams(props);
                    if (urlParams.isHorizontal) {
                        return <Timeline {...urlParams} />;
                    }
                    return <Timelist {...urlParams} />;
                },
                Nav: props => <Nav {...this.getParams(props)} />
            },

            // User functions
            {
                path: '/user/register',
                exact: true,
                Body: () => <Register />,
                Nav: () => <Nav />
            },

            {
                path: '/user/login',
                exact: true,
                Body: () => <Login />,
                Nav: () => <Nav />
            },

            {
                path: '/user/logout',
                exact: true,
                Body: () => <Logout />,
                Nav: () => <Nav />
            },

            {
                path: '/user/recover',
                exact: true,
                Body: () => <Recover />,
                Nav: () => <Nav />
            },

            {
                path: '/users/:username',
                exact: true,
                Body: props => <UserProfile {...props.match.params} />,
                Nav: () => <Nav />
            },

            {
                path: '/user/activate/:uid/:token',
                exact: true,
                Body: props => <Confirm {...props.match.params} />,
                Nav: () => <Nav />
            },

            // About page
            {
                path: '/about',
                exact: true,
                Body: () => <About />,
                Nav: () => <Nav />
            },

            // Profile page
            {
                path: '/my/profile',
                exact: true,
                Body: () => <Profile />,
                Nav: () => <Nav />
            },

            {
                path: '/timelines',
                exact: true,
                Body: () => <TimelineList />,
                Nav: () => <Nav />
            },

            {
                path: '/timelines/:new',
                exact: true,
                Body: props => <Timelist new={true} />,
                Nav: () => <Nav />
            },

            {
                path: '/my/timelines',
                exact: true,
                Body: () => <TimelineList my={true} />,
                Nav: () => <Nav />
            },

            {
                path: '/timelines/:user/:slug',
                exact: true,
                Body: props => {
                    const urlParams = this.getParams(props);
                    if (urlParams.isHorizontal) {
                        return <Timeline {...urlParams} />;
                    }
                    return <Timelist {...urlParams} />;
                },
                Nav: props => <Nav {...this.getParams(props)} />
            },

            {
                path: '/timelines/:uuid/edit',
                exact: true,
                Body: props => <Timelist {...props.match.params} edit={true} />,
                Nav: () => <Nav />
            },

            {
                path: '/notebooks',
                exact: true,
                Body: () => <NotebookList />,
                Nav: () => <Nav />
            },

            {
                path: '/my/notebooks',
                exact: true,
                Body: () => <NotebookList my={true} />,
                Nav: () => <Nav />
            },

            {
                path: '/notebooks/:new',
                exact: true,
                Body: props => <Notebook {...props.match.params} />,
                Nav: () => <Nav />
            },

            {
                path: '/notebooks/:user/:id/:edit?',
                exact: true,
                Body: props => <Notebook {...props.match.params} />,
                Nav: () => <Nav />
            }
        ];
    }

    getParams(props) {
        const qp = props.location.search
            ? qs.parse(props.location.search, {
                  ignoreQueryPrefix: true
              })
            : null;

        // A little utility existence function
        const E = k => {
            if (qp && qp[k]) {
                if (
                    typeof qp[k] !== 'undefined' &&
                    typeof qp[k].valueOf() === 'string' &&
                    qp[k].length > 0
                ) {
                    return qp[k];
                }
            }
            return null;
        };

        // A true-false ternary automator so I can go TF(exp) instead
        // of writing the ternary op over and over.
        const TF = exp => {
            return exp ? true : false;
        };

        const slug = props.match.params.slug;
        const user = props.match.params.user;
        const start = E('start');
        const before = E('before');
        const searchQuery = E('q');

        const hasInterval = TF(start && before);
        const isSpecificScroll = TF(slug && user);
        // This is kind of a cheat
        const isHorizontal = TF(E('view') !== 'vertical');
        const isSearchQuery = TF(searchQuery);

        const urlParams = {
            slug: slug,
            user: user,
            start: start,
            before: before,
            searchQuery: searchQuery,

            isSearchQuery: isSearchQuery,
            hasInterval: hasInterval,
            isSpecificScroll: isSpecificScroll,
            isHorizontal: isHorizontal
        };

        return urlParams;
    }

    componentDidMount() {
        document.title = 'Unscroll: A notebook';
    }

    render() {
        return (
            <AppProvider>
                <div className="App">
                    {this.routes.map((route, index) => (
                        <React.Fragment key={index}>
                            <Route
                                key={'nav-' + index}
                                path={route.path}
                                exact={route.exact}
                                component={route.Nav}
                            />
                            <Route
                                key={'body-' + index}
                                path={route.path}
                                exact={route.exact}
                                component={route.Body}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </AppProvider>
        );
    }
}

export default App;
