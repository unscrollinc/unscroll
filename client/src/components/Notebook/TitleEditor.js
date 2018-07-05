import React from 'react';
import update from 'immutability-helper';
import RichTextEditor from '../Editor/RichTextEditor';
import { Form, Checkbox } from 'react-form';
// import AppContext from '../AppContext.js';


class TitleEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notebook:{},
            edits:{}
        };
    }

    edit(key, value) {
        console.log(key, value);
	this.setState(
	    {notebook:update(this.state.notebook, {$merge: {[key]: value}}),
	     edits:update(this.state.edits, {$merge: {[key]: value}})});
    }

    render() {
        const nb = this.props;
        if (nb.title!==undefined) {
            return(
                    <Form defaultValues={this.props.notebook}>
                    {(form) => {
                        return (
                                <form>
				<div>
				<div>Title</div>
				<RichTextEditor
			    field='title'
                            content={nb.title}
			    upEdit={this.edit.bind(this)}/>
				</div>
				
				<div>
				<div>Subtitle</div>
				<RichTextEditor
			    field='subtitle'
                            content={nb.subtitle}
			    upEdit={this.edit.bind(this)}/>
				</div>
				
				<div>
				<div>Description</div>
				<RichTextEditor
			    field='description'
                            content={nb.description}
			    upEdit={this.edit.bind(this)}/>
				</div>
                                <div>Public?
                                <Checkbox
                            field="is_public"
                            onChange={(e)=>this.edit.bind(this)}
                                />
                                </div>
                                </form>
                        );
                    }}
                </Form>
            );
        }
	return null;
    }
}

export default TitleEditor;
