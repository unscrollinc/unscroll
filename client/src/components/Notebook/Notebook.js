import React from 'react';
import Note from './Note';
import TitleEditor from './TitleEditor';
import Manuscript from './Manuscript';
import AppContext from '../AppContext';

class Notebook extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = props;
    }

    makeAddNoteButton(context) {
        if (context.state.notebook.uuid !== undefined) {
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

    componentDidMount() {
        this.props.context.loadNotebook(this.state);        
    }


    render() {
        return (
            <AppContext.Consumer>
              {(context) => {
                  return (
		      <div className="Editor">
                        <span>
                          <span className={'status '
                                           + (context.state.notebook.isSaved
                                              ? 'saved'
                                : 'unsaved')}>●</span>
			</span>
			
			{this.makeAddNoteButton(context)}
			
			
			<TitleEditor/>
		        
                        <div className="notebook-event-list">
                          {Array.from(context.state.notebook.notes).map(this.makeNote)}
                        </div>
                        
                        <div className="Manuscript">
                          <h1>{context.state.notebook.title}</h1>
                          <h2>{context.state.notebook.subtitle}</h2>
                          <div className="description">{context.state.notebook.description}</div>   
                          {Array.from(context.state.notebook.notes).map(this.makeManuscriptText)}
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
