import React from 'react';
import TimelinePanelEventNoteButton from './TimelinePanelEventNoteButton';
import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

class Event extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {event:this.makeEvent()};
    }
    
    makeEvent() {
        let e = {
            'id':parseInt(Math.random() * 10000000000, 10),
            'order':1000 * (Math.random() - 0.5),
            'title':'TITLE', 
            'body':'body',
            'text':''
        };
        return e;
    };
    
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
                event={this.state.event}/>            
              <TimelinePanelEventNoteButton
                event={this.state.event}/>
              <h3>{this.state.month}/{this.props.title}</h3>
              <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Event;

