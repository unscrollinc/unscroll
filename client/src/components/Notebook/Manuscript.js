import React from 'react';

class NotebookManuscriptText extends React.Component {
    render() {
        return(
            <React.Fragment>
	      <span key={this.props.uuid} className='manuscript-text'
	            dangerouslySetInnerHTML={{__html:this.props.text}}/>
            </React.Fragment>
        );
    }
}

export default NotebookManuscriptText;

