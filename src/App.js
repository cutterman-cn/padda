import logo from './logo.svg';
import './App.css';
import {Provider, Tabs, TabList, TabPanels, Menu, Switch, Divider, Link, Grid, Header, defaultTheme, Text, darkTheme, lightTheme, View, Flex, ListBox, Item, Button} from'@adobe/react-spectrum';
import React from 'react';
import * as bridge from './assets/js/Bridge';
import env from './config/env.json';
import HotFixes from '@spectrum-icons/workflow/HotFixes';
import Editor from './components/Editor';
import File from './components/File';
import Layer from './components/Layer';
import Snippets from './components/Snippets';
import Edit from '@spectrum-icons/workflow/Edit';
import Code from '@spectrum-icons/workflow/Code';
import FileCode from '@spectrum-icons/workflow/FileCode';
import FileTemplate from '@spectrum-icons/workflow/FileTemplate';
import Layers from '@spectrum-icons/workflow/Layers';
import './i18n';
import { withTranslation } from 'react-i18next';
import md5 from 'js-md5';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            panelHeight: 600,
            panelWidth: 800,
            useTheme: defaultTheme,
            hostTheme: "darkest",
            tabValue: 2,
            filePath: null,
        };
        this.lineColorMap = {
            'darkest': "gray-300",
            "dark": "gray-500",
            "gray": "gray-600",
            "white": "gray-400"
        };
        this.tabs = [
            {tab: 1, title: this.props.t("code"), icon: (<Code />)},
            {tab: 2, title: this.props.t("file"), icon: (<FileCode />)},
            {tab: 3, title: this.props.t("layer"), icon: (<Layers />)},
            {tab: 4, title: this.props.t("snippets"), icon: (<FileTemplate />)},
        ];
    }

    componentDidMount() {
        console.log('app mounted');
        const {theme, color} = bridge.themeChange();
        const defaultTheme = (theme === 'darkest' || theme === 'dark') ? darkTheme : lightTheme;
        /* eslint-disable */
        const win = window;// env.production? window : parent.window;
        this.setState({
            panelHeight: win.innerHeight,
            panelWidth: win.innerWidth,
            useTheme: defaultTheme,
            hostTheme: theme,
        });

        bridge.csInterface.addEventListener('com.adobe.csxs.events.ThemeColorChanged', () => {
            const {theme, color} = bridge.themeChange();
            const defaultTheme = (theme === 'darkest' || theme === 'dark') ? darkTheme : lightTheme;
            this.updateCustomColor(theme);
            this.setState({
                useTheme: defaultTheme,
                hostTheme: theme,
            });
        });

        win.onresize = () => {
            console.log(`on resize: ${win.innerWidth} x ${win.innerHeight}`);
            this.setState({
                panelHeight: win.innerHeight,
                panelWidth: win.innerWidth
            });
        };
        /* eslint-disable */

        bridge.loadJSX(() => {
            bridge.csInterface.evalScript(`$._ext.init()`, (result) => {
                console.log(`$._ext.init() => ${result}`);
            });
        });

        const hostEnv = bridge.csInterface.getHostEnvironment();

        bridge.getMacAddress((macAdress) => {
            bridge.setStatMeta("uuid", md5(macAdress));
            bridge.setStatMeta('globalproperty', {
                locale: bridge.getLocale(),
                os: bridge.getOSInfo(),
                hostVersion: hostEnv.appVersion,
                release: `${env.version}+${env.build}`
            });
            bridge.statPV("main");
        });
    }

    render(){
        const {t} = this.props;
        return (
            <Provider theme={darkTheme} height={this.state.panelHeight} width={this.state.panelWidth}>
                <Grid
                    areas={['header  header', 'sidebar content']}
                    columns={['1fr', '5fr']}
                    rows={['50px', 'auto']}
                    height={this.state.panelHeight}
                    gap="static-size-10">
                    <View backgroundColor="seafoam-400" gridArea="header" >
                        <Flex direction="row" justifyContent="space-between" alignItems="center">
                            <Flex direction="row" justifyContent="start" height="50px" alignItems="center">
                                <HotFixes marginStart="20px" size="M" />
                                <Text marginEnd="20px" UNSAFE_className="App-logo">Padda</Text>
                                <Text UNSAFE_className="App-logo-desc" marginTop="8px">{t("description")}</Text>
                            </Flex>
                            <Text marginEnd="10px">V{env.version}+{env.build},  powered by @Cutterman-cn</Text>
                        </Flex>
                    </View>
                    <View gridArea="sidebar" backgroundColor={this.lineColorMap[this.state.hostTheme]}>
                        <Tabs orientation="vertical" items={this.tabs} selectedKey={this.state.tabValue} onSelectionChange={(tab) => {this.setState({tabValue: tab})}}>
                            <TabList>{(item) => <Item key={item.tab}>{item.icon}<Text>{item.title}</Text></Item>}</TabList>
                        </Tabs>

                    </View>
                    <View backgroundColor="gray-300" gridArea="content" height="100%" width={window.innerWidth*5/6}>
                        {this.state.tabValue == 1 && <Editor filePath={this.state.filePath} />}
                        {this.state.tabValue == 2 && <File onEditFile={(file) => this.setState({tabValue: 1, filePath: file}) } />}
                        {this.state.tabValue == 3 && <Layer />}
                        {this.state.tabValue == 4 && <Snippets />}
                    </View>
                </Grid>
            </Provider>
        )
    };
}

export default withTranslation()(App);
