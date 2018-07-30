import React from 'react';
import { Route } from 'react-router-dom';

import { DateTime, Interval } from 'luxon';
import TimeFrames from './Timeline/TimeFrames';
import axios from 'axios';
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
            query: null,
            interval: null,
            search: null
        };
    }

    componentDidMount() {
        document.title = 'Unscroll: A notebook';
    }

    renderTimeline(props) {
        /* 
           We have a couple of likely situations here:
           - User asked for a given timespan
           - User asked for a filtered timespan
           - User just searched for a term, so we need to get the timespan
           
           Basically once we have an interval we want to get a timeframe.

        */
        console.log('####', this.state.interval);
        if (this.state.interval !== null) {
            return (
                <Timeline
                    query={this.state.query}
                    interval={this.state.interval}
                />
            );
        } else {
            this.makeInterval(props);
        }
        return null;
    }

    render() {
        return (
            <AppProvider>
                <div className="App">
                    <Nav />
                <Route exact={false} path="/" component={Timeline} />
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
