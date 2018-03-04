import React from 'react';
import NoteButton from './Add.js';

class Event extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            month:props.month
        };
    }
    render() {
        return(
            <div style={{width:this.props.width,
                         height:this.props.height,
                         left:this.props.left,
                         top:this.props.top
                 }}
                 className='event'>
              <h3>{this.state.month}/{this.props.title}</h3>
              <p>{this.props.text}</p>
              
              <NoteButton/>
              
            </div>
        );
    }
}

export default Event;

