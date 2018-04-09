import React from 'react';
import NotebookEvent from './NotebookEvent';
import NotebookManuscriptText from './NotebookManuscriptText';
import AppContext from '../AppContext.js';
import uuidv4 from 'uuid/v4';


class Notebook extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    makeNote(note, i) {        
        return (
            <div>makeNote()
              <NotebookEvent key={'notebook__'+note[0]} note={note}/>
            </div>
        );
    }

    makeManuscriptText(note, i) {
        return (
            <NotebookManuscriptText key={'manuscript__'+note[0]} note={note}/>
        );
    }

    render() {
        return (
            <div style={{ display: this.props.status ? 'block' : 'none' }}
                 className="Editor">
              <button onClick={this.makeNote}>New</button>
                <div class="notebook-event-list">
                  <AppContext.Consumer>
                    {(context) => {
                        return Array.from(context.state.notebook.notes).map(this.makeNote);
                    }}
                  </AppContext.Consumer>
                </div>

                <div className="Manuscript">
                  <AppContext.Consumer>
                    {(context) => {
                        return Array.from(context.state.notebook.notes).map(this.makeManuscriptText);
                    }}
                  </AppContext.Consumer>                  
                </div>
            </div>
        );
    }
}

export default Notebook;
