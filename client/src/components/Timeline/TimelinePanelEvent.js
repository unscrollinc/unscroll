import React from 'react';
import TimelinePanelEventNoteButton from './TimelinePanelEventNoteButton';
import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

class Event extends React.Component {

    constructor(props, context) {
        super(props, context);
        console.log(props);
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
	      <h3><a href={this.props.event.content_url} target="_blank">{this.props.month}/{this.props.title}</a></h3>
              <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Event;

