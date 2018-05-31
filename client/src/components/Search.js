import React from 'react';
import AppContext from './AppContext';
class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm:undefined
        };
    }

    render() {
        return (
            <AppContext.Consumer>
              {(context) => {
                  return(
                      <span className="subsearch">
                        Search
                        <form className="search" onSubmit={(e)=>context.doEventSearch(e, this.state.searchTerm)}>
                          <input type="text" defaultValue="" onChange={(e)=>this.setState({searchTerm:e.target.value})}/>
                            <br/>from: to: by: in: topic:
                        </form>
                      </span>
                  );
              }}
            </AppContext.Consumer>
        );
    }
}
export default Search;
