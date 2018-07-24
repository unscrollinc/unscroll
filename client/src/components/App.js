import React from 'react';
import { Route } from 'react-router-dom';
import qs from 'qs';
import { DateTime, Interval } from 'luxon';
import TimeFrames from './Timeline/TimeFrames';

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

const routes = [
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

    {
        path: '/about',
        exact: true,
        Workbook: () => <About />
    },

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
        path: '/timelines/:uuid',
        exact: true,
        Workbook: props => <Timelist {...props.match.params} />
    },

    {
        path: '/timelines/:uuid/edit',
        exact: true,
        Workbook: props => <Timelist {...props.match.params} edit={true} />
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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: undefined,
            timelineOn: false,
            editorOn: false
        };
    }

    componentDidMount() {
        document.title = 'Unscroll';
    }

    onPositionChanged(param) {
        console.log(param);
    }

    makeInterval(qSpan) {
        const qParsed = qSpan
            ? qs.parse(qSpan, { ignoreQueryPrefix: true })
            : null;

        if (qParsed) {
            const s = DateTime.fromISO(qParsed.start);
            const b = DateTime.fromISO(qParsed.before);
            return Interval.fromDateTimes(s, b);
        } else {
            const s = DateTime.fromObject({ year: 2000, month: 1 }).startOf(
                'month'
            );
            const b = DateTime.fromObject({ year: 2000, month: 1 }).endOf(
                'month'
            );
            return Interval.fromDateTimes(s, b);
        }
    }

    render() {
        return (
            <AppProvider>
                <div className="App">
                    <Nav />
                    <Route
                        key="timeline"
                        path="/"
                        exact={false}
                        render={props => {
                            console.log('received those props');
                            return (
                                <Timeline
                                    key={props.location.search}
                                    interval={this.makeInterval(
                                        props.location.search
                                    )}
                                />
                            );
                        }}
                    />
                    {routes.map((route, index) => (
                        <Route
                            key={index}
                            path={route.path}
                            exact={route.exact}
                            component={route.Workbook}
                        />
                    ))}
                </div>
            </AppProvider>
        );
    }
}

export default App;
