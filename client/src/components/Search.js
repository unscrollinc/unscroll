import React from 'react';
import AppContext from './AppContext';
class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            q:undefined,
            topic:undefined,
            author:undefined,
            from:1968,
            to:2018                    
        };
    }

    render() {
        return (
            <AppContext.Consumer>
              {(context) => {
                  return(
                      <div>
                      <form className="search" onSubmit={(e)=>context.doEventSearch(e, this.state.q)}>
                        Search: <input type="text" defaultValue="" onChange={(e)=>this.setState({q:e.target.value})}/>
                        <input type="submit" value="Go"/>
                      </form>
                      </div>
                  );
              }}
            </AppContext.Consumer>
        );
    }
}
export default Search;
