import React from 'react';
import NotebookEvent from './NotebookEvent';
import NotebookManuscriptText from './NotebookManuscriptText';
import AppContext from '../AppContext.js';
import TitleEditor from './TitleEditor.js';
import {Editor, EditorState} from 'draft-js';
import uuidv4 from 'uuid/v4';


class Notebook extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    makeNote(note, i) {        
        return (
            <div>
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
		<select>
		<option>Article 1</option>
		<option>Article 2</option>
		</select>
		<section>
		<TitleEditor/>
		
		<h1>Title</h1>
		<h2>Subhed</h2>
		<div className="summary">The summary is here,</div>
	  
	    
                <div className="notebook-event-list">
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
		</section>
            </div>
        );
    }
}

export default Notebook;
