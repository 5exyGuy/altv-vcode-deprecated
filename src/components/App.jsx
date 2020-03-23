import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor";
import { altVClient } from "../types/altv-client";
import { altVServer } from "../types/altv-server";
import { natives } from "../types/natives";
// import { Window, TitleBar, Text } from 'react-desktop/macOs';
import { Window, TitleBar, Text, View, Button } from 'react-desktop/windows';
import "./App.css";
import { Rnd } from "react-rnd";
import { FaFileCode, FaImage } from "react-icons/fa";
import { GoFileCode } from "react-icons/go";
import { AiFillCode, AiFillSnippets } from "react-icons/ai";
import { Menu, Layout } from "antd";

const { Sider, Content } = Layout;

class App extends Component {

    state = {
        prevWidth: 600,
        prevHeight: 500,
        isMaximized: false,
        width: 600,
        height: 500,
        prevX: 600,
        prevY: 100,
        x: 600,
        y: 100,
        code: `// This is a sample client code snippet\n\nalt.onServer("myEvent", onMyEvent);\n\nfunction onMyEvent(arg1, arg2) {\n\talt.log("myEvent is called");\n}\n`
    }

    isResizing = false;

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
    }

    onDrag(e, d) {
        this.setState({ x: d.x, y: d.y });
    }

    onResize(e, direction, ref, delta, position) {
        this.setState({
            width: ref.style.width,
            height: ref.style.height
        });
    }

    onMaximizeClick() {
        if (this.state.isMaximized) {
            this.setState({
                prevHeight: this.state.width,
                prevWidth: this.state.width,
                width: this.state.prevWidth,
                height: this.state.prevHeight,
                prevX: this.state.x,
                prevY: this.state.y,
                x: this.state.prevX,
                y: this.state.prevY,
                isMaximized: false
            });
            return;
        }

        this.setState({
            prevHeight: this.state.width,
            prevWidth: this.state.width,
            width: window.innerWidth * 0.9,
            height: window.innerHeight * 0.9,
            prevX: this.state.x,
            prevY: this.state.y,
            x: 0,
            y: 0,
            isMaximized: true
        });
    }

    onMinimizeClick() {
        
    }

    onCloseClick() {

    }

    onChange(newValue, e) {
        this.setState({
            code: newValue
        });
    }

    render() {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: "transparent" }}>
                <Sider style={{ backgroundColor: "#ffffff" }}>
                    <img src="https://altv.mp/img/v_logo.svg" height="100vh" style={{ margin: "5vh" }} />
                    <Menu mode="inline">
                        <Menu.Item key="file"><FaFileCode size="2vh" /> New File</Menu.Item>
                        <Menu.Item key="snippets"><AiFillSnippets size="2vh" /> Snippets (Soon)</Menu.Item>
                        <Menu.Item key="console"><AiFillCode size="2vh" /> Console (Soon)</Menu.Item>
                        <Menu.Item key="theme"><FaImage size="2vh" /> Theme (Soon)</Menu.Item>
                    </Menu>
                </Sider>
                <Rnd
                    size={{ width: this.state.width,  height: this.state.height }}
                    position={{ x: this.state.x, y: this.state.y }}
                    onDrag={this.onDrag.bind(this)}
                    onDragStop={this.onDrag.bind(this)}
                    onResize={this.onResize.bind(this)}
                    minWidth={200}
                    minHeight={200}
                    bounds="parent"
                    cancel=".no"
                >
                    <Window
                        chrome
                        height={this.state.height}
                        padding="10px"
                        width={this.state.width}
                    >
                        <TitleBar 
                            title={<div><FaFileCode /> vEditor</div>} 
                            onMaximizeClick={this.onMaximizeClick.bind(this)}
                            onMinimizeClick={this.onMinimizeClick.bind(this)}
                            onCloseClick={this.onCloseClick.bind(this)}
                            controls
                            isMaximized={false}
                        />
                        <div className="no">
                            <MonacoEditor
                                width={parseInt(this.state.width) - 20}
                                height={parseInt(this.state.height) - 50}
                                language="javascript"
                                theme="vs"
                                value={this.state.code}
                                onChange={this.onChange.bind(this)}
                            />
                        </div>
                    </Window>
                </Rnd>
            </Layout>
        );
    }

} 

export default App;
