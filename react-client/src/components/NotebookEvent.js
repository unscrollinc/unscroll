import React from 'react';

class NotebookEvent extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.event = {id:1000000000, 'bacon':{'waffle':{'iron':'x'}}};
    }
    
    render() {
        return(
            <div className='notebook-event'>
              <h3>Event</h3>
                <p>{this.props.text}</p>
                <input type='text' defaultValue={this.props.text}/>
            </div>
        );
    }
}

export default NotebookEvent;

