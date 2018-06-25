import React from 'react';
import { AppContext } from '../AppContext';
class EventNoteButton extends React.Component {
    render() {
        return (
            <AppContext.Consumer>
                  {(context) => (
                      <button
                        onClick={
                            ()=> {
                                context.addNote(this.props.event);
                            }
                        }>
                        + Note
                      </button>)}
            </AppContext.Consumer>);
    }
}

export default EventNoteButton;
