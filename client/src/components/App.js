import React from 'react';
import Nav from './Nav';
import Profile from './Profile';
import About from './About';
import News from './News';

import Timeline from './Timeline/Timeline';
import Timelist from './Timeline/Timelist';
import TimelineList from './Timeline/TimelineList';
import Notebook from './Notebook/Notebook';
import NotebookList from './Notebook/NotebookList';
// import TimelineEventEditor from './Timeline/TimelineEventEditor';
import {AppProvider} from './AppContext';
import { Route } from 'react-router-dom' ;


import '../index.css';

const routes = [
    { path: '/',
      exact: true,
      Research: () => <Timeline/>,
      Workbook: () => <News/>
    },

    { path: '/about',
      exact: true,
      Research: () => <Timeline/>,
      Workbook: () => <About/>
    },
    
    { path: '/my/profile',
      exact: true,      
      Research: () => <Timeline/>,
      Workbook: () => <Profile/>
    },    

    { path: '/timelines',
      exact: true,
      Research: () => <Timeline/>,
      Workbook: () => <TimelineList/>
    },
    
    { path: '/my/timelines',
      exact: true,      
      Research: () => <Timeline/>,
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

    { path: '/notebooks/:uuid',
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
