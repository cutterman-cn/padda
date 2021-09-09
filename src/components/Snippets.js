import React from 'react';
import { withTranslation } from 'react-i18next';
import {ActionButton, TextField, ButtonGroup, Dialog, DialogContainer, Heading, Content, Menu, Switch, Divider, Link, Grid, Header, defaultTheme, Text, darkTheme, lightTheme, View, Flex, ListBox, Item, Button} from'@adobe/react-spectrum';
import * as bridge from '../assets/js/Bridge';
import _ from "lodash";
import Star from '@spectrum-icons/workflow/Star';
import Delete from '@spectrum-icons/workflow/Delete';

class Snippets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSnippet:  [],
            snippetsList: [],
            info: ''
        };
    }

    onSelectSnippets(item) {
        this.setState({selectedSnippet: item});
        for (let key of item.values()) {
            this.state.snippetsList.forEach((item, idx) => {
                if (item.id === key) {
                    this.setState({info: unescape(item.code)});
                }
            });
        }
    }

    onDeleteSnippet() {
        for (let key of this.state.selectedSnippet.values()) {
            _.remove(this.state.snippetsList, (item) => {
                return item.id === key;
            })
            this.setState({snippetsList: this.state.snippetsList, selectedKeys: new Set([]), info: ''});
            console.log(key);
            bridge.csInterface.evalScript(`$._ext.removeSnippet("${key}")`, () => {});
        }
    }

    componentDidMount() {
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
    componentWillUnmount() {
    }

    render() {
        const {t} = this.props;
        return (
            <Flex direction="row" width="100%" justifyContent="start" gap="1px">
                <Flex direction="column" justifyContent="start">
                    <Heading marginStart="10px">{t("list_snippets_title")}</Heading>
                    <Divider marginStart="10px" />
                    <Menu width="200px" items={this.state.snippetsList} selectedKeys={this.state.selectedSnippet} onSelectionChange={this.onSelectSnippets.bind(this)} selectionMode="single">
                        {(item) => <Item key={item.id}><Text> - {item.title}</Text></Item>}
                    </Menu>
                </Flex>
                {this.state.info != '' && (
                    <Flex direction="column" justifyContent="start" alignItems="end">
                        <ActionButton onPress={this.onDeleteSnippet.bind(this)} marginStart="10px" marginTop="10px" marginEnd="10px"><Delete /><Text>{t("delete_btn")}</Text></ActionButton>
                        <View backgroundColor="gray-100" borderWidth="thin" borderColor="dark"
                            borderRadius="medium" padding="size-250" margin="10px" width={window.innerWidth * 5 / 6 - 220} height={window.innerHeight - 120} overflow="scroll">
                            <Text><pre>{this.state.info}</pre></Text>
                        </View>
                    </Flex>
                )}
            </Flex>
        )
    }
}

export default withTranslation()(Snippets);