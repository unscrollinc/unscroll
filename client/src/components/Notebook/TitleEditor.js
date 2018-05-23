import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import AppContext from '../AppContext.js';

class TitleEditor extends React.Component {
    
    
    render() {
	return (
            <AppContext.Consumer>
              {(context) => {
                  return (
                      
                      <div className="Meta">
			<form>
                          <table>
                            <tbody>
			      <tr>
                                <th>Public</th>
                                <td><input type="checkbox" name="public"/></td>
                              </tr>
                              <tr>
                                <th>Title:</th>
                                <td><input type="text"
                                           value={context.state.notebook.title}
                                           onChange={(event)=>{context.notebookChange('title', event);}}/></td>
                              </tr>
                              <tr>
                                <th>Subtitle:</th>
                                <td><input type="text"
                                           value={context.state.notebook.subtitle}
                                           onChange={(event)=>{context.notebookChange('subtitle', event);}}/></td>
                              </tr>
                              <tr>
				<th>Description:</th>
                                <td>
				  <input type="text"
                                           value={context.state.notebook.description}
                                           onChange={(event)=>{context.notebookChange('description', event);}}/></td>
                              </tr>
                              <tr>
                                <th>
                                </th>
                                <td>
                                </td>
                              </tr>
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
