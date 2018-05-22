import React from 'react';
import AppContext from '../AppContext.js';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

class NotebookEvent extends React.Component {
    
    constructor(props, context) {
        super(props, context);

        this.state = {...props,
                      statusIsMoving:undefined,
                      statusIsToBeDeleted:undefined};
        
        this.onMoveClick = (context) => {
            this.setState({statusIsMoving:!this.state.statusIsMoving}, function() {
                context.updateNote(this.state);                
            });
        };

        this.onRangeClick = (context) => {
            this.setState({statusIsRangeTarget:!this.state.statusIsRangeTarget}, function() {
                context.updateNote(this.state);      
            });
        };

        this.onMoveTargetClick = (context) => {
            this.setState({statusIsMoveTarget:!this.state.statusIsMoveTarget}, function() {
                context.updateNote(this.state);
            });
        };

        this.onTextChange = (event, context) => {
            this.setState({text:event.target.value}, function() {
                context.updateNote(this.state);
            });
        };

        this.onDeleteClick = (context) => {
            console.log(context, this);
            context.deleteNote(this.state);
        };
    }

    makeTarget(uuid, context) {
        console.log('OKELY DOKELY');
        return (<div onClick={(e)=>context.endMove(uuid)} className="move-target">MOVE RIGHT HERE {uuid}</div>);
    }
    
    makeNotebookEvent(context) {

        console.log(context.state.notebook.moveFrom);
        return (
                <div key={this.props.uuid} className='notebook-event'>
                  <span className={'button active-'+this.state.statusIsMoving}
                        onClick={()=>context.startMove(this.props.uuid)}>Move</span>
                  
	          <span className={'button active-'+this.state.statusIsToBeDeleted}
                        onClick={()=>{context.deleteNote(this.props);}}>Delete</span>                            
                  
                  <h3>ORDER: {(this.props.order !== 'undefined') ? this.props.order : 'NO ORDER'}</h3>
                  <h3>{this.props.isSaved ? 'SAVED!' : 'UNSAVED'}</h3>                  
                  <h3>EVENT: {this.props.event ? this.props.event.title : 'NO EVENT'}</h3>
	          <p>{this.props.event ? this.props.event.text : 'NO EVENT TEXT'}</p>		
                  <textarea value={this.props.text}
                            onChange={(event)=>{
                                context.updateNote({uuid:this.props.uuid, text:event.target.value});                                
                    }}>
                  </textarea>

                  {context.state.notebook.moveFrom ? this.makeTarget(this.props.uuid, context) : undefined}
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

