import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import AppContext from '../AppContext.js';

class TitleEditor extends React.Component {
    
    makeAddNoteButton(context) {
        if (context.state.notebook.uuid !== undefined) {
            return(<button onClick={context.addNote}>+ Note</button>);
        }
        return undefined;
    }

    makeNotebook(notebookEntry, i) {
        let context = this;
        let [key, notebook] = notebookEntry;
	return(
	    <div key={key}>
	      <a href={notebook.uuid} onClick={(e)=>{this.loadNotebook}}>{notebook.title}</a>
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
                      <div className="Meta">
			<form>
			  Public
                          <input type="checkbox" name="public"/>
			</form>
                        
		        <div>
                          Title:
                          <input type="text"
                                 value={context.state.notebook.title}
                                 onChange={(event)=>{context.notebookChange('title', event);}}/>
                        </div>
                        
		        <div>
                          Subtitle:
                          <input type="text"
                                 value={context.state.notebook.subtitle}                                               
                                 onChange={(event)=>{context.notebookChange('subtitle', event);}}/>
                        </div>
                          
                        <div className="summary">
		          Description:
                          <input type="text"
                                 value={context.state.notebook.description}
                                   onChange={(event)=>{context.notebookChange('description', event);}}/>
			</div>
                          
		        <div>
                          Saved: 
                          {context.state.notebook.isSaved ? 'true' : 'false'}
                        </div>
                      </div>);}}

              </AppContext.Consumer>                  

	);
    }
}

export default TitleEditor;
