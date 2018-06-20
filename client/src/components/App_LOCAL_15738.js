import React from 'react';
import Timeline from './Timeline/Timeline';
import Timelist from './Timelist/Timelist';
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
    
  { path: '/timeline',
    left: () => <Timeline/>,
    right: () => <TimelineList/>
  },
    
  { path: '/notebook',
    left: () => <Timelist/>,
    right: () => <NotebookList/>
  },
    
  { path: '/notebook/:id',
    left: () => <Timelist/>,
    right: () => <Notebook/>
  }    
]


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
/*
        const timelineOn = this.state.timelineOn;


        const display = timelineOn ?
              (<ReactCursorPosition>
               <Timeline addNote={this.addNote}/>
               </ReactCursorPosition>) :
              (<Timelist addNote={this.addNote}/>);
*/
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

