import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import queryString from 'query-string';
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
import { Route } from 'react-router-dom';

import '../index.css';

const routes = [
  {
    path: '/',
    exact: true,
    Workbook: () => null
  },

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
    path: '/user/confirm/:key',
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

  render() {
    return (
      <AppProvider>
        <div className="App">
          <Nav />
          <ReactCursorPosition>
            <Timeline />
          </ReactCursorPosition>
          {routes.map((route, index) => (
            <Route
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
