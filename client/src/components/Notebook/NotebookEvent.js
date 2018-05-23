import React from 'react';
import AppContext from '../AppContext.js';
import {Editor, ContentState, EditorState} from 'draft-js';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

class NotebookEvent extends React.Component {
    
    constructor(props, context) {
        super(props, context);
        this.state = {...props,
		      editorState:EditorState.createWithContent(ContentState.createFromText(props.text))};
	
        this.onTextChange = (event, context) => {
            this.setState({text:event.target.value}, function() {
                context.updateNote(this.state);
            });
        };
    }

    makeTarget(uuid, context) {
        console.log('OKELY DOKELY');
        return (<div onClick={(e)=>context.endMove(uuid)} className="move-target">MOVE RIGHT HERE {uuid}</div>);
    }

    showEvent() {
	const e = this.props.event;
        function getText() {
            return(<div className='note-event-text'>{e.text}</div>);
        }
	if (e) {
	    return(
		<div className='note-event'>
		  <div className='note-event-title'><a target="_new" href={e.content_url}>{e.title}</a></div>
                  {getText()}
		</div>
	    );
	}
	return undefined;

    }
    makeNotebookEvent(context) {
        return (
            <div key={this.props.uuid} className='note'>
              <div className='note-inner'>
                <div className='note-nav'>                
                  <span className={'button active-'+this.state.statusIsMoving}
                        onClick={()=>context.startMove(this.props.uuid)}>Move</span>
                  
	          <span className={'button active-'+this.state.statusIsToBeDeleted}
                        onClick={()=>{context.deleteNote(this.props);}}>Delete</span>                            
                  
                  <span className={'order ' + (this.props.isSaved ? 'saved' : 'unsaved')}>
                    {(this.props.order !== 'undefined') ? '●' : 'NO ORDER'}
                  </span>
                </div>

		{this.showEvent()}
		  
		<Editor className="note-editor draft-editor"
			key={this.props.uuid}
			editorState={this.state.editorState}
			onChange={(editorState)=> {
			    this.setState({editorState},
					  ()=>
					    context.updateNote({uuid:this.props.uuid,
		  text:editorState.getCurrentContent().getPlainText()}));}}/>
                    
                  {context.state.notebook.moveFrom ? this.makeTarget(this.props.uuid, context) : undefined}
              </div>
            </div>  
        );
    }
    
    render() {
        return(
            <AppContext.Consumer>
              {(context) => {
                  return this.makeNotebookEvent(context);
              }}                
            </AppContext.Consumer>
        );
    }
}

export default NotebookEvent;

