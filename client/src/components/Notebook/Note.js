import React from 'react';
import AppContext from '../AppContext.js';
import RichTextEditor from '../Editor/RichTextEditor';
import {stateToHTML} from 'draft-js-export-html';
import {stateFromHTML} from 'draft-js-import-html';

class NotebookEvent extends React.Component {
    
    constructor(props) {
        super(props);

    }
    
    makeTarget(uuid, context) {
        console.log('OKELY DOKELY');
        return (<div onClick={(e)=>context.endMove(uuid)} className="move-target">MOVE RIGHT HERE {uuid}</div>);
    }

    startMove() {}

    deleteNote() {}
    
    edit() {
        
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

    renderTarget() {
        // {this.state.moveFrom ? this.makeTarget(this.props.uuid, context) : undefined}        
        return null;

    }
    renderNotebookEvent(context) {
        return (
		<div key={this.props.uuid} className='note'>
		  <div className='note-inner'>
                <div className='note-nav'>
                {/*
                      <span className={'button active-'+this.state.statusIsMoving}
                            onClick={()=>this.startMove(this.props.uuid)}>Move</span>
                      
	              <span className={'button active-'+this.state.statusIsToBeDeleted}
                            onClick={()=>{this.deleteNote(this.props);}}>Delete</span>                            
                      
                      <span className={'order ' + (this.props.isSaved ? 'saved' : 'unsaved')}>
			{(this.props.order !== 'undefined') ? '●' : 'NO ORDER'}
                      </span>
                 */}
                    </div>
		    
		    {this.showEvent()}

	      <div className="input-title">Text</div>
	      
	      <div className="rte-note-text-editor">
		<RichTextEditor
		  field='description'
		  content={this.props.text}
		  upEdit={this.edit.bind(this)}/>
	      </div>
	      <div className="input-title">Description</div>
                {this.renderTarget()}
	    </div>
		</div>  
        );
    }
    
    render() {
        return(
            <AppContext.Consumer>
		{(context) => {
                  return this.renderNotebookEvent(context);
              }}                
            </AppContext.Consumer>
        );
    }
}

export default NotebookEvent;

