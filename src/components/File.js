import React from 'react';
import { withTranslation } from 'react-i18next';
import {ActionButton, TextField, ButtonGroup, Dialog, DialogContainer, Heading, Content, Menu, Switch, Divider, Link, Grid, Header, defaultTheme, Text, darkTheme, lightTheme, View, Flex, ListBox, Item, Button} from'@adobe/react-spectrum';
import Play from '@spectrum-icons/workflow/Play';
import Edit from '@spectrum-icons/workflow/Edit';
import * as bridge from '../assets/js/Bridge';

class File extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filePath: '',
            showOutput: false,
            outputError: false,
            outputText: ''
        }
    }

    selectFile() {
        bridge.csInterface.evalScript(`$._ext.selectFile()`, (result) => {
            console.log(result);
            this.setState({
                filePath: result
            });
        })
    }

    executeFile() {
        bridge.csInterface.evalScript(`$._ext.evalFile("${this.state.filePath}")`, (result) => {
            this.setState({
                showOutput: true,
                outputText: result,
                outputError: /ERROR/.test(result)? true : false,
            });
        });
    }

    editFile() {
        this.props.onEditFile(this.state.filePath);
    }

    componentDidMount() {
        bridge.csInterface.evalScript(`$._ext.readConfig("filePath")`, (result) => {
            console.log(`$._ext.readConfig("filePath") => ${result}`);
            this.setState({
                filePath: result
            })
        });
    }

    render() {
        const { t } = this.props;
        return (
            <Flex direction="column" width="100%" justifyContent="start" gap="1px">
                <View borderWidth="thin" borderColor="dark" borderRadius="medium" padding="size-250" margin="20px">
                    <Heading>{t("file_title")}</Heading>
                    <View backgroundColor="gray-400" height="1px" />
                    <Content marginTop="20px">
                        <Flex direction="row" justifyContent="start" alignItems="center">
                            <Button onPress={this.selectFile.bind(this)} variant="primary">{t("select_button")}</Button>
                            <Text marginStart="10px">{this.state.filePath}</Text>
                            {this.state.filePath != '' && (<ActionButton onPress={this.executeFile.bind(this)} marginStart="10px"><Play /></ActionButton>)}
                            {this.state.filePath != '' && (<ActionButton onPress={this.editFile.bind(this)} marginStart="10px"><Edit /></ActionButton>)}
                        </Flex>
                    </Content>
                </View>
                {this.state.showOutput && (
                    <View backgroundColor={this.state.outputError? "negative" : "positive"} borderWidth="thin" borderColor="dark" borderRadius="medium" padding="size-250" margin="20px">
                        <Text>{this.state.outputText}</Text>
                    </View>
                )}
            </Flex>
        )
    }
}

export default withTranslation()(File);