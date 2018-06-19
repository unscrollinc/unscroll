import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom' ;
import AppContext from '../AppContext.js';
import { DateTime } from 'luxon';
class NotebookList extends React.Component {

    
    makeNotebook(notebookEntry, i) {
        
        const formatDate = (dt) => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };
        
        const context = this;
        const [key, notebook] = notebookEntry;
	return(
            <tr key={key}>
              <td>
                {formatDate(notebook.when_created)}
              </td>
              
              <th className="notebook-list-title">
	        <Link to={'/notebook/'+notebook.uuid}>{notebook.title}</Link>
              </th>
              <td>
	        <button onClick={()=>{context.deleteNotebook(notebook.uuid);}}>Del</button>
              </td>              
              <td>
		{notebook.is_public ? '' : 'Private'}
              </td>
            </tr>
	);
    }
    
    
    render() {
	return (
	    <div className="Editor">
	      
              <AppContext.Consumer>
		{(context) => {
		    console.log(context);
                    return (
                        <React.Fragment>
                          <table className="notebook-header">
                            <tbody>
                              <tr>
                                <td>Notebooks</td>
                                <td>
	                          <button onClick={context.addNotebook}>+ New</button>
                                </td>
                                <td><Link to='/notebook'>Mine</Link></td>
                                <td><Link to='/notebook/all'>All</Link></td>
                              </tr>
                            </tbody>
                          </table>
                          
			  <table className="notebook-list">
                            <tbody>
                              <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Delete</th>
                                <th>Public?</th>                                          
                              </tr>

                              {Array.from(context.state.user.notebookList).map(this.makeNotebook.bind(context))}
                              
                            </tbody>
                          </table>
                        </React.Fragment>                        
                    );
		}}
                </AppContext.Consumer>
	  </div>
	);
    }
}

export default NotebookList;
