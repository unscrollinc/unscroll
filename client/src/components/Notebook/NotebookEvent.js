import React from 'react';
import AppContext from '../AppContext.js';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

class NotebookEvent extends React.Component {
    
    constructor(props, context) {
        super(props, context);
        this.state = {
            ...props.note[1],
            uuid:props.note[0],
            text:'',
	    order:0,
            statusIsMoving:false,
            statusIsRangeTarget:false,
            statusIsMoveTarget:false,
            statusIsSaved:false,
            statusIsToBeDeleted:false
        };

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
            context.deleteNote(this.state.uuid);
        };
    }


    
    makeNotebookEvent(context) {
        return (
                <div key={this.state.uuid} className='notebook-event'>
                  
                  <button>T</button>
                  <button>t</button>
                  <button>-</button>
                  <button>pic</button>

                  <button>Move</button>                                                      
                  
                  <button className={'active-'+this.state.statusIsMoving}
                          onClick={()=>this.onMoveClick(context)}>Move</button>
                  
                  <button className={'active-'+this.state.statusIsRangeTarget}
                      onClick={()=>this.onRangeClick(context)}>Set range</button>
                  
	          <button className={'active-'+this.state.statusIsMoveTarget}
                          onClick={()=>this.onMoveTargetClick(context)}>Move above here</button>
                  
	          <button className={'active-'+this.state.statusIsToBeDeleted}
                          onClick={()=>this.onDeleteClick(context)}>Delete</button>                            
                  
                <h3>{this.state.event ? this.state.event.title : 'NO EVENT'}</h3>
	        <p>{this.state.event ? this.state.event.text : 'NO EVENT TEXT'}</p>		
                  <textarea defaultValue={this.state.text}
                            onChange={(event)=>{this.onTextChange(event, context);
                    }}/>
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

