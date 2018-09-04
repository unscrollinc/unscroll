import React from 'react';
// import update from 'immutability-helper';
import { Editor, RichUtils, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';

// This wraps a Rich Text editor component. The key thing is that it
// does what I call "upEdit" which is that when passed a function and
// a string it sets it correctly. I'm tired.

class RichTextEditor extends React.Component {
    // Pass this an "upEdit" function in props so that when it edits it can do the right thing.
    constructor(props) {
        super(props);
        this.state = {
            edited: null,
            editorState: EditorState.createWithContent(
                stateFromHTML(this.props.content)
            )
        };
    }

    onChange(key, event) {
        const value = stateToHTML(event.getCurrentContent(), {
            defaultBlockTag: null
        });
        console.log(key, value, event, this);
        this.setState({ event });
        this.edit(key, value);
    }

    tidy(html) {
        const noTags = html.replace(/<p>|<\/p>|<br>/g, '');
        const notJustSpace = noTags.replace(/^\s+$/g, '');
        return notJustSpace;
    }

    edit(key, value) {
        const tidied = this.tidy(value);
        this.setState(
            { edited: tidied },
            this.props.upEdit(this.props.field, tidied)
        );
    }

    handleKeyCommand(key, command) {
        if (!this.props.plain) {
            const es = this.state.editorState;
            const newState = RichUtils.handleKeyCommand(es, command);
            if (newState) {
                this.onChange(key, newState);
                return 'handled';
            }
        }
        return 'not-handled';
    }

    handleReturn(key, command) {
        //No newlines are allowed in our editor.
        return 'handled';
    }

    render() {
        const field = this.props.field;
        return (
            <Editor
                className={
                    this.props.editorClass + ' ' + field + ' draft-editor'
                }
                key={this.props.editorClass + '-' + field}
                handleReturn={this.handleReturn}
                handleKeyCommand={command => {
                    this.handleKeyCommand(field, command);
                }}
                editorState={this.state.editorState}
                onChange={e => {
                    return this.onChange(field, e);
                }}
            />
        );
    }
}

export default RichTextEditor;
