import React from 'react';
import { AppContext } from '../AppContext';
class EventEditButton extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => {
          if (context.state.user.username === this.props.event.username) {
            return (
              <button
                onClick={() => {
                  context.addNote(this.props.event);
                }}
              >
                + Edit
              </button>
            );
          }
        }}
      </AppContext.Consumer>
    );
  }
}

export default EventEditButton;
