import React from 'react';
import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';

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
            notes:new Map()
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
                    let _notes = update(this.state.notebook.notes, {$add:[[uuidv4(), e]]});
                    // let _sorted = new Map([...this.state.notebook.notes.entries()].sort());
                    this.setState({
                        notebook:update(this.state.notebook, {$merge: { notes: _notes }})
                    });
                },

                updateText:(newState) => {
                    let _notes = this.state.notebook.notes;
                    _notes.set(newState.uuid, newState);
                    this.setState({
                        notebook:update(this.state.notebook, {$merge: { notes: _notes }})
                    });
                },
                
                deleteNote:(e) => {
                    console.log('would delete');
                }
            }}>
            {this.props.children}
            </AppContext.Provider>

        );
    }
}

export default AppContext;
