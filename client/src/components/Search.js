import React from 'react';
import { withRouter } from 'react-router';
import queryString from 'query-string';

import AppContext from './AppContext';

class Search extends React.Component {
    constructor(props) {
        super(props);
    }
    updateUrl() {
        this.props.history.push('/?q=' + this.state.q);
    }
    render() {
        return (
            <AppContext.Consumer>
                {context => {
                    return (
                        <div>
                            <form
                                className="search"
                                onSubmit={e => {
                                    e.preventDefault();
                                    this.updateUrl();
                                    // context.doEventSearch(e, this.state.q)
                                }}
                            >
                                Search:{' '}
                                <input
                                    type="text"
                                    defaultValue=""
                                    onChange={e =>
                                        this.setState({ q: e.target.value })
                                    }
                                />
                                <input type="submit" value="Go" />
                            </form>
                        </div>
                    );
                }}
            </AppContext.Consumer>
        );
    }
}

export default withRouter(Search);
