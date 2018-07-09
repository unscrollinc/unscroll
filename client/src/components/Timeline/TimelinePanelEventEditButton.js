import React from 'react';
import { AppContext } from '../AppContext';
class TimelinePanelEventNoteButton extends React.Component {

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
