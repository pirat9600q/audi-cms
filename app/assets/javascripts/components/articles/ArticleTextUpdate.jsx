define(['react', 'reactRouter', 'allMixins', 'mui', 'js/widgets/ContentEditor'], function(React, reactRouter, allMixins, mui, ContentEditor) {

    const {Paper} = mui;

    return React.createClass({
        mixins: [
            allMixins.AjaxMixin,
            allMixins.IntlMixin,
            reactRouter.Navigation,
        ],
        getDefaultProps() {
            return {
                msgKeyPrefix: 'controlPanel.articles',
            }
        },
        getInitialState() {
            return {
                article: {
                    title: { en: ''},
                    category: '',
                }
            }
        },
        render() {
            return (
                <Paper zDepth={4} rounded={false} style={{padding: '10px'}}>
                    <h4>{this.getMsg('labels.articleContentEditing')}</h4>
                    <h5>{this.getMsg('labels.titleIs', {title: this.getPreferedText(this.state.article.title)})}</h5>
                    <h6>{this.getMsg('labels.categoryIs', {category: this.state.article.category})}</h6>
                    <ContentEditor
                        ref="editor"
                        images={[]}
                        onSave={this.onSave}
                        onCancel={this.afterDone}/>
                </Paper>
            );
        },
        componentDidMount() {
            const {id, lang} = this.props.params;
            this.ajax(jsRoutes.controllers.Articles.show(id), {
                success: (article) => {
                    this.setState({article: article});
                    this.refs.editor.setContent(_.isUndefined(article.text[lang]) ? '' : article.text[lang]);
                }
            })
        },
        onSave() {
            const {id, lang} = this.props.params;
            this.ajax(jsRoutes.controllers.Articles.updateText(id), {
                data: {
                    lang: lang,
                    text: this.refs.editor.getContent(),
                },
                success: () => this.afterDone()
            });
        },
        afterDone() {
            this.transitionTo('article-update', {id: this.props.params.id});
        }
    });
});