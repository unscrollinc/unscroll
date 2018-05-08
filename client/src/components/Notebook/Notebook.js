import React from 'react';
import NotebookEvent from './NotebookEvent';
import NotebookManuscriptText from './NotebookManuscriptText';
import AppContext from '../AppContext.js';
import TitleEditor from './TitleEditor.js';

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

              <AppContext.Consumer>
                
                {(context) => {
                    return (
                        <div style={{ display: this.props.status ? 'block' : 'none' }} className="Editor">
                          <span>
                            <button onClick={context.addNote}>+ Note</button>
	                    <button onClick={context.listNotebooks}>+ List</button>
	                    <button onClick={context.addNotebook}>+ Notebook</button>                          
                          </span>
		          <TitleEditor/>
                          
		          <h1>{context.state.notebook.title}</h1>
		          <h2>{context.state.notebook.subhed}</h2>

                          <div className="summary">{context.state.notebook.description}</div>

                          <div className="notebook-event-list">
                            {Array.from(context.state.notebook.notes).map(this.makeNote)}
                          </div>
                          
                          <div className="Manuscript">
                            {Array.from(context.state.notebook.notes).map(this.makeManuscriptText)}
                          </div>
                        </div>);}}

              </AppContext.Consumer>                  
        );
    }
}

export default Notebook;
