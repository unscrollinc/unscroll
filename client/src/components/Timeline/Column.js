import React from 'react';
import { Link } from 'react-router-dom';

class Column extends React.Component {
    render() {
        return (
            <div className="column" style={{ width: this.props.width }}>
                <Link to={`?${this.props.span}&view=horizontal`}>
                    {this.props.title}
                </Link>
            </div>
        );
    }
}
export default Column;
