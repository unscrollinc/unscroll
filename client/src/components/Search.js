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
                      
                      <div className="search">
                        
                        <form className="search" onSubmit={(e)=>context.doEventSearch(e, this.state.q)}>
                          
                          <span className="search-input">
                            <div className="search-ruby">Text</div>
                            <input type="text" defaultValue="" onChange={(e)=>this.setState({q:e.target.value})}/>
                          </span>
                          
                          <span className="search-input">                          
                            <div className="search-ruby">Scroll</div>
                            <input type="text" defaultValue="" onChange={(e)=>this.setState({scroll:e.target.value})}/>
                          </span>
                          
                          <span className="search-input">
                            <div className="search-ruby">Type</div>                              
                            <input type="text" defaultValue="" onChange={(e)=>this.setState({type:e.target.value})}/>
                          </span>
                          
                          <span className="search-input">                          
                            <div className="search-ruby">Topic</div>
                            <input type="text" defaultValue="" onChange={(e)=>this.setState({topic:e.target.value})}/>
                          </span>
                          
                          <span className="search-input">                          
                            <div className="search-ruby">Creator</div>
                            <input type="text" defaultValue=""
                                   onChange={(e)=>this.setState({creator:e.target.value})}/>
                          </span>
                          
                          <span className="search-input">                                                    
                            <div className="search-ruby">After {this.state.from}</div>
                            <input className="rangeInput" type="range" min="1968" max="2018"
                                   onChange={(e)=>this.setState({from:e.target.value})}
                              />
                          </span> 
                          <input type="submit" value="Go"/>
                          
                        </form>
                        
                        <div>
                          <div>Searching for "{this.state.q}"</div>
                        </div>
                        
                      </div>
                  );
              }}
            </AppContext.Consumer>
        );
    }
}
export default Search;
