import React from 'react';
// import update from 'immutability-helper';
import ReactQuill from 'react-quill'; // ES6

// This wraps a Rich Text editor component. The key thing is that it
// does what I call "upEdit" which is that when passed a function and
// a string it sets it correctly. I'm tired.

class RichTextEditor extends React.Component {
    // Pass this an "upEdit" function in props so that when it edits it can do the right thing.
    constructor(props) {
        super(props);
        this.state = {
            edited: null,
            text: this.props.content
        };
    }

    matchChar(delta, match) {
        // does the delta match a regular expression?
        if (delta.ops && delta.ops.length > 1 && delta.ops[1].insert) {
            const m = delta.ops[1].insert.match(match);
            const matched = m && m.length > 0 ? true : false;
            return matched;
        }
    }

    onChange(content, delta, source, editor) {
        // console.log(content, delta, source, editor, this);
        // Ignore newlines;
        if (!this.matchChar(delta, /\n/)) {
            this.setState({ text: content });
        }
        this.edit(this.props.field, content);
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
        /*
        if (!this.props.plain) {
            const es = this.state.editorState;
            const newState = RichUtils.handleKeyCommand(es, command);
            if (newState) {
                this.onChange(key, newState);
                return 'handled';
            }
        }
        return 'not-handled';
        */
    }

    handleReturn(key, command) {
        //No newlines are allowed in our editor.
        return 'handled';
    }

    render() {
        return (
            <ReactQuill
                className={this.props.field}
                value={this.state.text}
                theme={null}
                onChange={this.onChange.bind(this)}
            />
        );
    }
}

export default RichTextEditor;
