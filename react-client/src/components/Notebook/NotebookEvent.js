import React from 'react';

class NotebookEvent extends React.Component {

    constructor(props, context) {
        super(props, context);
        console.log(this);
        // this.event = {id:1000000000, 'bacon':{'waffle':{'iron':'x'}}};
    }
    
    render() {
        
        return(
            <div className='notebook-event'>
              <h3>Waffle</h3>
                <p>{this.props.id}</p>
                <textarea defaultValue={this.props.text}/>
            </div>
        );
    }
}

export default NotebookEvent;

