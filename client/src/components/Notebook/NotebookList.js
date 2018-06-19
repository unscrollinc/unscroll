import React from 'react';
import ReactDOM from 'react-dom';
import AppContext from '../AppContext.js';

class NotebookList extends React.Component {

    makeNotebook(notebookEntry, i) {
        const context = this;
        const [key, notebook] = notebookEntry;
	return(
            <tr key={key}>
              <th>
	        <span
                  onClick={
                  (e) => {context.loadNotebook(notebook);}}>
                  {notebook.title}
                </span>
              </th>
              <td>
	        <button onClick={()=>{context.deleteNotebook(notebook.uuid);}}>Del</button>
              </td>
              <td>
		{notebook.is_public ? '*' : '-'}
              </td>
            </tr>
	);
    }
    
    
    render() {
	return (
	    <div className="Editor">

	      <h1>Notebook twList</h1>
	      
              <AppContext.Consumer>
		{(context) => {
		    console.log(context);
                    return (
			<table className="notebook-list">
                          <tbody>
                            {Array.from(context.state.user.notebookList).map(this.makeNotebook.bind(context))}
                          </tbody>
                      </table>		      
                    );
		}}
            </AppContext.Consumer>
	  </div>
	);
    }
}

export default NotebookList;
