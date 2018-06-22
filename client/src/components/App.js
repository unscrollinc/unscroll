import React from 'react';
import Timeline from './Timeline/Timeline';
import Timelist from './Timeline/Timelist';
import TimelineList from './Timeline/TimelineList';
import Notebook from './Notebook/Notebook';
import NotebookList from './Notebook/NotebookList';
// import TimelineEventEditor from './Timeline/TimelineEventEditor';
import {AppProvider} from './AppContext';
import { Route } from 'react-router-dom' ;
import Nav from './Nav';

import '../index.css';

const routes = [
    { path: '/',
      exact: true,
      left: () => <Timeline/>,
      right: () => null
    },
    
    { path: '/timelines',
      exact: true,
      left: () => <Timeline/>,
      right: () => <TimelineList/>
    },
    
    { path: '/my/timelines',
      exact: true,      
      left: () => <Timeline/>,
      right: () => <TimelineList my={true}/>
    },    

    { path: '/timelines/:uuid',
      left: (props) => <Timelist {...props.match.params}/>,
      right: (props) => <TimelineList {...props.match.params}/>
    },        

    { path: '/notebooks',
      exact: true,      
      left: () => <Timelist/>,
      right: () => <NotebookList/>
    },

    { path: '/my/notebooks',
      exact: true,
      left: () => <Timelist/>,
      right: () => <NotebookList my={true}/>
    },

    { path: '/notebook/:uuid',
      left: (props) => <Timelist {...props.match.params}/>,
      right: (props) => <Notebook {...props.match.params}/>
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
		    <React.Fragment>
		      <Route
			key={'left-' + index}
			path={route.path}
			exact={route.exact}
			component={route.left}
			/>
		      <Route
			key={'right-' + index}
			path={route.path}
			exact={route.exact}
			component={route.right}
			/>
		    </React.Fragment>
		))}
            </div>
	 </AppProvider>	      

        );
    }
}


export default App;

