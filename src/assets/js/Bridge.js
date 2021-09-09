/* global CSInterface */
/* global UIColor*/
/* global SystemPath*/
/* global CSEvent */
/*eslint no-restricted-globals: ["error", "event"]*/

import env from '../../config/env.json';

export const csInterface = new CSInterface();
let messageQueue = {};

csInterface.addEventListener("com.cutterman.Cutterman.generator.event", handleGeneratorEvent);

csInterface.addEventListener("JSXErrorEvent", (event) => {
    const err = new Error(event.data);
    err.name = "JSX Script Error";
    throw err;
});

// in debug mode
/* eslint-disable */
require = (window.require)? window.require : parent.require;
process = (window.process)? window.process : parent.process;
/* eslint-enable */

export function themeChange() {
    var hostEnv = csInterface.getHostEnvironment();
    var UIColorObj = new UIColor();
    UIColorObj = hostEnv.appSkinInfo.appBarBackgroundColor;
    var red = Math.round(UIColorObj.color.red);
    var green = Math.round(UIColorObj.color.green);
    var blue = Math.round(UIColorObj.color.blue);
    // 50, 83, 184, 240
    var colorRGB = "#" + red.toString(16) + green.toString(16) + blue.toString(16);

    let theme;
    var v = red;
    if (v < 60) {
        theme = 'darkest';
    } else if (60 <= v && v < 127) {
        theme = 'dark';
    } else if (127 <= v && v < 200) {
        theme = 'gray';
    } else {
        theme = 'white';
    }

    return {theme, color: colorRGB};
}

export function loadJSX(callback) {
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
    console.log(`load jsx from[${extensionRoot}]`);
    csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '")', callback)
}


export function call(action, params, callback) {
    let p = "";
    if (typeof params === "string") {
        p = params;
    } else if (typeof params === "object") {
        p = JSON.stringify(params);
    }
    console.log(`run action[${action}] params[${p}]`);
    csInterface.evalScript(`$._ext.instance.${action}('${p}')`, (result) => {
        console.log(`action[${action}] params[${p}] result[${result}]`);
        if (result === 'EvalScript error.' || result === 'undefined') {
            callback && callback({errno: 1000, data: result});
        } else {
            callback && callback(JSON.parse(result));
        }
        if (result === 'EvalScript error.') {
            const err = new Error(`EvalScript error. action[${action}] params[${p}]`);
            err.name = "EvalScript error.";
            throw err;
        }
    });
}

export function statPV(name) {
    const { aplus_queue } = window;
    aplus_queue.push({
        action: 'aplus.sendPV',
        arguments: [{ is_auto: false }, {name}]
    });
}

export function statClick(name, params) {
    const { aplus_queue } = window;
    aplus_queue.push({
        action: 'aplus.record',
        arguments: [name, 'CLK', params]
    });
}

export function setStatMeta(key, value) {
    const { aplus_queue } = window;
    aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: [key, value]
    });
}

export function readUser() {
    const path = require('path');
    const file = path.join(getUserDirectory(), env.app, 'user.json');
    if (fileExists(file)) {
        const str = readFile(file).toString();
        if (str !== null) {
            return JSON.parse(str);
        }
    }
    return null;
}

export function saveUser(data) {
    const path = require('path');
    const file = path.join(getUserDirectory(), env.app, 'user.json');
    writeFile(file, JSON.stringify(data));
}

export function deleteUser() {
    const path = require('path');
    const file = path.join(getUserDirectory(), env.app, 'user.json');
    deleteFile(file);
}

export function openUserDir() {
    const path = require('path');
    const dir = path.join(getUserDirectory(), env.app);
    call('openDir', dir, () => {});
}

export function getLogFile() {
    const path = require('path');
    const d = new Date();
    const filename = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.log`;
    return {file: path.join(getUserDirectory(), env.app, 'logs', filename), filename};
}

export function readLogFileStream() {
    const fs = require('fs');
    const {file, filename} = getLogFile();
    return new File([fs.readFileSync(file).toString()], filename, {type: "text/plain"});
}

export function getOSInfo() {
    return csInterface.getOSInformation();
}

export function isMac() {
    return process.platform === 'darwin';
}

export function isWin() {
    return process.platform === 'win32';
}

export function getUserDirectory() {
    return csInterface.getSystemPath(SystemPath.USER_DATA);
}

export function getLocale() {
    const env = csInterface.getHostEnvironment();
    const localeArr = env.appLocale.split('_');
    return localeArr[0];
}

export function getCommonFilesPath() {
    return csInterface.getSystemPath(SystemPath.COMMON_FILES);
}

export function getHostApplicationPath() {
    return csInterface.getSystemPath(SystemPath.HOST_APPLICATION);
}

export function getHostVersion() {
    const env = csInterface.getHostEnvironment();
    return env.appVersion;
}

export function fileExists(file) {
    const fs = require('fs');
    return fs.existsSync(file);
}

export function readFile(file) {
    const fs = require('fs');
    return fs.readFileSync(file);
}

export function writeFile(path, data) {
    const fs = require('fs');
    fs.writeFileSync(path, data);
}

export function deleteFile(file) {
    const fs = require('fs');
    fs.unlinkSync(file);
}

export function getLocalIP() {
    const os = require('os');
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        const iface = interfaces[devName];
        for (let i=0; i<iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '';
}

export function getMacAddress(callback) {
    if (isMac()) {
        const process = require('child_process');
        console.log(process);
        process.exec(`/usr/sbin/networksetup -listallhardwareports | grep Wi-Fi -A 3 | awk '/Ethernet Address:/{print $3}'`, (err, stdout, stderr) => {
            if (err || stderr) {
                callback(getLocalIP());
            } else {
                callback(stdout.trim());
            }
        });
    } else {
        try {
            const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i
            let macAddress = '';
            const os = require('os');
            const networkInterfaces = os.networkInterfaces();
            for (let key in networkInterfaces) {
                if (/eth/.test(key.toLocaleLowerCase())) {
                    const addrs = networkInterfaces[key];
                    for (let i=0; i<addrs.length; i++) {
                        const addr = addrs[i];
                        if (addr.family === 'IPv4' && macRegex.test(addr.mac)) {
                            macAddress = addr.mac;
                            break;
                        }
                    }
                }
            }
            macAddress = (macAddress === '')? getLocalIP() : macAddress;
            callback(macAddress);
        } catch (e) {
            console.error("get mac address error");
            console.error(e);
            callback(getLocalIP());
        }
    }
}

export function openURL(url) {
    try {
        if (isWin()) {
            let rootDir = getCommonFilesPath().substring(0, 3);
            let processPath = rootDir + "Windows/explorer.exe";
            window.cep.process.createProcess(processPath, url);
        } else {
            csInterface.openURLInDefaultBrowser(url);
        }
    } catch(e) {
        let processPath = '/usr/bin/open';
        if (isWin()) {
            let rootDir = getCommonFilesPath().substring(0, 3);
            processPath = rootDir + "Windows/explorer.exe";
            window.cep.process.createProcess(processPath, url);
        } else {
            window.cep.process.createProcess(processPath, '-a', 'Safari', url);
        }
    }
}

export function callGenerator(data) {
    return new Promise((resolve, reject) => {
        const msgId = generateID();
        const msg = {msgId: msgId, data: data};
        messageQueue[msgId] = {resolve, reject};
        csInterface.evalScript(`$._ext.sendToGenerator('${JSON.stringify(msg)}')`);
        setTimeout(() => {
            // 过了1s之后，回调还没有被执行就认为是失败了
            if (messageQueue[msgId]) {
                console.log(`message timeout id[${msgId}]`);
                messageQueue[msgId]['reject']();
                delete messageQueue[msgId];
            }
        }, 1000);
    });
}

function handleGeneratorEvent(evt) {
    console.log(evt.data, "[Generator]");
    const ret = evt.data;
    const msgId = ret['msgId'];
    const data = ret['data'];
    if (messageQueue[msgId]) {
        messageQueue[msgId]['resolve'](data);
        delete messageQueue[msgId];
    } else {
        console.log(`no msgId[${msgId}] found data[${evt.data}]`);
    }
}

export function generateID() {
    return createRandomString(16);
}

export function dispatchEvent(key, data) {
    const event = new CSEvent();
    event.type = key;
    event.extensionId = env.extensionId;
    event.scope = "APPLICATION";
    event.data = data;
    csInterface.dispatchEvent(event);
}

export function persistent() {
    const event = new CSEvent("com.adobe.PhotoshopPersistent", "APPLICATION");
    event.extensionId = env.extensionId;
    csInterface.dispatchEvent(event);
}

function createRandomString(length) {
    const seeds = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const max = seeds.length;
    let ret = '';
    for (let i = 0; i < length; i++) {
        let idx = Math.round(Math.random() * max);
        idx = (idx === max) ? max - 1 : idx;
        ret += seeds.substr(idx, 1);
    }
    return ret;
}