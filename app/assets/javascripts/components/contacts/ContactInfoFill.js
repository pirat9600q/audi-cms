import React from 'react';
import ReactRouter from 'react-router';
import mui from 'mui';
import allMixins from 'mixins/allMixins';
import ContactNumberForm from 'components/contacts/ContactNumberForm';
import ContactEmailForm from 'components/contacts/ContactEmailForm';
import ContactAddressForm from 'components/contacts/ContactAddressForm';
import ContactInfoForm from 'components/contacts/ContactInfoForm';
import ArrayDataFillForm from 'components/ArrayDataFillForm';

export default React.createClass({
    mixins: [
        allMixins.AjaxMixin,
        allMixins.IntlMixin,
        ReactRouter.Navigation,
    ],
    getDefaultProps() {
        return {
            msgKeyPrefix: 'controlPanel.contacts.fillForm',
        };
    },
    getInitialState() {
        return {
            contactInfo: {
                numbers:[],
                emails:[],
                addresses:[],
            },
        };
    },
    render() {
        const commonProps = {
            onItemSubmited: this.dataSubmited,
            onCancel: this.cancelAction,
            contactInfoId: this.state.contactInfo.id,
        };
        return (
            <div>
                <ContactInfoForm ref="form" onSubmitItem={this.onSubmitItem}/>
                <div>
                    <h5 className="center-align">{this.getMsg('labels.numbers')}</h5>
                    <ArrayDataFillForm
                        data={this.state.contactInfo.numbers}
                        fieldNames={['name', 'number']}
                        fieldToStringMapper={this._nameFieldToStringMapper}
                        msgKeyPrefix="controlPanel.contacts.fillForm.numberDataFillForm"
                        itemForm={ContactNumberForm}
                        itemFormProps={{contactInfoId: this.state.contactInfo.id}}
                        onItemSubmited={this.dataSubmited}
                        performDelete={this.performNumberDelete}/>
                    <h5 className="center-align">{this.getMsg('labels.emails')}</h5>
                    <ArrayDataFillForm
                        data={this.state.contactInfo.emails}
                        fieldNames={['name', 'email']}
                        fieldToStringMapper={this._nameFieldToStringMapper}
                        msgKeyPrefix="controlPanel.contacts.fillForm.emailDataFillForm"
                        itemForm={ContactEmailForm}
                        itemFormProps={{contactInfoId: this.state.contactInfo.id}}
                        onItemSubmited={this.dataSubmited}
                        performDelete={this.performEmailDelete}/>
                    <h5 className="center-align">{this.getMsg('labels.addresses')}</h5>
                    <ArrayDataFillForm
                        data={this.state.contactInfo.addresses}
                        fieldNames={['name', 'address']}
                        fieldToStringMapper={this._nameFieldToStringMapper}
                        msgKeyPrefix="controlPanel.contacts.fillForm.addressDataFillForm"
                        itemForm={ContactAddressForm}
                        itemFormProps={{contactInfoId: this.state.contactInfo.id}}
                        onItemSubmited={this.dataSubmited}
                        performDelete={this.performAddressDelete}/>
                </div>
            </div>
        );
    },
    onSubmitItem() {
        this.refs.form.getForm().submitForm(jsRoutes.controllers.Contacts.update(this.props.params.id), {
            success: () => this.transitionTo('contacts-list'),
        });
    },
    componentWillMount() {
        this.loadContactInfo();
    },
    loadContactInfo() {
        this.ajax(jsRoutes.controllers.Contacts.show(this.props.params.id), {
            success: (ci) => {
                this.setState({contactInfo: ci});
                this.refs.form.getForm().fillForm(ci);
            }
        });
    },
    dataSubmited() {
        this.loadContactInfo();
    },
    performNumberDelete(number) {
        this.ajax(jsRoutes.controllers.Contacts.deleteNumber(number.id), {
            success: () => this.loadContactInfo(),
        });
    },
    performEmailDelete(email) {
        this.ajax(jsRoutes.controllers.Contacts.deleteEmail(email.id), {
            success: () => this.loadContactInfo(),
        });
    },
    performAddressDelete(address) {
        this.ajax(jsRoutes.controllers.Contacts.deleteAddress(address.id), {
            success: () => this.loadContactInfo(),
        });
    },
    _nameFieldToStringMapper(field, value) {
        return field === 'name' ? this.getPreferedText(value) : value;
    }
});
