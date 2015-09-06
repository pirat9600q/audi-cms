define(['react', 'allMixins', 'mui',
    'js/widgets/Switch'
], function(React, allMixins, mui, switchWidget) {

    const {IconButton,FloatingActionButton, FontIcon, Dialog} = mui;
    const {Switch, Case, Default} = switchWidget;

    return React.createClass({
        mixins: [
            allMixins.IntlMixin,
        ],
        propTypes: {
            data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
            fieldNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
            itemForm: React.PropTypes.func.isRequired,
            itemFormProps: React.PropTypes.object,
            onItemSubmited: React.PropTypes.func,
            performDelete: React.PropTypes.func.isRequired,
        },
        getInitialState() {
            return {
                action: '',
                actionData: null,
            };
        },
        render() {
            const deleteDialogActions = [
                {text: this.getMsg('actions.delete.cancel'), onTouchTap: this.cancelDeleteItem},
                {text: this.getMsg('actions.delete.confirm'), onTouchTap: this.confirmDeleteItem}
            ];
            return (
                <div>
                    <table className="compactTable">
                        <thead>
                            <tr>
                                { this.props.fieldNames.map((field) => <th>{this.getMsg(`labels.${field}`)}</th> ) }
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>{
                            this.props.data.map((item, index) =>
                                <tr key={`row-${index}`}>
                                    { this.props.fieldNames.map((field) => <td>{item[field]}</td> ) }
                                    <td>
                                        <IconButton
                                            onClick={this.updateItem.bind(this, item)}
                                            style={{padding: "0px", height: "auto"}}
                                            iconClassName="material-icons">mode_edit</IconButton>
                                    </td>
                                    <td>
                                        <IconButton
                                            onClick={this.attemptDeleteItem.bind(this, item)}
                                            style={{padding: "0px", height: "auto"}}
                                            iconClassName="material-icons">delete</IconButton>
                                    </td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                    <Switch of={this.state.action}>
                        <Case on="update">
                            <this.props.itemForm
                                onItemSubmited={this.onItemSubmited}
                                onCancel={this.onCancel}
                                item={this.state.actionData}
                                {...this.props.itemFormProps}/>
                        </Case>
                        <Case on="store">
                            <this.props.itemForm
                                onItemSubmited={this.onItemSubmited}
                                onCancel={this.onCancel}
                                {...this.props.itemFormProps}/>
                        </Case>
                        <Default>
                            <FloatingActionButton
                                mini={true}
                                onClick={this.storeItem}
                                style={{marginLeft: "2%"}}>
                                <FontIcon className="material-icons">playlist_add</FontIcon>
                            </FloatingActionButton>
                        </Default>
                    </Switch>
                    <Dialog
                        ref="deleteDialog"
                        title={this.getMsg('labels.delete.dialogTitle')}
                        actions={deleteDialogActions}
                        actionFocus="submit"
                        modal={true}>
                        {this.getMsg('labels.delete.dialog')}
                    </Dialog>
                </div>
            );
        },
        storeItem() {
            this.setState({action: 'store'});
        },
        updateItem(item) {
            this.setState({action: 'update', actionData: item});
        },
        attemptDeleteItem(item) {
            this.setState({action: 'delete', actionData: item});
            this.refs.deleteDialog.show();
        },
        confirmDeleteItem() {
            this.refs.deleteDialog.dismiss();
            this.props.performDelete(this.state.actionData);
            this.setState({action: ''});
        },
        cancelDeleteItem() {
            this.setState({action:''});
            this.refs.deleteDialog.dismiss();
        },
        onItemSubmited() {
            this.setState({action:''});
            if(this.props.onItemSubmited) {
                this.props.onItemSubmited();
            }
        },
        onCancel() {
            this.setState({action:''});
        },
    });
});