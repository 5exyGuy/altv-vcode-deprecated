import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import './assets/styles/style.css';

async () => {
    await import('monaco-editor/esm/vs/editor/editor.api');

    const publicPath = process.env.WEBPACK_PUBLIC_PATH;
    function getWorkerUrl(workerId, label) {
        switch (label) {
            case 'json':
                return publicPath + 'json.worker.js';
            case 'css':
            case 'less':
            case 'scss':
                return publicPath + 'css.worker.js';
            case 'html':
            case 'handlebars':
            case 'razor':
                return publicPath + 'html.worker.js';
            case 'javascript':
            case 'typescript':
                return publicPath + 'ts.worker.js';
            default:
                return publicPath + 'editor.worker.js';
        }
    }

    window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
            const url = getWorkerUrl(workerId, label);
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`                        
                        self.MonacoEnvironment = {
                        baseUrl: '${publicPath}'
                        };
                        importScripts('${url}');`
            )}`;
        }
    };
}

ReactDOM.render(
    React.createElement(App),
    document.getElementById('root'),
);

// Check if hot reloading is enable. If it is, changes won't reload the page.
// This is related to webpack-dev-server and works on development only.
if (module.hot) {
    module.hot.accept();
}
