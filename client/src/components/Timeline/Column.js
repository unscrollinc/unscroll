import React from 'react';
import { Link } from 'react-router-dom';

class Column extends React.Component {

    render() {
        return (
            <div className="column"
                 style={{float:'left',
                         height:'90%',
                         width:100/12 + '%'
                 }}
                 >
                <Link to={`/timelines/${this.props.span}`}>{this.props.count}</Link>
            </div>
        );
    }
}
export default Column;
