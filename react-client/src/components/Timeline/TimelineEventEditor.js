import React from 'react';
import AppContext from '../AppContext';

class TimelineEventEditor extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {props};
        this.closeWindow = () => this.setState({isVisible:false});
        this.saveEvent = () => console.log('saving');
    }
    
    makeEditor(context) {
        console.log('WEEENUS', context.state.eventEditor);
        let e = context.state.eventEditor.event;
        
        return context.state.eventEditor.on ? (
                <div className="EventEditor">
                  <form>
                    <table>
                      <tbody>
                        <tr>
                          <th>ID</th>
                          <td><input type="text" value={e.id}/></td>
                        </tr>
                        <tr>
                          <th>Time</th>
                          <td><input type="text" value={e.dt}/></td>
                        </tr>
                        <tr>
                          <th>Resolution</th>
                          <td><input type="text" value={e.res}/></td>
                        </tr>                                            
                        <tr>
                          <th>Title</th>
                          <td><input type="text" value={e.title}/></td>
                        </tr>
                        <tr>
                          <th>URL</th>
                          <td><input type="url" value={e.url}/></td>
                        </tr>
                        <tr>
                          <th>Text</th>
                          <td><textarea>{e.body}</textarea></td>
                        </tr>
                        <tr>
                          <th>Image</th>
                          <td><input type="file"/></td>
                        </tr>                                            
                        <tr>
                          <th></th>
                          <td>
                            <button onClick={context.eventSave}>save</button>
                            <button onClick={context.eventWindowClose}>close</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </form>
                </div>) : (<div/>);
    }
    
    render() {
        return (
            <AppContext.Consumer>
              {(context) => (this.makeEditor(context))}
            </AppContext.Consumer>);
    }
}
export default TimelineEventEditor;
