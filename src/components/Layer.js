import React from 'react';
import { withTranslation } from 'react-i18next';
import {ActionButton, TextField, ButtonGroup, Dialog, DialogContainer, Heading, Content, Menu, Switch, Divider, Link, Grid, Header, defaultTheme, Text, darkTheme, lightTheme, View, Flex, ListBox, Item, Button} from'@adobe/react-spectrum';
import Play from '@spectrum-icons/workflow/Play';
import Edit from '@spectrum-icons/workflow/Edit';
import * as psDom from 'photoshop-dom-event';
import * as bridge from '../assets/js/Bridge';
import _ from "lodash";

class Layer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: ''
        };
    }

    onItemSelectChange(data) {
        if (data && data.eventData) {
            bridge.csInterface.evalScript(`$._ext.getSelectedLayerInfo()`, (result) => {
                this.setState({info: result});
            });
        }
    }

    componentDidMount() {
        psDom.onEvent('slct', _.debounce(this.onItemSelectChange.bind(this)));
        psDom.onEvent('Mk  ', _.debounce(this.onItemSelectChange.bind(this)))
        this.onItemSelectChange({eventData: 1})
    }
    componentWillUnmount() {
        psDom.stopListeningEvent('slct');
        psDom.stopListeningEvent('Mk  ');
    }

    render() {
        return (
            <Flex direction="column" width="100%" justifyContent="start" gap="1px">
                <View backgroundColor="gray-100" borderWidth="thin" borderColor="dark" 
                borderRadius="medium" padding="size-250" margin="10px" maxHeight={window.innerHeight - 70} overflow="scroll">
                    <Text><pre>{this.state.info}</pre></Text>
                </View>
            </Flex>
        )
    }
}

export default withTranslation()(Layer);