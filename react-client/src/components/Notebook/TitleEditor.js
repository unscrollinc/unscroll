import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';

class TitleEditor extends React.Component {
  constructor(props) {
    super(props);
      this.state = {editorState: EditorState.createEmpty('XXXX')};
      this.onChange = (editorState) => this.setState({editorState});
  }
    render() {
	return (
		<h1><Editor editorState={this.state.editorState} onChange={this.onChange} /></h1>
	);
    }
}

export default TitleEditor;
