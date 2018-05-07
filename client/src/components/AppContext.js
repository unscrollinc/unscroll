import React from 'react';
import cookie from 'js-cookie';
import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';
import axios from 'axios';
import cachios from 'cachios';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

export const AppContext = React.createContext();

export class AppProvider extends React.Component {
    constructor(state, context) {
        super(state, context);
        let c = cookie.get();        
        this.state = this.makeState(c);
    }
    
    makeState(c) {
        let isLoggedIn = false;
        let authToken = undefined;
        let username = undefined;
    
        if (c && c.authToken && c.username) {
            isLoggedIn = true;
            authToken = c.authToken;
            username = c.username;
        }
        return {
            user: {
                isLoggedIn:isLoggedIn,
                id:undefined,
                authToken:authToken,
                username:username,
                password:undefined,
                profile:undefined,
                notebookCurrent:undefined,
                notebookList:[],
                scrollList:[]
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
        }
    }
    
    makeAuthHeader(token) {
        return {Authorization: `Token ${token}`};
    }
    
    render() {
        return (
            <AppContext.Provider value={{

                state:this.state,
                
                handleUsernameUpdate:(event) => {
                    this.setState({user: update(this.state.user, {username: {$set: event.target.value}})});
                },
                
                handlePasswordUpdate:(event) => {
                    this.setState({user: update(this.state.user, {password: {$set: event.target.value}})});                    
                },

                doLogout:() => {
                    let _this = this;
                    axios({method:'post',
                           url:'http://127.0.0.1:8000/auth/logout/',
                           headers: this.makeAuthHeader(this.state.user.authToken)
                          })
                        .then(function(response) {
                            _this.setState(_this.makeState());
                        })
                        .catch(function(error) {
                            console.log(error);
                        })
                        .finally(function(x) {
                            cookie.remove('authToken');
                            cookie.remove('username');                            
                            _this.setState(_this.makeState());
                        });
                },
                
                doLogin:(event) => {
                    event.preventDefault();
                    let _this = this;
                    cachios.post(
                        'http://127.0.0.1:8000/auth/login/',
                        {
                            username: this.state.user.username,
                            password: this.state.user.password
                        })
                        .then(function(response) {
                            console.log(response);
                            let u1 = update(_this.state.user, {
                                authToken: {$set: response.data.auth_token},
                                password: {$set: undefined},
                                isLoggedIn: {$set: true}                              
                            });
                            cookie.set('authToken', response.data.auth_token);
                            cookie.set('username', _this.state.user.username);
                            
                            _this.setState(
                                {user: u1},
                                function() {
                                    console.log(_this.state);
                                });
                            

                            console.log(cookie.get());
                            
                        })
                        .catch(function(error) {
                            console.log('ERROR', error);
                        });
                },
                
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
