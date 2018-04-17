import React from 'react';
import { AppContext } from '../AppContext';
class TimelinePanelEventNoteButton extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <AppContext.Consumer>
                  {(context) => (
                      <button
                        onClick={
                            ()=> {
                                context.editNote(this.props.event);
                            }
                        }>
                        Edit
                      </button>)}
            </AppContext.Consumer>);
    }
}

export default TimelinePanelEventNoteButton;
