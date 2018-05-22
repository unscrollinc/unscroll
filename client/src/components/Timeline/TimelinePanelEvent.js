import React from 'react';
import EventNoteButton from '../Event/EventNoteButton';
import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

class Event extends React.Component {

    render() {
        return(
            <div style={{
                     width:this.props.width,
                     height:this.props.height,
                     left:this.props.left,
                     top:this.props.top
                 }}
                 className='event'>
              <TimelinePanelEventEditButton
                event={this.props.event}/>
              <EventNoteButton event={this.props.event}/>
	      <h3><a href={this.props.event.content_url} target="_blank">{this.props.month}/{this.props.title}</a></h3>
              <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Event;

