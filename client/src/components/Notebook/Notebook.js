import React from 'react';
import Note from './Note';
import axios from 'axios';
import TitleEditor from './TitleEditor';
import Manuscript from './Manuscript';
import AppContext from '../AppContext';
import utils from '../Util/Util';
class Notebook extends React.Component {

    constructor(props) {
        super(props);
	console.log(props);
	this.state = {
            saved:true,
            notebook:{},
        };
    }

    makeAddNoteButton() {
        return(<button onClick={this.props.context.addNote}>+ Note</button>);
    }
    
    makeNote(note, i) {
        console.log(note, i);
                            
        return (<Note
                context={this.props.context}
                key={note.uuid}
                {...note}/>);
    }

    makeManuscriptText(note, i) {
        return (<Manuscript key={note.uuid} {...note}/>);
    }

    loadNotebook() {
        const _this = this;

        // Load the notes by UUID
        axios(
            {method:'GET',
             url:'http://127.0.0.1:8000/notes/?in_notebook__id=' + this.props.id,
             headers:utils.getAuthHeaderFromCookie()})
            .then(resp => {
		console.log('THIS PROPS', _this.props);
                _this.props.context.setState({notes:resp.data.results}
                                             //,()=>{console.log('RIGHTO', _this);}
                                            );
            })
            .catch(err=>{console.log(err);});

        // Load the notebook by UUID
        axios(
            {method:'GET',
             url:'http://127.0.0.1:8000/notebooks/' + this.props.id,
             headers:utils.getAuthHeaderFromCookie()})
            .then(resp => {
                _this.props.context.setState({notebook:resp.data, notebookIsSaved:true}
                                             //,()=>{console.log('RIGHTO', _this);}
                                            );                
            })
            .catch(err=>{console.log(err);});
    }
    
    componentDidMount() {
        this.loadNotebook();
    }

    componentDidUpdate(prevProps) {    
	if (this.props.id !== prevProps.id) {
            this.loadNotebook();
	}
    }


    renderManuscript() {
        if (this.props.context.state.notebook && this.props.context.state.notebook.url) {
            return(
		<div className='manuscript-inner'>
                  <h1>{this.props.context.state.notebook.title}</h1>
                  <h2>{this.props.context.state.notebook.subtitle}</h2>
                  <div className="description">{this.props.context.state.notebook.description}</div>   
                  {Array.from(this.props.context.state.notes).map(this.makeManuscriptText)}
		  </div>);
        }
        return null;
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
                    {this.renderManuscript()}
		    </div>);
        }

        return (
            <AppContext.Consumer>
              {(context) => {
                  return (
		      <div className="Editor">
                          <div className="Notebook">
                          <div className="notebook-main">			  
			  
		      {this.makeAddNoteButton()}
		      
                      {this.renderTitleEditor()}

                      {Array.from(context.state.notes).map(this.makeNote.bind(this))}
                      </div>
			  </div>
                        <div className='Manuscript'>
                          {this.renderManuscript()}
                        </div>
                      </div>);
	      }}
            </AppContext.Consumer>                  
        );
    }
}

export default props => (
	<AppContext.Consumer>
	  {context => <Notebook {...props} context={context}/>}
	</AppContext.Consumer>
);
