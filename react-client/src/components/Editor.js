import React from 'react';
import NotebookEvent from './NotebookEvent.js';

class Editor extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            notes:['one', 'two', 'three'],
            editorOn:true
        };
    }
    
    makeNote(note) {
        return (
            <NotebookEvent key={Math.random()}/>
        );
    }
    
    addNote(note) {
        this.setState(prevState => ({
            notes: prevState.notes.concat(note)
        }));
    }

    render() {
        return (
            <div style={{display:this.props.status? 'block' : 'none'}}
                 className="Editor">
              <button onClick={this.addNote}>new</button>
              {this.state.notes.map(this.makeNote.bind(this))}
            </div>
        );
    }
}

export default Editor;
