define(["react", "reactRouter", "javascripts/components/TodoDummy", "mui", "allMixins", 'js/Auth'],
    function(React, ReactRouter, TodoDummy, mui, allMixins, Auth) {

        const {Menu, MenuItem, FontIcon, Paper} = mui;

        const menuItemsData = [
            { msgKey: "managers", route: "managers-list", icon: "supervisor_account"},
            { msgKey: "contacts", route: "contacts-list", icon: "perm_phone_msg"},
            { msgKey: "articles", route: "articles-list", icon: "text_format"},
            { msgKey: "models", route: "models-main", icon: "directions_car"},
        ];

        return React.createClass({
            mixins: [
                ReactRouter.Navigation,
                allMixins.IntlMixin,
            ],
            statics: {
                willTransitionTo(transition, params, query) {
                    if(!Auth.isLoggedIn()) {
                        transition.redirect('login');
                    }
                }
            },
            getDefaultProps() {
                return {
                    msgKeyPrefix: 'controlPanel.navbar.labels',
                };
            },
            render: function() {
                const menuItems = menuItemsData.map((data, index) =>
                    <MenuItem
                        key={`menu-item-${index}`}
                        primaryText={this.getMsg(data.msgKey)}
                        value={data.route}
                        leftIcon={<FontIcon className="material-icons">{data.icon}</FontIcon>}/>
                );
                return (
                    <div style={{width: "99%"}}>
                        <div className="left" style={{width: "20%"}}>
                            <Menu
                                onChange={this.switchPage}
                                autoWidth={false}
                                style={{position: "relative"}}>
                                {menuItems}
                            </Menu>
                        </div>
                        <div className="left" style={{width: "79%", marginLeft: "1%"}}>
                            <Paper zDepth={4} rounded={false} style={{padding:'30px'}}>
                                <ReactRouter.RouteHandler />
                            </Paper>
                        </div>
                    </div>
                );
            },
            switchPage(e, value) {
                this.transitionTo(value);
            }
        });
    });
