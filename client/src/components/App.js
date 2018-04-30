import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import Timeline from './Timeline/Timeline';
import Timelist from './Timelist/Timelist';
import Notebook from './Notebook/Notebook';
import TimelineEventEditor from './Timeline/TimelineEventEditor';
import { AppProvider } from './AppContext';

import '../index.css';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editorOn:false,
            timelineOn:false,            
            notes:[]
        };
    }

    addNote = (e) => {
        console.log(e);
    }

    handleEditButtonClick = () => {
        this.setState(prevState => ({
            editorOn: !prevState.editorOn
        }));
    }

    handleViewButtonClick = () => {
        this.setState(prevState => ({
            timelineOn: !prevState.timelineOn
        }));
    }    

    renderEditButton() {
        return(
            <button onClick={this.handleEditButtonClick}>
                {this.state.editorOn ? 'Hide Editor' : 'Show Editor'}
            </button>
        );
    }

    renderViewButton() {
        return(
            <button onClick={this.handleViewButtonClick}>
                {this.state.timelineOn ? 'Show List' : 'Show Timeline'}
            </button>
        );
    }

    renderLoginForm() {
        return(
            <span>
              <input type="text" value="email"/>
              <input type="text" value="password"/>              
              <input type="submit" value="login"/>
            </span>
        );
    }

    renderSearch() {
        return(
            <span>
              <input type="text" value="search"/>
              <input type="submit" value="go"/>
            </span>
        );
    }

    render() {
        const timelineOn = this.state.timelineOn;

        const display = timelineOn ?
              (<ReactCursorPosition>
               <Timeline addNote={this.addNote}/>
               </ReactCursorPosition>) :
              (<Timelist addNote={this.addNote}/>);
        
        return (
            <AppProvider>           
                <div className="App">
                  <div className="Nav">
                    {this.renderLoginForm()}
                    {this.renderEditButton()}
                    {this.renderViewButton()}
                    {this.renderSearch()}                                
                  </div>
                  {display}
                  <Notebook status={this.state.editorOn}/>
                  <TimelineEventEditor/>
                </div>
            </AppProvider>
        );
    }
}


export default App;

