import React from 'react';
import update from 'immutability-helper';
import RichTextEditor from '../Editor/RichTextEditor';
import utils from '../Util/Util';
import "react-toggle/style.css";
import Toggle from 'react-toggle';



class TitleEditor extends React.Component {
    constructor(props) {
	console.log('PROPS', props);
	
        super(props);
        this.state = {
            notebook:props,
            edits:{}
        };
    }

    edit(key, value) {
	this.setState(
	    {notebook:update(this.state.notebook, {$merge: {[key]: value}}),
	     edits:update(this.state.edits, {$merge: {[key]: value}})});
    }

    done(e) {
	const _this = this;
	//_this.sweep();
//	_this.setState({edit:false});
    }

    render() {
        const nb = this.props;
        if (nb.title!==undefined) {
            return(
	    <div>
	      <div className="button-nav">

		<div className='is-published-toggle-wrapper'>
		  <div className='is-published-toggle'>
		    <button className='timeline-meta-done-button' onClick={this.done.bind(this)}>Done</button>
		    
		    <label htmlFor='is-published'>Published: </label>
		    <Toggle
		      id='is-published'
		      defaultChecked={this.state.notebook.is_public}
		      onChange={(event)=>{this.edit('is_public', event.target.checked);}} />
		  </div>
		</div>		
	      </div>
	      
	      <div className="rte-title-editor">
		<RichTextEditor
		  field='title'
		  content={this.state.notebook.title}
		  upEdit={this.edit.bind(this)}/>
	      </div>		      
	      <div className="input-title">Title</div>

	      <div className="rte-subtitle-editor">
		<RichTextEditor
		  field='description'
		  content={this.state.notebook.subtitle}
		  upEdit={this.edit.bind(this)}/>
	      </div>
	      <div className="input-title">Subtitle</div>
	      
	      <div className="rte-description-editor">
		<RichTextEditor
		  field='description'
		  content={this.state.notebook.description}
		  upEdit={this.edit.bind(this)}/>
	      </div>
	      <div className="input-title">Description</div>
	      
	    </div>
	    );
        }
	return null;
    }
}

export default TitleEditor;
