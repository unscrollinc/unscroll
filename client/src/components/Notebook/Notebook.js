import React from 'react';
import Note from './Note';
import axios from 'axios';
import TitleEditor from './TitleEditor';
import Manuscript from './Manuscript';
import AppContext from '../AppContext';
import Util from '../Util/Util';
class Notebook extends React.Component {

    constructor(props, context) {
        super(props, context);
        console.log('NOTEBOOK',props);
	this.state = {
            saved:true,
            notebook:{},
            notes:[]
        };
    }

    makeAddNoteButton(context) {
        if (context.state.notebook.id !== undefined) {
            return(<button onClick={context.addNote}>+ Note</button>);
        }
        return undefined;
    }
    
    makeNote(note, i) {
        return (<Note key={note[0]} {...note[1]}/>);
    }

    makeManuscriptText(note, i) {
        return (
            <span key={note[0]}>
              <Manuscript key={note[0]} note={note}/>
            </span>
        );
    }

    loadNotebook() {
        const _this = this;
        
        axios(
            {method:'GET',
             url:'http://127.0.0.1:8000/notes/?in_notebook__id=' + this.props.id,
             headers:Util.getAuthHeaderFromCookie()})
            .then(resp => {
                this.setState({notes:resp.data.results},
                              ()=>{console.log(_this);}
                             );
            })
            .catch(err=>{console.log(err);});

        axios(
            {method:'GET',
             url:'http://127.0.0.1:8000/notebooks/' + this.props.id,
             headers:Util.getAuthHeaderFromCookie()})
            .then(resp => {
                this.setState({notebook:resp.data},
                              ()=>{console.log(_this);}
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
        if (this.state.notebook) {
            return(
                <React.Fragment>
                  <h1>{this.state.notebook.title}</h1>
                  <h2>{this.state.notebook.subtitle}</h2>
                  <div className="description">{this.state.notebook.description}</div>   
                  {Array.from(this.state.notes).map(this.makeManuscriptText)}
                </React.Fragment>);
        }
        return null;
    }
    
    render() {
        if (!this.props.edit)  {
            return (<div className='Manuscript preview'>
                    {this.renderManuscript()}
                    </div>);
        }
        return (
            <AppContext.Consumer>
              {(context) => {
                  return (
		      <div className="Editor">
                        <div className="notebook-event-list">
                          <span>
                            <span className={'status '
                                             + (this.state.saved
                                                ? 'saved'
                                  : 'unsaved')}>●</span>
			  </span>
			
			  {this.makeAddNoteButton(context)}
			
                          
			  <TitleEditor/>
                          
                          {Array.from(this.state.notes).map(this.makeNote)}
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
    {context => <Notebook {...props} context={context} />}
  </AppContext.Consumer>
);
