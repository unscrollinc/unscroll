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
            <NotebookManuscriptText key={'manuscript__'+note[0]} note={note}/>
        );
    }

    deleteNotebook() {
        
    }
    
    makeNotebook(notebookEntry, i) {
        let context = this;
        let [key, notebook] = notebookEntry;
	return(
	    <div key={key}>
	      <a href={notebook.uuid}>{notebook.title}</a>
	      <button onClick={()=>{context.deleteNotebook(notebook.uuid);}}>Delete</button>
	      <button>{notebook.is_public ? 'public' : 'private'}</button>	      
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
		          <h1>Title: <input type="text"
                                            onChange={(event)=>{context.notebookChange('title', event);}}
                              value={context.state.notebook.title}/></h1>
		          <h2>SubTitle: {context.state.notebook.subtitle}</h2>
		          <div>Saved: {context.state.notebook.isSaved ? 'true' : 'false'}</div>
			  
                          <div className="summary">
			    {context.state.notebook.description}
			  </div>

			  
                          {Array.from(context.state.user.notebookList).map(this.makeNotebook.bind(context))}
			  

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
