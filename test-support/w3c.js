/* globals colors, goodBad */
/* eslint-disable no-var */
var theme = {
    pass: 'green',
    fail: 'red',
    timeout: 'red',
    notrun: 'red'
};
colors.setTheme(theme);

var goodFiles = goodBad.goodFiles;
var badFiles = goodBad.badFiles;
var logDiv = document.createElement('div');
logDiv.id = 'log';
document.body.appendChild(logDiv);
colors.setTheme(theme);

// shimIndexedDB.__debug(true);
window.DOMException = window.indexedDB.modules.DOMException;
window.Event = window.indexedDB.modules.ShimEvent;

const fs = require('fs');
const path = require('path');

const fileArg = process.argv[2];
const dirPath = path.join('test-support', 'js');
const idbTestPath = 'web-platform-tests';

function write (statusText, status) { // eslint-disable-line no-unused-vars
    var color = colors[Object.keys(theme)[status]];
    var msg = color(statusText[status]);
    colors.log(msg);
}

// Todo: Conditionally add script resources for interfaces test
readFiles(
    ['resources/testharness.js', 'resources/testharnessreport.js', 'IndexedDB/support.js'].map(
        (resource) => path.join(idbTestPath, resource)
    ),
    function (harnessContent) {
        function readAndEvaluate (fileName) {
            fs.readFile(path.join(dirPath, fileName), 'utf8', function (err, content) {
                if (err) { return console.log(err); }
                // Todo: Sandbox!!!
                eval(harnessContent // eslint-disable-line no-eval
                    // Todo: Figure out a way around this?
                    .replace(/return window/, 'return GLOBAL')
                    //
                    .replace(/(html \+= "<\/tbody><\/table>";)/, '$1\ntests.forEach((test) => {\n' +
                        'write(status_text, test.status);\n' +
                        'console.log(" (' + fileName.replace(/"/g, '\\"').replace(/\\/g, '\\\\') + '): " + test.name);\n' +
                        'if (assertions) console.log(get_assertion(test));\n' +
                        'if (test.message && test.stack) console.log((test.message || " ") + test.stack);\n' +
                        '});\n') +
                    '\n' + content);
            });
        }

        function readAndEvaluateFiles (err, jsFiles) {
            if (err) { return console.log(err); }
            jsFiles.some((jsFile) => {
                // console.log("'" + jsFile + "',"); return;
                // const fileName = path.join(dirPath, jsFile);
                const fileName = jsFile;
                readAndEvaluate(fileName);
                    // return true;
            });
        }

        if (fileArg === 'good') {
            readAndEvaluateFiles(null, goodFiles);
        } else if (fileArg === 'bad') {
            readAndEvaluateFiles(null, badFiles);
        } else if (fileArg && fileArg !== 'all') {
            readAndEvaluate(fileArg);
        } else {
            fs.readdir(dirPath, readAndEvaluateFiles);
        }
    }
);

function readFiles (arr, cb, i, str) {
    i = i || 0;
    str = str || '';
    if (!arr[i]) {
        return cb(str);
    }
    fs.readFile(arr[i], 'utf8', function (err, data) {
        if (err) { return console.log(err); }
        str += data;
        readFiles(arr, cb, i + 1, str);
    });
}
