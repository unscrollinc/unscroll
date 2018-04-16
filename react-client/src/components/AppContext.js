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
        eventEditor: {
            on:false
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
                
                addNote:(event) => {
                    let _notes = update(this.state.notebook.notes, {$add:[[uuidv4(),
                                                                           {event: event}]]});
                    let _sorted = new Map([..._notes.entries()]
                                          .sort((a,b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
                    console.log(_sorted);
                    this.setState({
                        notebook:update(this.state.notebook, {$merge: { notes: _sorted }})
                    });
                },

                doEventEditor:(event) => {
                    
                },
                
                moveNoteRange:() => {
                    let notes = this.state.notebook.notes;
                    let entries = notes.entries();
                    let range = entries.filter(noteId => notes.get(noteId).statusIsRangerTarget);
                    let mover = entries.filter(noteId => notes.get(noteId).statusIsMoving);
                    let target = entries.filter(noteId => notes.get(noteId).statusIsMoveTarget);

                    /* 
                       then rewrite the entries by making two arrays:
                       - 1 one of the things to move,
                       - 2 one of what's left before the target
                       - 3 one of what's left after the target
                       - then make a new array from 2, 1, 3
                       - then make a new map in that order
                       - then run through the array and look if b.order > c.order
                       - if so give it a new order of (c.order - a.order)/2 and mark that one to be saved
                    */
                    
                },
                
                updateNote:(newState) => {
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
