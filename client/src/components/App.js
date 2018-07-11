import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
// import queryString from 'query-string';
import Nav from './Nav';
// import News from './News';
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


const routes = [
    { path: '/',
      exact: true,
      Listing: () => null,
      Workbook: () => null
    },

    { path: '/user/register',
      exact: true,
      Listing: () => null,
      Workbook: () => <Register/>
    },

    { path: '/user/confirm/:key',
      exact: true,
      Listing: () => null,
      Workbook: (props) => <Confirm {...props.match.params}/>
    },
    
    { path: '/about',
      exact: true,
      Listing: () => null,
      Workbook: () => <About/>
    },
    
    { path: '/my/profile',
      exact: true,      
      Listing: () => null,
      Workbook: () => <Profile/>
    },    

    { path: '/timelines',
      exact: true,
      Listing: () => <TimelineList/>,
      Workbook: () => null
    },
    
    { path: '/my/timelines',
      exact: true,      
      Listing: () => <TimelineList my={true}/>,
      Workbook: () => null
    },    

    { path: '/timelines/:uuid',
      exact: true,
      Listing: (props) => <TimelineList my={true}/>,
      Workbook: (props) => <Timelist {...props.match.params}/>
    },        

    { path: '/timelines/:uuid/edit',
      exact: true,
      Listing: (props) => <TimelineList my={true}/>,
      Workbook: (props) => <Timelist {...props.match.params} edit={true}/>
    },        

    { path: '/notebooks',
      exact: true,      
      Listing: () => null,
      Workbook: () => <NotebookList/>
    },

    { path: '/my/notebooks',
      exact: true,
      Listing: () => null,
      Workbook: () => <NotebookList my={true}/>
    },

    { path: '/notebooks/:user/:id/:edit?',
      exact: true,
      Listing: () => null,
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
		<ReactCursorPosition>		
		   <Timeline/>
		</ReactCursorPosition>
		{routes.map((route, index) => (
		    <React.Fragment key={index}>
			  <Route
		            path={route.path}
		            exact={route.exact}
		            component={route.Listing}
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
