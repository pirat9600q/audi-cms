import React from 'react';
import allMixins from 'mixins/allMixins';
import mui from 'mui';
import MenuItem from 'mui/menus/menu-item';

const {IconButton, IconMenu, FontIcon} = mui;

const langToCode = {
    en: 'us',
    ru: 'ru'
};

export default React.createClass({
    mixins: [
        allMixins.IntlMixin,
        allMixins.AjaxMixin,
    ],
    getDefaultProps() {
        return {
            msgKeyPrefix: 'languageSelect',
        }
    },
    render() {
        return (
            <div className="right">
                <IconMenu
                    iconButtonElement={<IconButton iconClassName={`flag-icon flag-icon-${langToCode[this.getCurrentLanguage()]}`}/>}
                    onChange={this.onChange}
                    value={this.getCurrentLanguage()}>
                    {this.getSupportedLanguages().map(lang =>
                        <MenuItem
                            key={`lang-${lang}`}
                            value={lang}
                            onItemTouchTap={this.changeLanguage.bind(this, lang)}
                            insetChildren={true}
                            leftIcon={<FontIcon className={`flag-icon flag-icon-${langToCode[lang]}`}/>}
                            primaryText={this.getIntlMessage(`generic.languages.${lang}`)}/>
                    )}
                </IconMenu>
            </div>
        );
    },
    changeLanguage(lang) {
        this.setCurrentLanguage(lang);
        window.location.reload(true);
    },
    onChange(e, lang) {
        console.log(lang);
        this.setCurrentLanguage(lang);
        window.location.reload(true);
    }
});
