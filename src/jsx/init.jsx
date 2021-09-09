
if(typeof($)=='undefined') {
    $={};
}

try {
    var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
} catch (e) {
    alert(e.toString());
}

$._ext = {
    extensionDir: "",
    evalFile : function(path) {
        try {
            return $.evalFile(path);
        } catch (e) {
            //alert("Padda Exception:" + e.toString() + "; path: " + path);
            return "[ERROR] line[" + (e.line-1) + "] message["+ e.message + "] stack[" + $.stack + "]";
        }
    },
    evalFiles: function(extensionDir) {
        $._ext.extensionDir = extensionDir;
        var files = [];
        var jsxDir = new Folder(extensionDir + '/Panel/jsx');
        if (jsxDir.exists) {
            files = files.concat(jsxDir.getFiles("*.jsx"));
        }
        var errno = 0;
        for(var i=0; i<files.length; i++) {
            if (!/init.jsx/.test(files[i])) {
                $._ext.evalFile(files[i]);
            }
        }
        return "{\"errno\": " + errno + "}";
    },
    getPSAppPath: function() {
        var kexecutablePathStr = stringIDToTypeID("executablePath");
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), kexecutablePathStr);
        ref.putEnumerated(charIDToTypeID('capp'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        desc.putReference(charIDToTypeID('null'), ref);
        var result = executeAction(charIDToTypeID('getd'), desc, DialogModes.NO);
        return File.decode(result.getPath(kexecutablePathStr));
    },
    init: function() {
        var root = Folder.userData.absoluteURI + '/Padda';
        var folder = new Folder(root);
        if (!folder.exists) {
            folder.create();
        }
        var snippetsDir = new Folder(folder.absoluteURI + '/snippets');
        if (!snippetsDir.exists) {
            snippetsDir.create()
        }
        return "{\"errno\": 0, \"message\": \"success\"}";
    },
    saveSnippet: function(name, content) {
        var snippetsDir = new Folder(Folder.userData.absoluteURI + '/Padda/snippets');
        if (!snippetsDir.exists) {
            return "{\"errno\": 1, \"message\": \"snippets folder not exists\"}";
        }
        $._ext.saveFile(snippetsDir.absoluteURI + '/' + name + ".snippet", content);
        return "{\"errno\": 0, \"message\": \"success\"}";
    },
    removeSnippet: function(name) {
        var file = new File(Folder.userData.absoluteURI + '/Padda/snippets/' + name);
        if (file.exists) {
            file.remove();
        }
    },
    readSnippetList: function() {
        var snippetsDir = new Folder(Folder.userData.absoluteURI + '/Padda/snippets');
        if (!snippetsDir.exists) {
            return "{\"errno\": 1, \"message\": \"snippets folder not exists\"}";
        }
        var files = snippetsDir.getFiles();
        var result = [];
        for (var i=0; i<files.length; i++){
            var file = new File(files[i]);
            var content = $._ext.readFile(files[i]);
            var obj = JSON.parse(content);
            result.push({id: file.name, title: obj.name, code: obj.code});	
        }
        return JSON.stringify({errno: 0, data: result});
    },
    executeScriptFromFile: function(script) {
        var tmpDir = new Folder(Folder.userData.absoluteURI + '/Padda/tmp');
        if (!tmpDir.exists) {
            tmpDir.create();
        }
        var path = $._ext.saveFile(tmpDir.absoluteURI + '/' + (new Date()).getTime() + ".jsx", unescape(script))
        var result = $._ext.evalFile(path);
        $._ext.removeFile(path);
        return result;
    },
    getSelectedLayerInfo: function() {
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var desc = executeActionGet(ref);

        var descFlags = {
            reference: false,
            extended: false,
            maxRawLimit: 10000,
            maxXMPLimit: 100000,
            saveToFile: null
        };

        var descObject = descriptorInfo.getProperties(desc, descFlags);
        // Running in ExtendScript
        return JSON.stringify(descObject, null, 4);
    },
    selectFile: function() {
        var f = File.openDialog("select js/jsx file", "*.js,*.jsx", false);
        if (f != null) {
            $._ext.saveConfig('filePath', f.absoluteURI);
            return f.absoluteURI;
        }
        return "";
    },
    readFile: function(path) {
        var file = new File(path);
        file.encoding = 'UTF-8';
        file.open('r');
        var content = file.read();
        file.close();
        return content;
    },
    saveFile: function(path, data) {
        var f = new File(path);
         f.open("w");
        f.encoding = "UTF-8";
        f.lineFeed = "Unix";
        f.write(data);
        f.close();
        return f.absoluteURI;
    },
    removeFile: function(path) {
        var f = new File(path);
        if (f.exists) {
            f.remove();
        }
    },
    saveConfig: function(key, value) {
        var configFile = new File(Folder.userData.absoluteURI + '/Padda/config.json');
        var obj = {};
        if (configFile.exists) {
            var content = $._ext.readFile(configFile.absoluteURI);
            obj = JSON.parse(content);
        }
        obj[key] = value;
        $._ext.saveFile(configFile.absoluteURI, JSON.stringify(obj, null, 4));
    },
    readConfig: function(key) {
        var configFile = new File(Folder.userData.absoluteURI + '/Padda/config.json');
        if (configFile.exists) {
            var content = $._ext.readFile(configFile.absoluteURI);
            var obj = JSON.parse(content);
            return (obj[key])? obj[key] : "";
        }
        return "";
    },
    dispatch: function(message) {
        var eventObj = new CSXSEvent();
        eventObj.type = "PaddaConsoleEvent";
        eventObj.data = message;
        eventObj.dispatch()
    }
};
