import React from 'react';
import EventNoteButton from '../../containers/TimelinePanelEventNotebutton.js';

class Event extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            month:props.month
        };
        
        this.event = {id:1000000000, 'bacon':{'waffle':{'iron':'x'}}};
    }
    
    render() {
        return(
            <div style={{width:this.props.width,
                         height:this.props.height,
                         left:this.props.left,
                         top:this.props.top
                 }}
                 className='event'>
              <EventNoteButton
                event={this.event}
                {...this.props}/>
              <h3>{this.state.month}/{this.props.title}</h3>
              <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Event;

