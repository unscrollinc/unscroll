import React from 'react';

class NotebookEvent extends React.Component {

    constructor(props, context) {
        super(props, context);
    }
    
    render() {        
        return(
            <div className='notebook-event'>
              <h3>Title: {this.props.title}</h3>
                <p>{this.props.id}</p>
                <textarea defaultValue={this.props.text}/>
            </div>
        );
    }
}

export default NotebookEvent;

