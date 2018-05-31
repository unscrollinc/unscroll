import React from 'react';
import NotebookEvent from './NotebookEvent';
import NotebookManuscriptText from './NotebookManuscriptText';
import AppContext from '../AppContext';
import TitleEditor from './TitleEditor';
import NotebookList from './NotebookList';


class Notebook extends React.Component {

    makeAddNoteButton(context) {
        if (context.state.notebook.uuid !== undefined) {
            return(<button onClick={context.addNote}>+ Note</button>);
        }
        return undefined;
    }

    
    makeNote(note, i) {
        return (<NotebookEvent key={note[0]} {...note[1]}/>);
    }

    makeManuscriptText(note, i) {
        return (
            <span key={note[0]}>
              <NotebookManuscriptText key={note[0]} note={note}/>
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
                          {this.makeAddNoteButton(context)}
	                  <button onClick={context.listNotebooks}>+ List</button>
	                  <button onClick={context.addNotebook}>+ Notebook</button>
                          <span className={'status ' + (context.state.notebook.isSaved ? 'saved' : 'unsaved')}>●</span>                                                          
			</span>
			
			  <TitleEditor/>
		          
			  <NotebookList/>

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
