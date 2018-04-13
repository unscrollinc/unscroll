import React from 'react';
import NotebookEventDeleteButton from './NotebookEventDeleteButton';
//import NotebookEventMoveButton from './NotebookEventMoveButton';
//import NotebookEventRangeButton from './NotebookEventRangeButton';
import AppContext from '../AppContext.js';

class NotebookEvent extends React.Component {
    
    constructor(props, context) {
        super(props, context);
        this.state = props.note[1];
        this.state.uuid = props.note[0];
        this.state.text = '';
    }
    
    makeNotebookEvent(context) {
        return (
           <div className='notebook-event'>
		<button>Move</button>
		<button>Set range</button>
		<button>Move here</button>		
		<NotebookEventDeleteButton/>
		<h3>{this.state.title}</h3>
		<p>{this.state.id}</p>
		<p>{this.state.text}</p>		
              <textarea defaultValue={this.state.text}
                        onChange={
                            (event)=>{
                                this.setState({
                                    text:event.target.value
                                });
                                this.state = context.updateText(this.state);
                            }
                }/>
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

