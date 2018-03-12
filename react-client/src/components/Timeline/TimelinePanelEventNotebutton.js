import React from 'react';

class EventNoteButton extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }
    
    addNote() {

    }

    render() {
        return (
                <button
                  onClick={this.props.addNote}>
                  Note
                </button>
        );
    }
}

export default EventNoteButton;
