import React from 'react';
import TimelinePanelEventNoteButton from './TimelinePanelEventNoteButton';
import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

class Event extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

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
              <TimelinePanelEventNoteButton
                event={this.props.event}/>
		<h3>{this.props.dt.toISO()}/{this.props.title}</h3>
              <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Event;

