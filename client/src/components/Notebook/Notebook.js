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

    makeNotebook(notebook, i) {
	return(
	    <div key={i}>
	      <a href={notebook.uuid}>{notebook.title}</a>
	      <button>Delete</button>
	      <button>{notebook.is_private ? 'private' : 'public'}</button>	      
	    </div>
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
			  <form>
			    Public: <input type="checkbox" name="public"/>
			  </form>
		          <h1>T:{context.state.notebook.title}</h1>
		          <h2>ST:{context.state.notebook.subtitle}</h2>
		          <div>Saved: {context.state.notebook.isSaved ? 'true' : 'false'}</div>
			  
                          <div className="summary">
			    {context.state.notebook.description}
			  </div>

			  
                          {Array.from(context.state.user.notebookList).map(this.makeNotebook)}
			  
			  {/*			  
                          <div className="notebook-event-list">
                            {Array.from(context.state.notebook.notes).map(this.makeNote)}
                          </div>
                          
                          <div className="Manuscript">
                            {Array.from(context.state.notebook.notes).map(this.makeManuscriptText)}
                          </div>
			  */}
                        </div>);}}

              </AppContext.Consumer>                  
        );
    }
}

export default Notebook;
