import React from 'react';
import Note from './Note';
import TitleEditor from './TitleEditor';
import Manuscript from './Manuscript';
import AppContext from '../AppContext';
import utils from '../Util/Util';
import { Scrollbars } from 'react-custom-scrollbars';

class Notebook extends React.Component {
    getNotes() {
	utils.getNotes(this.props.context, this.props.id);
    }
    getNotebook() {
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
//    shouldComponentUpdate(nextProps, nextState) {
//	return (this.props.context.state.notebook !== nextProps.context.state.notebook);
//    }
    renderAddNoteButton() {
        return(<button onClick={this.props.context.addNote}>+ Note</button>);
    }
    
    renderNote(note, i) {
        return (<Note
                context={this.props.context}
                key={note.uuid}
		index={i}
                {...note}/>);
    }
    renderManuscriptTitle() {
	const nb = this.props.context.state.notebook;
        if (this.props.context.state.notebook && this.props.context.state.notebook.url) {
            return(
		<div className='manuscript-title'>
                  <h1 dangerouslySetInnerHTML={{__html:nb.title}}/>
                  <h2 dangerouslySetInnerHTML={{__html:nb.subtitle}}/>
                  <div className='description' dangerouslySetInnerHTML={{__html:nb.description}}/>
		</div>);
        }
        return null;
    }
    renderManuscriptBody() {
	const notes = this.props.context.state.notes;	
        return(<div className='manuscript-body'>
               {Array.from(notes).map(this.renderManuscriptText.bind(this))}
	       </div>);
    }

    renderManuscriptText(note, i) {
        return (<Manuscript key={note.uuid} {...note}/>);
    }

    renderTitleEditor() {
	if (this.props.context.state.notebook
            && this.props.context.state.notebook.url) {
	    return (<TitleEditor context={this.props.context}/>);
	}
	return (<div>Loading</div>);
    }

    render() {
        if (!this.props.edit)  {
            return (<div key='manuscript-preview' className='Manuscript preview'>
		    {this.renderManuscriptTitle()}
		    {this.renderManuscriptBody()}		    
		    </div>);
        }
        return (<AppContext.Consumer>
		{(context) => {
                    return (
			<React.Fragment>
			  <div className="Editor">
                            <Scrollbars
                              autoHide
                              style={{ height: '100%' }}>                                                    
                              <div className="notebook-inner">			  
				{this.renderAddNoteButton()}
				{this.renderTitleEditor()}
				{Array.from(context.state.notes).map(this.renderNote.bind(this))}
			      </div>
                            </Scrollbars>
			  </div>
			  
                          <div className='Manuscript'>
                            <Scrollbars
                              autoHide
                              style={{ height: '100%' }}>
			      
			      <div className='manuscript-inner'>
				{this.renderManuscriptTitle()}
				{this.renderManuscriptBody()}
			      </div>
                            </Scrollbars>			      
                          </div>
			</React.Fragment>                        
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
