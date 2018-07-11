import React from 'react';
import AppContext from '../AppContext.js';
import RichTextEditor from '../Editor/RichTextEditor';
import update from 'immutability-helper';

class NotebookEvent extends React.Component {
    
    makeTarget(uuid, context) {
        return (<div onClick={(e)=>context.endMove(uuid)}
                className="move-target">MOVE RIGHT HERE {uuid}</div>);
    }

    startMove() {}

    deleteNote() {}
    
    edit(k, v) {
	const _note = this.props.context.state.notes[this.props.index];
	if (_note[k]!==v) {
	    const edits = _note.__edits;
	    const updatedEdits = update( edits, { $merge: { [k]: v } } );
	    const note = update(_note,
				{$merge: {
				    [k]:v,
				    __edits:updatedEdits,
				    __isSaved:false}});
	    const notes = update(this.props.context.state.notes, {[this.props.index]: {$set: note}});
	    this.props.context.setState({notes:notes}
					//, ()=>{console.log('AAAAAAAAAAA', this.props.index, this.props.context.state.notes[this.props.index]);}
				       );
	}
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
                  <span className={'count button ' + (this.props.__isSaved ? ' saved' : ' unsaved')}
			onClick={()=>this.startMove(this.props.uuid)}>{this.props.index + 1}</span>
	          <button className='delete'
                          onClick={()=>{this.deleteNote(this.props);}}>Delete</button>
                </div>
		{this.showEvent()}
		<div className="rte-note-text-editor">
		<RichTextEditor
		  field='text'
		  content={this.props.text}
		  upEdit={this.edit.bind(this)}/>
	      </div>
	      <div className="input-title">Note text</div>
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

