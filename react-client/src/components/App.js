import React from 'react';
import ReactCursorPosition from 'react-cursor-position';
import Timeline from './Timeline/Timeline';
import Notebook from './Notebook/Notebook';
import { AppProvider } from './AppContext';
import '../index.css';

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
            <AppProvider>           
                <div className="App">
                    <div className="Nav">
                        {this.renderEditButton()}
                    </div>
                    <ReactCursorPosition>
                        <Timeline addNote={this.addNote}/>
                    </ReactCursorPosition>
                    <Notebook status={this.state.editorOn}/>
                </div>
            </AppProvider>
        );
    }
}


export default App;

