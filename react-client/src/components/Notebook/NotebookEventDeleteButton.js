import React from 'react';
import { AppContext } from '../AppContext';
class NotebookEventDeleteButton extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    delete() {
        
    }
    render() {
        return (
            <AppContext.Consumer>
              {(context) => (
                  <button
                    onClick={()=>context.deleteNote(this.props.event)}>
                    Delete
                  </button>)}
            </AppContext.Consumer>
        );
    }
}

export default NotebookEventDeleteButton;
