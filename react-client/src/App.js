import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import Timeline from './components/Timeline.js';
import Editor from './components/Editor.js';
import './index.css';

class App extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            editorOn:true,
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

    renderEditButton() {
        return(
            <button onClick={this.handleEditButtonClick}>
              {this.state.editorOn ? 'Turn off Editor' : 'Turn on Editor'}
            </button>            
        );
    }

    render() {
        return (
            <div className="App">
              <div className="Nav">
                {this.renderEditButton()}
              </div>
              <ReactCursorPosition>
                <Timeline addNote={this.addNote}/>
              </ReactCursorPosition>
              <Editor status={this.state.editorOn}/>
            </div>
        );
    }
}



    

export default App;
