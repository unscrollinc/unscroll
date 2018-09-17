import React from 'react';
import { withRouter } from 'react-router';

import AppContext from './AppContext';

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            q: null,
            engaged: null,
            defaultValue: 'Search'
        };
    }
    updateUrl() {
        this.props.history.push('/?view=vertical&q=' + this.state.q);
    }
    onFocus(e) {
        if (!this.state.q) {
            e.target.value = '';
            this.setState({ engaged: true });
        }
    }
    onBlur(e) {
        this.setState({ engaged: null });
    }

    render() {
        return (
            <AppContext.Consumer>
                {context => {
                    return (
                        <form
                            className={
                                'search' +
                                (this.state.engaged ? ' engaged' : '')
                            }
                            onSubmit={e => {
                                e.preventDefault();
                                this.updateUrl();
                            }}
                        >
                            <input
                                className={
                                    'search-input' +
                                    (this.state.engaged ? ' engaged' : '')
                                }
                                type="text"
                                defaultValue={this.state.defaultValue}
                                onFocus={this.onFocus.bind(this)}
                                onBlur={this.onBlur.bind(this)}
                                onChange={e =>
                                    this.setState({ q: e.target.value })
                                }
                            />
                        </form>
                    );
                }}
            </AppContext.Consumer>
        );
    }
}

export default withRouter(Search);
