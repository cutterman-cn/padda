import React from 'react';
import { withTranslation } from 'react-i18next';
import {Form, ActionButton, TextField, ButtonGroup, Dialog, DialogContainer, Heading, Content, Menu, Switch, Divider, Link, Grid, Header, defaultTheme, Text, darkTheme, lightTheme, View, Flex, ListBox, Item, Button} from'@adobe/react-spectrum';
import { useDialogContainer } from '@react-spectrum/dialog';
import Close from '@spectrum-icons/workflow/Close';
import Play from '@spectrum-icons/workflow/Play';
import Copy from '@spectrum-icons/workflow/Copy';
import { CodeJar } from 'codejar';
import {withLineNumbers} from 'codejar/linenumbers';
import * as bridge from '../assets/js/Bridge';
import md5 from 'js-md5';

class Editor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            code: "const a = 100;",
            showSnippetsList: false,
            showOutput: false,
            outputText: '',
            snippetsName: '',
            showSaveSnippetsDialog: false,
            outputError: false,
            selectedSnippet:  [],
            snippetsList: []
        }
        this.codeJar = null;
    }

    highlight(editor) {
        editor.textContent = editor.textContent
        window.hljs.highlightBlock(editor)
    }

    onUpdate() {

    }

    onClear() {
        this.codeJar.updateCode("");
    }

    onRun() {
        let code = this.codeJar.toString();
        console.log(code);
        if (code.trim() === "") {
            return;
        }
        code = `try {
            ${code}
        } catch (e) {
            var error = "[ERROR] line[" + (e.line-1) + "] message["+ e.message + "] stack[" + $.stack + "]";
            error;
        }`

        bridge.csInterface.evalScript(code, (result) => {
            console.log(result);
            if (result === 'EvalScript error.') {
                bridge.csInterface.evalScript(`$._ext.executeScriptFromFile("${escape(code)}")`, (ret) => {
                    this.setState({
                        outputError: /[ERROR]/.test(ret) ? true : false,
                        showOutput: true,
                        outputText: ret
                    })
                });
            }
            this.setState({
                outputError: /\[ERROR\]/.test(result)? true : false,
                showOutput: true,
                outputText: result
            })
        });
    }

    onSelectSnippets(item) {
        this.setState({selectedSnippet: item});
        for (let key of item.values()) {
            this.state.snippetsList.forEach((item, idx) => {
                if (item.id === key) {
                    this.codeJar.updateCode(unescape(item.code));
                }
            });
        }
    }

    onSaveSnippets() {
        if (this.state.snippetsName === '') {
            return;
        }
        const code = this.codeJar.toString();
        if (code.trim() === "") {
            return;
        }

        const name = md5(this.state.snippetsName);
        const content = JSON.stringify({name: this.state.snippetsName, code: escape(code)});
        bridge.csInterface.evalScript(`$._ext.saveSnippet("${name}", '${content}')`);

        this.setState({
            showSaveSnippetsDialog: false
        });
        this.loadSnippetList();
    }

    loadSnippetList() {
        bridge.csInterface.evalScript(`$._ext.readSnippetList()`, (result) => {
            console.log(`$._ext.readSnippetList() => ${result}`);
            if (result === 'EvalScript error.') {
                return;
            }
            const obj = JSON.parse(result);
            if (obj.errno === 0) {
                this.setState({
                    snippetsList: obj.data
                });
            }
        });
    }

    componentDidMount() {
        this.codeJar = CodeJar(document.querySelector('.editor'), withLineNumbers(this.highlight))
        if (this.props.filePath !== null) {
            bridge.csInterface.evalScript(`$._ext.readFile("${this.props.filePath}")`, (result) => {
                this.codeJar.updateCode(result);
            });
        } else {
            this.codeJar.updateCode(`// type your jsx code here
// JSON has already emmbed
// JSON.parse(), JSON.stringify() are free to use here
// Powered by xiaoqiang @github.com/cutterman-cn
app.version;`);
        }

        this.loadSnippetList();
    }

    render() {
        const { t } = this.props;
        return (
            <Flex direction="row" width="100%" justifyContent="space-between" gap="1px">
                <Flex direction="column" justifyContent="start">
                    <div className="editor code language-js" style={{ height: window.innerHeight - 130 - (this.state.showOutput ? 80 : 0), width: window.innerWidth*5/6-(this.state.showSnippetsList? 178: 58)}}></div>
                    {this.state.showOutput && (
                        <View backgroundColor={this.state.outputError? "negative" : "positive"} borderRadius="small" height="80px" overflow="scroll">
                            <Flex direction="row" width="100%" justifyContent="space-between">
                                <Text margin="10px">{this.state.outputText}</Text>
                                <ActionButton isQuiet onPress={() => {this.setState({showOutput: false})}}><Close margin="10px" size="S" /></ActionButton>
                            </Flex>
                        </View>
                    )}
                    <Flex direction="row" justifyContent="space-between" marginTop="14px" marginStart="20px">
                        <Flex direction="row" justifyContent="start">
                            <ActionButton onPress={this.onRun.bind(this)} variant="overBackground"><Play /><Text>{t("run")}</Text></ActionButton>
                            <ActionButton onPress={this.onClear.bind(this)} marginStart="10px" variant="overBackground"><Copy /><Text>{t("clear")}</Text></ActionButton>
                        </Flex>
                        <Flex direction="row" justifyContent="start" marginEnd="20px">
                            <Button variant="overBackground" marginEnd="10px" onPress={() => this.setState({showSaveSnippetsDialog: true})}>{t("save_snippets")}</Button>
                            <Switch isSelected={this.state.showSnippetsList} onChange={(val) => this.setState({ showSnippetsList: val })}>{t("list_snippets")}</Switch>
                        </Flex>
                    </Flex>
                </Flex>
                {this.state.showSnippetsList && (
                    <View backgroundColor="gray-400" width="150px">
                        <Flex margin="10px" direction="column" justifyContent="start" justifySelf="center">
                            <Header>{t("list_snippets_title")}</Header>
                            <Divider marginTop="10px" marginBottom="10px" />
                            <Menu items={this.state.snippetsList} selectedKeys={this.state.selectedSnippet} onSelectionChange={this.onSelectSnippets.bind(this)} selectionMode="single">
                                {(item) => <Item key={item.id}>{item.title}</Item>}
                            </Menu>

                        </Flex>
                    </View>
                )}

                <DialogContainer onDismiss={() => this.setState({showSaveSnippetsDialog: false})}>
                    {this.state.showSaveSnippetsDialog && (
                        <Dialog>
                            <Heading>{t("save_snippets_name")}</Heading>
                            <Divider />
                            <Content>
                                <Form labelPosition="side" width="100%">
                                    <TextField autoFocus label={t("snippet_name")} value={this.state.snippetsName} onChange={(val) => this.setState({snippetsName: val})} placeholder={t("awesome_name")} />
                                </Form>
                            </Content>
                            <ButtonGroup>
                                <Button variant="secondary" onPress={() => {this.setState({showSaveSnippetsDialog: false, snippetsName: ''})}}> {t("cancel")} </Button>
                                <Button variant="cta" onPress={this.onSaveSnippets.bind(this)}> {t("save")} </Button>
                            </ButtonGroup>
                        </Dialog>
                    )}

                </DialogContainer>
            </Flex>
        );
    }


}

export default withTranslation()(Editor);