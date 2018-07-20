import React from 'react';
import AppContext from '../AppContext';

class NewEventButton extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => (
          <button
            onClick={e => {
              context.newEvent(1000);
            }}
          >
            +New
          </button>
        )}
      </AppContext.Consumer>
    );
  }
}
export default NewEventButton;
