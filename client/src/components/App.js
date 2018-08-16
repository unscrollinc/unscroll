import React from 'react';
import { Route } from 'react-router-dom';
import qs from 'qs';

import Nav from './Nav';
// import News from './News';
import Profile from './Profile';
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

import '../index.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            urlParams: null
        };
        const _this = this;
        this.routes = [
            {
                path: '/',
                exact: true,
                Workbook: () => <Timeline />
            },

            // User functions
            {
                path: '/user/register',
                exact: true,
                Workbook: () => <Register />
            },

            {
                path: '/user/login',
                exact: true,
                Workbook: () => <Login />
            },

            {
                path: '/user/logout',
                exact: true,
                Workbook: () => <Logout />
            },

            {
                path: '/user/recover',
                exact: true,
                Workbook: () => <Recover />
            },

            {
                path: '/user/activate/:uid/:token',
                exact: true,
                Workbook: props => <Confirm {...props.match.params} />
            },

            // About page
            {
                path: '/about',
                exact: true,
                Workbook: () => <About />
            },

            // Profile page
            {
                path: '/my/profile',
                exact: true,
                Workbook: () => <Profile />
            },

            {
                path: '/timelines',
                exact: true,
                Workbook: () => <TimelineList />
            },

            {
                path: '/my/timelines',
                exact: true,
                Workbook: () => <TimelineList my={true} />
            },

            {
                path: '/timelines/:user/:slug',
                exact: true,
                Workbook: props => {
                    const urlParams = this.getParams(props);
                    if (urlParams.isHorizontal) {
                        return <Timeline {...urlParams} />;
                    }
                    return <Timelist {...urlParams} />;
                }
            },

            {
                path: '/timelines/:uuid/edit',
                exact: true,
                Workbook: props => (
                    <Timelist {...props.match.params} edit={true} />
                )
            },

            {
                path: '/notebooks',
                exact: true,
                Workbook: () => <NotebookList />
            },

            {
                path: '/my/notebooks',
                exact: true,
                Workbook: () => <NotebookList my={true} />
            },
            {
                path: '/notebooks/:new',
                exact: true,
                Workbook: props => <Notebook {...props.match.params} />
            },
            {
                path: '/notebooks/:user/:id/:edit?',
                exact: true,
                Workbook: props => <Notebook {...props.match.params} />
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

        const TF = exp => {
            return exp ? true : false;
        };

        const slug = props.match.params.slug;
        const user = props.match.params.user;
        const start = E('start');
        const before = E('before');
        const searchQuery = E('q');

        const isTimeBoxed = TF(start && before);
        const isSpecificScroll = TF(slug && user);
        const isHorizontal = TF(E('view') === 'horizontal');
        const isSearchQuery = TF(searchQuery);

        const urlParams = {
            slug: slug,
            user: user,
            start: start,
            before: before,
            searchQuery: searchQuery,

            isSearchQuery: isSearchQuery,
            isTimeBoxed: isTimeBoxed,
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
                    <Nav />
                    {this.routes.map((route, index) => (
                        <React.Fragment>
                            <Route
                                key={index}
                                path={route.path}
                                exact={route.exact}
                                component={route.Workbook}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </AppProvider>
        );
    }
}

export default App;
