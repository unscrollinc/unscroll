import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import AppContext from '../AppContext.js';

class TitleEditor extends React.Component {
    
    
    makeToggle(field, type, context) {
        return (
	    <tr key={field}>
	      <th>{field}:</th>
	      <td><input type={type}
			 checked={context.state.notebook[field]}
			 onChange={(event)=>{context.notebookChange(field, event);}}/></td>
	    </tr>);
    }

    makeField(field, type, context) {
        return (
	    <tr key={field}>
	      <th>{field}:</th>
	      <td><input type={type}
			 value={context.state.notebook[field]}
			 onChange={(event)=>{context.notebookChange(field, event);}}/></td>
	    </tr>);
    }
    
    render() {
	return (
            <AppContext.Consumer>
                {(context) => {
                  return (
                      <div className="Meta">
			<form>
                          <table>
                            <tbody>
			      {this.makeToggle('is_public', 'checkbox', context)}
			      {this.makeField('title', 'text', context)}
			      {this.makeField('subtitle', 'text', context)}
			      {this.makeField('description', 'text', context)}			      			      
                            </tbody>
                          </table>
			</form>
                      </div>
                  );}}
              </AppContext.Consumer>                  
	);
    }
}

export default TitleEditor;
