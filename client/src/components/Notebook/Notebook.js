import React from 'react';
import Note from './Note';
import axios from 'axios';
import TitleEditor from './TitleEditor';
import Manuscript from './Manuscript';
import AppContext from '../AppContext';
import Util from '../Util/Util';
class Notebook extends React.Component {

    constructor(props) {
        super(props);
	console.log(props);
	this.state = {
            saved:true,
            notebook:{},
            notes:[]
        };
    }

    makeAddNoteButton() {
        return(<button onClick={this.addNote}>+ Note</button>);
    }
    
    makeNote(note, i) {
        return (<Note key={note.uuid} {...note}/>);
    }

    makeManuscriptText(note, i) {
        return (<Manuscript key={note.uuid} {...note}/>);
    }

    loadNotebook() {
        const _this = this;
        axios(
            {method:'GET',
             url:'http://127.0.0.1:8000/notes/?in_notebook__id=' + this.props.id,
             headers:Util.getAuthHeaderFromCookie()})
            .then(resp => {
		console.log('THIS PROPS', _this.props);
                _this.props.context.setState({notes:resp.data.results},
					     ()=>{console.log('RIGHT $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$O', _this);}
                             );
            })
            .catch(err=>{console.log(err);});

        axios(
            {method:'GET',
             url:'http://127.0.0.1:8000/notebooks/' + this.props.id,
             headers:Util.getAuthHeaderFromCookie()})
            .then(resp => {
                this.setState({notebook:resp.data}
			      , ()=>{console.log('I AM ON FIRE', _this);}
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
        if (this.state.notebook.url) {
            return(
		<div className='manuscript-inner'>
                  <h1>{this.state.notebook.title}</h1>
                  <h2>{this.state.notebook.subtitle}</h2>
                  <div className="description">{this.state.notebook.description}</div>   
                  {Array.from(this.state.notes).map(this.makeManuscriptText)}
		  </div>);
        }
    }

    renderTitleEditor() {
	if (this.state.notebook.url) {
	    return (<TitleEditor {...this.state.notebook}/>);
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

                      {Array.from(context.state.notes).map(this.makeNote)}
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
