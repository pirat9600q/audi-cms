define(['react', 'react-router'], function(React, ReactRouter) {

    var RouteHandler = ReactRouter.RouteHandler;

    return React.createClass({
        render: function() {
            return (
                <div className="container">
                    <RouteHandler/>
                </div>
            );
        }
    });
});