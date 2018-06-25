import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import queryString from 'query-string';

import Nav from './Nav';

import News from './News';

import Profile from './Profile';
import About from './About';

import Register from './User/Register';
import Confirm from './User/Confirm';

import Timeline from './Timeline/Timeline';
import Timelist from './Timeline/Timelist';
import TimelineList from './Timeline/TimelineList';

import Notebook from './Notebook/Notebook';
import NotebookList from './Notebook/NotebookList';

import { AppProvider } from './AppContext';
import { Route } from 'react-router-dom' ;

import '../index.css';

const tl = (params) => {
    const qs = (params && params.location && params.location.search)
	  ? queryString.parse(params.location.search)
	  : {};
    return (<ReactCursorPosition>
	    <Timeline {...qs}/>
	    </ReactCursorPosition>);
}

const routes = [
    { path: '/',
      exact: true,
      Research: (props) => tl(props),
      Workbook: () => <News/>
    },

    { path: '/user/register',
      exact: true,
      Research: () => tl(),
      Workbook: () => <Register/>
    },

    { path: '/user/confirm/:key',
      exact: true,
      Research: () => tl(),
      Workbook: (props) => <Confirm {...props.match.params}/>
    },
    
    { path: '/about',
      exact: true,
      Research: () => tl(),
      Workbook: () => <About/>
    },
    
    { path: '/my/profile',
      exact: true,      
      Research: () => tl(),
      Workbook: () => <Profile/>
    },    

    { path: '/timelines',
      exact: true,
      Research: (props) => tl(props),
      Workbook: () => <TimelineList/>
    },
    
    { path: '/my/timelines',
      exact: true,      
      Research: () => tl(),
      Workbook: () => <TimelineList my={true}/>
    },    

    { path: '/timelines/:uuid',
      exact: true,
      Research: (props) => <Timelist {...props.match.params}/>,
      Workbook: (props) => <TimelineList {...props.match.params}/>
    },        

    { path: '/notebooks',
      exact: true,      
      Research: () => <Timelist/>,
      Workbook: () => <NotebookList/>
    },

    { path: '/my/notebooks',
      exact: true,
      Research: () => <Timelist/>,
      Workbook: () => <NotebookList my={true}/>
    },

    { path: '/notebooks/:uuid/:edit?',
      exact: true,
      Research: (props) => <Timelist {...props.match.params}/>,
      Workbook: (props) => <Notebook {...props.match.params}/>
    }        
];

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search:undefined,
            timelineOn:false,
            editorOn:false
        };
    }
    
    render() {
        return (
            <AppProvider>
	      <div className="App">
		<Nav/>
		{routes.map((route, index) => (
                    <React.Fragment key={index}>
		      <Route
			path={route.path}
		        exact={route.exact}
		        component={route.Research}
		        />
		      <Route
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
