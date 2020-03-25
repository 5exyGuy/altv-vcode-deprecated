import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { altVClient } from '../types/altv-client';
import { altVServer } from '../types/altv-server';
import { natives } from '../types/natives';
import { Window, TitleBar } from 'react-desktop/windows';
import './App.css';
import { Rnd } from 'react-rnd';
import { FaFileCode, FaServer, FaDesktop, FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { Menu, Layout, Result } from 'antd';
import vCode from '../assets/images/vCode.png';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

const { Sider, Content, Header } = Layout;

export default class App extends Component {

    state = {
        prevWidth: 800,
        prevHeight: 400,
        isMaximized: false,
        width: 800,
        height: 400,
        prevX: 200,
        prevY: 200,
        x: 200,
        y: 200,
        code: '',
        currentPage: 'none',
        currentFile: 'test',
        newFileType: 'none',
        newFileName: '',
        newFileValidate: 'validating',
        files: [
            {
                name: 'test',
                type: 'server',
                code: '',
                ref: null,
                new: false
            }
        ]
    };

    onDrag(e, d) {
        this.setState({ x: d.x, y: d.y });
    }

    onResize(e, direction, ref, delta, position) {
        this.setState({
            width: ref.style.width,
            height: ref.style.height,
            ...position
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
            width: window.innerWidth,
            height: window.innerHeight,
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

    onChange(newValue) {
        this.setState({
            code: newValue
        });
    }

    onMenuItemClick(event) {
        switch (event.key) {
            case 'serverFile':
                this.onCreateNewFile('server');
                break;
            case 'clientFile':
                this.onCreateNewFile('client');
                break;
        }
    }

    onContextCreateFile(type) {
        this.onCreateNewFile(type);
    }

    onCreateNewFile(fileType) {
        const files = [...this.state.files];
        const file = {
            name: '',
            type: fileType,
            code: '',
            ref: null,
            new: true
        };

        files.unshift(file);
        this.setState({ files: files });
    }

    // onFileEdit(fileName) {
    //     const files = [...this.state.files];

    //     if (this.state.currentFile !== fileName) {
    //         const index = files.findIndex((file) => {
    //             return file.name === this.state.currentFile;
    //         });

    //         if (index > -1) 
    //             files[index] = {
    //                 name: files[index].name,
    //                 type: files[index].type,
    //                 code: this.state.code,
    //                 ref: null,
    //                 new: false
    //             }
    //     } else return;

    //     const file = files.find((file) => {
    //         return file.name === fileName;
    //     });

    //     if (!file) return;

    //     if (file.type === 'server') {
    //         monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVServer } ]);
    //     } else {
    //         monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVClient }, { content: natives } ]);
    //     }

    //     this.setState({ 
    //         currentPage: 'editor', 
    //         currentFile: fileName, 
    //         files: files, 
    //         code: file.code 
    //     });
    // }

    // onFileDelete(fileName) {
    //     const index = this.state.files.findIndex((file) => {
    //         return file.name === fileName;
    //     });

    //     if (index > -1) {
    //         this.state.files.splice(index, 1);
    //         this.setState({ files: this.state.files });
    //     }

    //     if (this.state.currentFile === fileName) this.setState({ currentPage: 'none', currentFile: 'none' });
    // }

    componentDidMount() {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES6,
            allowNonTsExtensions: true
        });
    }

    componentDidUpdate() {
        this.state.files.map((file) => {
            if (file.new) { 
                file.ref.focus();
                return;
            }
        });
    }

    onFocusOut(event) {
        const files = [...this.state.files];

        if (event.target.value.length > 0) {
            const result = files.find((file) => {
                return file.name === event.target.value;
            });

            if (result) {
                files.shift();
                this.setState({ files: files });
                return;
            }

            const file = files[0];
            file.name = event.target.value;
            file.new = false;
            file.code = `// ${file.name}`
            files[0] = file;
            this.setState({ 
                files: files, 
                currentPage: 'editor', 
                currentFile: file.name,
                code: file.code
            });
            return;
        } 

        // if (this.state.newFileType === 'server') {
        //     monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVServer } ]);
        // } else {
        //     monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVClient }, { content: natives } ]);
        // }

        files.shift();
        this.setState({ 
            files: files, 
            currentPage: 'editor', 
            currentFile: file.name
        });
        this.editor.focus();
    }

    onKeyPress(event) {
        if (event.key === 'Enter') this.onFocusOut(event);
    }

    saveCurrentFile() {
        if (this.state.currentFile !== 'none') {
            const files = [...this.state.files];

            files.map((file) => {
                if (this.state.currentFile === file.name) {
                    file.code = this.state.code;
                    return;
                }
            });
        }
    }

    doubleClickOnFile(fileName) {
        if (this.state.currentFile !== fileName) this.saveCurrentFile();

        const files = [...this.state.files];

        files.map((file) => {
            if (file.selected === true) {
                file.selected = false;
                return;
            }
        });

        let code = '';

        files.map((file) => {
            if (file.name === fileName) {
                file.selected = true;
                code = file.code;
                this.setState({ currentFile: file.name });
                return;
            }
        });

        this.setState({ 
            files: files,
            currentPage: 'editor',
            code: code
        });

        if (this.editor) this.editor.focus();
    }

    editorDidMount(editor) {
        this.editor = editor;
    }

    render() {
        const none = (<Result
            icon={<img src={vCode} height='80vh' />}
            subTitle='To get started, press the menu button at the top called "File" and select the type of file you want to create.'
        />);

        const editor = (<MonacoEditor
            width={parseInt(this.state.width) - 220}
            height={parseInt(this.state.height) - 130}
            language='javascript'
            theme='vs-dark'
            value={this.state.code}
            onChange={this.onChange.bind(this)}
            editorDidMount={this.editorDidMount.bind(this)}
        />);

        let currentPage = <div></div>;

        switch (this.state.currentPage) {
            case 'none':
                currentPage = none;
                break;
            case 'editor':
                currentPage = editor;
                break;
        }

        return (
            <div>
                <Rnd
                    size={{ width: this.state.width, height: this.state.height }}
                    position={{ x: this.state.x, y: this.state.y }}
                    onDrag={this.onDrag.bind(this)}
                    onDragStop={this.onDrag.bind(this)}
                    onDragStart={this.onDrag.bind(this)}
                    onResize={this.onResize.bind(this)}
                    onResizeStart={this.onResize.bind(this)}
                    onResizeStop={this.onResize.bind(this)}
                    minWidth={400}
                    minHeight={400}
                    bounds='body'
                    cancel='.no'
                >
                    <Window
                        chrome
                        height={this.state.height}
                        padding='0px'
                        width={this.state.width}
                    >
                        <TitleBar 
                            title={<div><FaFileCode /> vCode ({this.state.currentFile})</div>} 
                            onMaximizeClick={this.onMaximizeClick.bind(this)}
                            onMinimizeClick={this.onMinimizeClick.bind(this)}
                            onCloseClick={this.onCloseClick.bind(this)}
                            controls
                            isMaximized={false}
                        />
                        <Layout 
                            className='no' 
                            style={{ 
                                width: parseInt(this.state.width) - 20, 
                                height: parseInt(this.state.height) - 50, 
                                backgroundColor: 'white',
                                padding: '0px'
                            }}
                        >
                            <Header style={{ padding: '0px', height: 'auto', backgroundColor: 'white' }}>
                                {/* <img src={vCode} height='90vh' /> */}
                                <Menu mode='horizontal' onClick={this.onMenuItemClick.bind(this)}>
                                    <Menu.SubMenu
                                        title={
                                            <span className="submenu-title-wrapper">
                                                File
                                            </span>
                                        }
                                    >
                                        <Menu.Item key="serverFile">New Server File...</Menu.Item>
                                        <Menu.Item key="clientFile">New Client File...</Menu.Item>
                                    </Menu.SubMenu>
                                    <Menu.Item key='snippets'>Snippets (Soon)</Menu.Item>
                                    <Menu.SubMenu
                                        title={
                                            <span className="submenu-title-wrapper">
                                                Theme
                                            </span>
                                        }
                                    >
                                        <Menu.Item key="dark">Dark</Menu.Item>
                                        <Menu.Item key="light">Light</Menu.Item>
                                    </Menu.SubMenu>
                                </Menu>
                            </Header>
                            <Layout style={{ backgroundColor: 'white' }}>
                                <ContextMenuTrigger id='sider'>
                                    <Sider width='auto' style={{ backgroundColor: 'white', overflow: "scroll", padding: '0px 10px' }}>
                                        <img src={vCode} height="50vh" style={{ margin: '20px 40px' }} />
                                        {/* <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> */} 
                                        {this.state.files.map((file) => {
                                            if (!file.new) 
                                                return (
                                                    <ContextMenuTrigger id={file.name}>
                                                        <div 
                                                            onDoubleClick={this.doubleClickOnFile.bind(this, file.name)} 
                                                            className={`file ${this.state.currentFile === file.name ? 'selected' : ''}`} 
                                                            key={file.name}
                                                        >
                                                            {file.type === 'server' ? <FaServer /> : <FaDesktop />} {file.name}
                                                        </div>
                                                    </ContextMenuTrigger>
                                                ); 

                                            return (<input 
                                                onKeyPress={this.onKeyPress.bind(this)}
                                                onBlur={this.onFocusOut.bind(this)}
                                                ref={(input) => file.ref = input} 
                                                style={{ 
                                                    padding: '0px 5px', 
                                                    border: '0',
                                                    display: 'block',
                                                }}
                                            />);
                                        })} 
                                    </Sider>
                                </ContextMenuTrigger>
                                <Content style={{ margin: '10px 10px' }}>
                                    {currentPage}
                                </Content>
                            </Layout>
                        </Layout>
                    </Window>
                </Rnd>

                <ContextMenu id='sider'>
                    <MenuItem onClick={this.onCreateNewFile.bind(this, 'server')}>New Server File...</MenuItem>
                    <MenuItem onClick={this.onCreateNewFile.bind(this, 'client')}>New Client File...</MenuItem>
                </ContextMenu>
                {this.state.files.map((file) => {
                    return (<ContextMenu id={file.name}>
                        <MenuItem>Edit</MenuItem>
                        <MenuItem>Rename</MenuItem>
                        <MenuItem>Delete</MenuItem>
                    </ContextMenu>);
                })}
            </div>
        );
    }

}