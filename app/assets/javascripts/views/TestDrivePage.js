import React from 'react';
import ReactRouter from 'react-router';
import allMixins from 'mixins/allMixins';
import TestDriveForm from 'components/testDrives/TestDriveForm';
import IconedButton from 'widgets/IconedButton';

var TestDrivePage = React.createClass({
    mixins: [
        allMixins.IntlMixin,
        allMixins.AjaxMixin,
        ReactRouter.Navigation,
    ],
    getDefaultProps() {
        return {
            msgKeyPrefix: 'controlPanel.testDrives'
        }
    },
    getInitialState() {
        return {
            wasFormSubmited: false,
            statusMsg: null,
        }
    },
    render: function() {
        return (
            <div>
                <h1>{this.getMsg('labels.testDrive')}</h1>{(() => {
                    if(this.state.wasFormSubmited) {
                        return (
                            <div className="row">
                                <div className="col l6 offset-l2 m8 offset-m2 s12">
                                    <div className="center-align">
                                        <h4>
                                            {this.getMsg(this.state.statusMsg)}
                                        </h4>
                                        <IconedButton
                                            label={this.getMsg('actions.goToModels')}
                                            linkButton={true}
                                            href={this.makeHref('models')}
                                            iconName="search"/>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    else {
                        return (
                            <div className="row">
                                <div className="col l6 m6 s10">
                                    <TestDriveForm
                                        onFormSubmited={this.formSubmited}
                                        onFormSubmitError={this.formSubmitError}/>
                                </div>
                            </div>
                        );
                    }
                })()}
            </div>
        )
    },
    formSubmited() {
        this.setState({
            wasFormSubmited: true,
            statusMsg: 'labels.submitStatus.success'
        })
    },
    formSubmitError() {
        this.setState({
            wasFormSubmited: true,
            statusMsg: 'labels.submitStatus.error'
        })
    }
});

export default TestDrivePage;
