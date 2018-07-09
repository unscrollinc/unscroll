import React from 'react';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';
import { Route, Redirect } from 'react-router';
import RichTextEditor from '../Editor/RichTextEditor';
// import utils from '../Util/Util';
import "react-toggle/style.css";
import Toggle from 'react-toggle';

class TitleEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notebook:props,
            edits:{}
        };
    }

    edit(key, value) {
	this.props.context.setState(
	    {notebook:update(this.props.context.state.notebook,
                             {$merge: {[key]: value}}),
	     notebookEdits:update(this.props.context.state.notebookEdits,
                                  {$merge: {[key]: value}})});
    }

    done(e) {
	const nb = this.props.context.state.notebook;
	return(<Redirect to={`/notebooks/${nb.user_username}/${nb.id}/`}/>);
    }
    renderDoneButton() {
	return(
	    <Route render={({ history}) => (
		<button
		  type='button'
		  onClick={() => { history.push('/new-location'); }}>
		  Click Me!
		</button>)}/>
	);
/*	return(<button className='timeline-meta-done-button' onClick={(e)=>}>Done</button>)*/
    }

    render() {
        const nb = this.props.context.state.notebook;
        if (nb.title!==undefined) {
            return(
	    <div>
	      <div className="button-nav">

		<div className='is-published-toggle-wrapper'>
		  <div className='is-published-toggle'>
		    {this.renderDoneButton()}
		    
		    <label htmlFor='is-published'>Published: </label>
		    <Toggle
		      id='is-published'
		      defaultChecked={nb.is_public}
		      onChange={(event)=>{this.edit('is_public', event.target.checked);}} />
		  </div>
		</div>		
	      </div>
	      
	      <div className="rte-title-editor">
		<RichTextEditor
		  field='title'
		  content={nb.title}
		  upEdit={this.edit.bind(this)}/>
	      </div>		      
	      <div className="input-title">Title</div>

	      <div className="rte-subtitle-editor">
		<RichTextEditor
		  field='subtitle'
		  content={nb.subtitle}
		  upEdit={this.edit.bind(this)}/>
	      </div>
	      <div className="input-title">Subtitle</div>
	      
	      <div className="rte-description-editor">
		<RichTextEditor
		  field='description'
		  content={nb.description}
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
