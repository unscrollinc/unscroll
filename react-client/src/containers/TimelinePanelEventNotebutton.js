import React from 'react';
import {connect} from 'react-redux'
import {makeNoteFromEvent} from '../actions/index';

class EventNoteButton extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.addNote = this.addNote.bind(this);

        this.state = {};
    }

    addNote() {
        console.log("Adding event", this.props.event);
    }

    render() {
        return (
            <button
                onClick={() => makeNoteFromEvent(this.props.event)}>
                Note
            </button>
        );
    }
}

export default connect()(EventNoteButton)
