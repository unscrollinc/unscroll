import React from 'react';
import NotebookEvent from './NotebookEvent';
import AppContext from '../AppContext.js'
class Notebook extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            notes: ['one', 'two', 'three'],
            editorOn: true
        };
    }

    makeNote(note, i) {
        console.log(note);
        return (
            <NotebookEvent key={i} note={note}/>
        );
    }


    render() {
        return (
            <div style={{ display: this.props.status ? 'block' : 'none' }}
                className="Editor">
                <button onClick={this.addNote}>new</button>
                <AppContext.Consumer>
                    {(context) => {
                        return context.state.notebook.notes.map(this.makeNote)
                    }}
                </AppContext.Consumer>
            </div>
        );
    }
}

export default Notebook;
