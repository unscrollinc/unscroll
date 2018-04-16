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
        return (<NotebookEvent key={'notebook__'+note[0]} note={note}/>);
    }

    makeNotebook() {        
        return (<div/>);
    }

    makeManuscriptText(note, i) {
        return (
            <NotebookManuscriptText key={'manuscript__'+note[0]} note={note}/>
        );
    }

    render() {
        return (
            <div style={{ display: this.props.status ? 'block' : 'none' }} className="Editor">
	      <button onClick={this.makeNoteBook}>+ Notebook</button>
	      <button onClick={this.makeNote}>+ Note</button>

              <br/>Load notebook:
              <input list="articles" id="myArticles" name="myArticles" />
              
	      <datalist id="articles">
		<option>Article 1</option>
		<option>Article 2</option>
	      </datalist>
	      <section>
		<TitleEditor/>
		<h1>[Untitled Notebook]</h1>
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
