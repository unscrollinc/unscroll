import React from 'react';
import AppContext from '../AppContext.js';
import {Editor, RichUtils, EditorState} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import {stateFromHTML} from 'draft-js-import-html';

class NotebookEvent extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {...props,
		      editorState:EditorState.createWithContent(stateFromHTML(props.text))};

	this.onChange = (editorState, context) => {
	    this.setState({editorState},
			  ()=> {
			      context.updateNote(
				  {uuid:this.props.uuid,
				   text:stateToHTML(editorState.getCurrentContent())});
			      
			  });
	};
    }
    
    handleFormattingClick(command, context) {
	this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, command), context);
    }
    
    handleKeyCommand(command, context) {
	const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
	if (newState) {
	    this.onChange(newState, context);
	    return 'handled';
	}
	return 'not-handled';
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
		      <button onClick={this.handleFormattingClick.bind(this, 'BOLD', context)}>B</button>
		      <button onClick={this.handleFormattingClick.bind(this, 'ITALIC', context)}>I</button>
		      <button onClick={this.handleFormattingClick.bind(this, 'UNDERLINE', context)}>U</button>		      		      
                
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
			    handleKeyCommand={(command)=>{this.handleKeyCommand(command, context);}}
			    editorState={this.state.editorState}
			    onChange={(e)=>{return this.onChange(e, context);}}/>
                      
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

