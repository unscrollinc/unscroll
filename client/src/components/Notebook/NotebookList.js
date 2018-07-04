import React from 'react';
import { Link } from 'react-router-dom' ;
import AppContext from '../AppContext.js';
import { DateTime } from 'luxon';

class NotebookList extends React.Component {

    constructor(props, context) {
	super(props);
	this.state = {
	    notebooks:null
	};
    }
    
    makeNotebook(notebookEntry, i) {

	const context = this;
	
        const formatDate = (dt) => {
            const luxonDt = DateTime.fromISO(dt);
            return luxonDt.toLocaleString(DateTime.DATE_SHORT);
        };
        
        const [key, notebook] = notebookEntry;
        const privacy = notebook.is_public ? 'Public' : 'Private';
	return(
            <tr className='list-object-tr' key={key}>
	      
              <td className='list-object-date-td'>
                {formatDate(notebook.when_created)}
              </td>
              
              <td className='list-object-meta-td'>
	        <div className='list-object-title'>
                  <Link to={'/notebooks/'+notebook.id}>{notebook.title}</Link>
                </div>
		<div>
		  <span className='list-object-byline'>By <Link to={'/users/' + notebook.user_username}>{notebook.user_username}</Link>.</span>
		  <span className='list-object-description'>{notebook.description}</span>
		</div>
	      </td>
	      
              <td className='list-object-published-td'>
		<div className={`list-object-published-${privacy}`}>{privacy}</div>                
              </td>
	      
            </tr>
	);
    }
    
    render() {
	return (
	    <div className="NotebookList">
	      
              <AppContext.Consumer>
		{(context) => {
                    return (
                        <div className="list-object">
                          <div className="notebook-header">
                            <div className="list-object-header">
			      <h1>Notebooks</h1>
                              
			      <Link className="list-object-button" to='/my/notebooks'>Mine</Link>
			      <Link className="list-object-button" to='/notebooks'>All</Link>
	                      <button onClick={context.addNotebook}>+ New</button>
                            </div>
                            
			    <table className="list-object-table">
			      <tbody>
                                
                                <tr className='list-object-tr'>
                                  <th className='list-object-date-th'>Date</th>
                                  <th className='list-object-meta-th'>Notebook</th>
                                  <th className='list-object-published-th'>Published</th>                                          
                                </tr>

                                {Array.from(context.state.user.notebookList).map(this.makeNotebook.bind(context))}
                                
                              </tbody>
                            </table>
                          </div>
                        </div>
                    );
		}}
                </AppContext.Consumer>
	  </div>
	);
    }
}

export default NotebookList;
