import React from 'react';
import AppContext from '../AppContext';

class TimelineEventEditor extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {props, isVisible:true};
        this.closeWindow = () => this.setState({isVisible:false});
        this.saveEvent = () => console.log('saving');
    }
    
    render() {
        let isVisible = this.state.isVisible;
        return (
            isVisible ? (<div className="EventEditor">
                         EVENT EDITOR
                         <button onClick={this.saveEvent}>save</button>
                         <button onClick={this.closeWindow}>close</button>
                         </div>) : (<div/>)
                 
        );
    }
}
export default TimelineEventEditor;
