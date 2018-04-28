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
            id:undefined,
            title:undefined,
            subtitle:undefined,
            summary:undefined,
            notes:new Map()
        },
        eventEditor: {
            on:false,
            currentEvent:{}
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
                
                addNotebook:() => {
                    this.setState({notebook: {
                        on:true,
                        id:uuidv4(),
                        title:'Untitled',
                        subtitle:'Un-subtitled',
                        summary:'Un-summarized',
                        notes:new Map()
                    }});
                },
                
                addNote:(event) => {
                    let _notes = update(this.state.notebook.notes,
                                        {$add:[[uuidv4(),
                                                {event: event}]]});
                    let _sorted = new Map([..._notes.entries()]
                                          .sort((a,b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
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
                
                editNote:(e) => {
                    this.setState({
                        eventEditor:{on:true, event:e}
                    });
                },
                
                editEvent:(e) => {
                    this.setState({
                        eventEditor:{on:true, event:e}
                    });
                },

                newEvent:(time) => {
                    this.setState({
                        eventEditor:{on:true, event:{id:uuidv4(), time:time}}
                    });
                },                                

                eventWindowClose:() => {
                    this.setState({eventEditor:{on:false, event:undefined}});
                },
                
                deleteNote:(uuid) => {
                    console.log('deleting note', uuid);
                    let _notes = this.state.notebook.notes;
                    _notes.delete(uuid);
                    console.log(_notes);
                    this.setState({
                        notebook:update(this.state.notebook, {$merge: { notes:  _notes}})
                    });
                }
            }}>
            {this.props.children}
            </AppContext.Provider>

        );
    }
}

export default AppContext;
