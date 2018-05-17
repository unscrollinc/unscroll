import React from 'react';
import NotebookEvent from './NotebookEvent';
import NotebookManuscriptText from './NotebookManuscriptText';
import AppContext from '../AppContext.js';
import TitleEditor from './TitleEditor.js';

class Notebook extends React.Component {

    makeNote(note, i) {        
        return (<NotebookEvent key={'notebook__'+note[0]} note={note}/>);
    }

    makeManuscriptText(note, i) {
        return (
            <span> *
              <NotebookManuscriptText key={'manuscript__'+note[0]} note={note}/>
            </span>
        );
    }
    

    render() {
        return (
            <AppContext.Consumer>
              {(context) => {
                  return (
                      <div className="Editor">
                        <span>
	                  <button onClick={context.listNotebooks}>+ List</button>
	                  <button onClick={context.addNotebook}>+ Notebook</button>                          
                        </span>
			  
			<TitleEditor/>			  

                        <div className="notebook-event-list">
                          {Array.from(context.state.notebook.notes).map(this.makeNote)}
                        </div>
                        
                        <div className="Manuscript">
                          <h1>{context.state.notebook.title}</h1>
                          <h2>{context.state.notebook.subtitle}</h2>
                          <div className="description">{context.state.notebook.description}</div>   
                          {Array.from(context.state.notebook.notes).map(this.makeManuscriptText)}
                        </div>

                      </div>);
	      }}
            </AppContext.Consumer>                  
        );
    }
}

export default Notebook;
