import React from 'react';
import Note from './Note';
import TitleEditor from './TitleEditor';
import Manuscript from './Manuscript';
import AppContext from '../AppContext';
import utils from '../Util/Util';

class Notebook extends React.Component {

    constructor(props) {
        super(props);
	console.log(props);
    }
    getNotes() {
	utils.GET(this.props.context, 'notes', {in_notebook__id:this.props.id});
    }
    getNotebook() {
	console.log('LOADING TITLE EDITOR');
	utils.GET(this.props.context, 'notebooks', {}, this.props.id, 'notebook');
    }
    componentDidMount() {
        this.getNotebook();
        this.getNotes();	
    }
    componentDidUpdate(prevProps) {    
	if (this.props.id !== prevProps.id) {
            this.getNotebook();
            this.getNotes();	
	}
    }
    shouldComponentUpdate(nextProps, nextState) {
	return (this.props.context.state.notebook !== nextProps.context.state.notebook);
    }
    renderAddNoteButton() {
        return(<button onClick={this.props.context.addNote}>+ Note</button>);
    }
    renderNote(note, i) {
        return (<Note
                context={this.props.context}
                key={note.uuid}
                {...note}/>);
    }
    renderManuscriptText(note, i) {
        return (<Manuscript key={note.uuid} {...note}/>);
    }
    renderManuscript() {
        if (this.props.context.state.notebook
	    && this.props.context.state.notebook.url
	    && this.props.context.state.notes) {
            return(
		<div className='manuscript-inner'>
                  <h1>{this.props.context.state.notebook.title}</h1>
                  <h2>{this.props.context.state.notebook.subtitle}</h2>
                  <div className="description">{this.props.context.state.notebook.description}</div>   
                  {Array.from(this.props.context.state.notes).map(this.renderManuscriptText)}
		  </div>);
        }
        return null;
    }
    renderTitleEditor() {
	console.log('RENDER TITLE EDITOR', this.props.context.state);
	if (this.props.context.state.notebook
            && this.props.context.state.notebook.url) {
	    return (<TitleEditor context={this.props.context}/>);
	}
	return (<div>Loading</div>);
    }
    render() {
        if (!this.props.edit)  {
            return (<div key='manuscript-preview' className='Manuscript preview'>
                    {this.renderManuscript()}
		    </div>);
        }
        return (<AppContext.Consumer>
		{(context) => {
                    return (
			<div className="Editor">
                          <div className="Notebook">
                            <div className="notebook-main">			  
			      {this.renderAddNoteButton()}
			      {this.renderTitleEditor()}
			      {Array.from(context.state.notes).map(this.renderNote.bind(this))}
			    </div>
			  </div>
                          <div className='Manuscript'>
                            {this.renderManuscript()}
                          </div>
			</div>
		    );
		}}
		</AppContext.Consumer>);
    }
}
export default props => (
    <AppContext.Consumer>
      {context => <Notebook {...props} context={context}/>}
    </AppContext.Consumer>
);
