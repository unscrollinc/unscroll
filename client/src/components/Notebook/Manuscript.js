import React from 'react';

class NotebookManuscriptText extends React.Component {
  render() {
    return (
      <React.Fragment>
        <span
          key={this.props.uuid}
        className={'manuscript-text ' + this.props.kind}
          dangerouslySetInnerHTML={{ __html: this.props.text }}
        />
      </React.Fragment>
    );
  }
}

export default NotebookManuscriptText;
