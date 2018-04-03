import React from 'react';
import update from 'immutability-helper';

// https://github.com/wesbos/React-Context/blob/master/src/App.js

export const AppContext = React.createContext();

export class AppProvider extends React.Component {
    state = {        
        user: {
            id:undefined,
            profile:undefined,
            notebookCurrent:undefined,
            notebookList:[]
        },
        notebook: {
            on:false,
            notes:[]
        },
        timeline: {
            frame:undefined,
            span:undefined,
            position:undefined
        }
    };
        
    render() {
        return (
            <AppContext.Provider value={{
                state:this.state,
                addNote:(e) => {
                    let _notes = update(this.state.notebook.notes, {$unshift:[e]});
                    this.setState({
                        notebook:update(
                            this.state.notebook, 
                            {$merge: { notes: _notes }})
                    });
                    console.log(this.state.notebook);
                }
            }}>
            {this.props.children}
            </AppContext.Provider>

        );
    }
}

export default AppContext;
