import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor";
import { altVClient } from "../types/altv-client";
import { altVServer } from "../types/altv-server";
import { natives } from "../types/natives";
import { Window, TitleBar, Text } from 'react-desktop/macOs';
import Draggable from "react-draggable";
import "./App.css";

class App extends Component {

    state = {
        code: 'native.',
    }

    componentDidMount() {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES6,
            allowNonTsExtensions: true
        });

        monaco.languages.typescript.javascriptDefaults.addExtraLib(altVClient);

        monaco.editor.defineTheme("myCustomTheme", {
            base: "vs", // can also be vs-dark or hc-black
            inherit: true, // can also be false to completely replace the builtin rules
            rules: [
              {
                token: "comment",
                foreground: "ffa500",
                fontStyle: "italic underline"
              },
              { token: "comment.js", foreground: "008800", fontStyle: "bold" },
              { token: "comment.css", foreground: "0000ff" } // will inherit fontStyle from `comment` above
            ],
            colors: {
              "editor.background": '#ececec'
            }
        });
        monaco.editor.setTheme('myCustomTheme');
    }

    render() {
        const options = {
            selectOnLineNumbers: true
        };

        return (
            <div>
                <Window
                    chrome
                    height="500px"
                    padding="10px"
                    width="600px"
                >
                    <TitleBar title="macEditor" controls/>
                    <div className="no-cursor">
                        <MonacoEditor
                                width="580"
                                height="460"
                                language="javascript"
                                theme="vs"
                                value="// type"
                                options={options}
                        />
                    </div>
                </Window>
            </div>
        );
    }

} 

export default App;
