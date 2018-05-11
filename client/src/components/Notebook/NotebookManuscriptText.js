import React from 'react';
import AppContext from '../AppContext.js';

class NotebookManuscriptText extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = this.props.note[1];
        this.state['uuid'] = this.props.note[0];
    }

    getText(text) {
        this.setState({'text':text});        
        console.log('Getting text', this.state);
        if (this.state.text) {
            return "My text is: " + this.state.text;
        }
        else {
            return "UNDEFINED";
        }
    }

    makeManuscriptText(context) {
        return(
            <span className='manuscript-text'>
                {context.state.notebook.notes.get(this.state.uuid).text}
            </span>
        );
    }
    render() {
        return(
            <AppContext.Consumer>
              {(context) => {
                  return this.makeManuscriptText(context);
              }}                
            </AppContext.Consumer>
        );
    }
}

export default NotebookManuscriptText;

