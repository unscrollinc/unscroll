import React from 'react';

class NotebookManuscriptText extends React.Component {
    render() {
        return(
	    <span key={this.props.uuid} className='manuscript-text'
		  dangerouslySetInnerHTML={{__html:this.props.text}}/>
        );
    }
}

export default NotebookManuscriptText;

