import React from 'react';

import PropTypes from 'prop-types';

import ReactCursorPosition from 'react-cursor-position';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as UnscrollActions from '../actions/index';

import Timeline from './Timeline/Timeline';
import Editor from './Editor';
import '../index.css';

const App = ({data, actions}) => (
    <div className="App">
        <div className="Nav">
        </div>
        <ReactCursorPosition>
            <Timeline/>
        </ReactCursorPosition>
        <Editor/>
    </div>
);

App.propTypes = {
    data: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    todos: state.data
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(UnscrollActions, dispatch)
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

/*
class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editorOn:true,
            notes:[]
        };
    }

    addNote = (e) => {
        console.log(e);
    }

    handleEditButtonClick = () => {
        this.setState(prevState => ({
            editorOn: !prevState.editorOn
        }));
    }

    renderEditButton() {
        return(
            <button onClick={this.handleEditButtonClick}>
                {this.state.editorOn ? 'Turn off Editor' : 'Turn on Editor'}
            </button>
        );
    }

    render() {
        return (
                <div className="App">
                    <div className="Nav">
                        {this.renderEditButton()}
                    </div>
                    <ReactCursorPosition>
                        <Timeline addNote={this.addNote}/>
                    </ReactCursorPosition>
                    <Editor status={this.state.editorOn}/>
                </div>
        );
    }
}


export default App;
*/

