import React from 'react';
import update from 'immutability-helper';
import { Editor, RichUtils, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';


class RichTextEditor extends React.Component {

    constructor(props) {
        super(props);
	this.state = {
	    event:this.props.event,
	    edited:null,
	    editorState:EditorState.createWithContent(stateFromHTML(this.props.event[props.field]))}
    }
    
    
    onChange(key, event) {
	const es = this.state.editorState;
	const value = stateToHTML(es.getCurrentContent(), {defaultBlockTag:null});
	this.setState({editorState:event}, ()=>this.edit(key, value));
    }

    tidy(html) {
	const noTags = html.replace(/<p>|<\/p>|<br>/g, '');
	const notJustSpace = noTags.replace(/^\s+$/g, '');
	return notJustSpace;
    }
    
    edit(key, value) {
	const tidied = this.tidy(value);
	this.setState({edited:tidied}, 
		      this.props.upEdit(this.props.field, tidied));
    }

    handleKeyCommand(key, command) {
	const es = this.state.editorState;
	const newState = RichUtils.handleKeyCommand(es, command);
	if (newState) {
	    this.onChange(key, newState);
	    return 'handled';
	}
	return 'not-handled';
    }

    handleReturn(key, command) {
	//No newlines are allowed in our editor.
	return 'handled';
    }

    render() {
	const field = this.props.field;
	return (<Editor
		className={this.props.editorClass + ' ' + field + ' draft-editor'}
		key={this.props.editorClass + '-' + field}
		handleReturn={this.handleReturn}
		handleKeyCommand={ (command) => { this.handleKeyCommand(field, command); } }
		editorState={ this.state.editorState }
		onChange={(e)=>{ return this.onChange(field, e);} }/>);
    }
}

export default RichTextEditor;
