import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { altVClient } from '../types/altv-client';
import { altVServer } from '../types/altv-server';
import { natives } from '../types/natives';
import { Window, TitleBar } from 'react-desktop/windows';
import './App.css';
import { Rnd } from 'react-rnd';
import { FaFileCode, FaServer, FaLaptopCode } from 'react-icons/fa';
import { Menu, Layout, Result } from 'antd';
import vCodeLight from '../assets/images/vCodeLight.png';
import vCodeDark from '../assets/images/vCodeDark.png';
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
        theme: 'dark',
        currentPage: 'editor',
        currentFileName: null,
        renamingFile: false,
        files: [
            {
                name: 'test',
                type: 'server',
                code: '',
                ref: null,
                renaming: false,
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
                width: this.state.prevWidth,
                height: this.state.prevHeight,
                x: this.state.prevX,
                y: this.state.prevY,
                isMaximized: false
            });
            return;
        }

        this.setState({
            prevHeight: this.state.height,
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
                this.createNewFile('server');
                break;
            case 'clientFile':
                this.createNewFile('client');
                break;
            case 'dark':
                this.setState({ theme: 'dark' });
                break;
            case 'light':
                this.setState({ theme: 'light' });
                break;
        }
    }

    executeFile(fileName) {
        if (this.ready) {
            this.editFile(fileName);

            const files = [...this.state.files];
            const file = files.find((file) => {
                return file.name === fileName;
            });

            if (!file) return;

            const errors = monaco.editor.getModelMarkers();

            if (errors.length > 0) {
                return;
            }

            alt.emit('vscode::execute', file.type, file.code);
        }
    }

    editFile(fileName) {
        if (this.state.currentFile !== fileName) this.saveCurrentFile();

        const files = [...this.state.files];

        files.map((file) => {
            if (file.selected === true) {
                file.selected = false;
                return;
            }
        });

        let code = '';
        let type = '';

        files.map((file) => {
            if (file.name === fileName) {
                file.selected = true;
                code = file.code;
                type = file.type;
                this.saveCurrentFile();
                this.setState({ currentFileName: file.name });
                return;
            }
        });

        this.setState({ 
            files: [...files],
            currentPage: 'editor',
            code: code
        });

        if (this.editor) {
            if (type === 'server') monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVServer } ]);
            else monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVClient }, { content: natives } ]);
            this.editor.focus();
        }
    }

    renameFile(fileName) {
        const files = [...this.state.files];

        files.map((file) => {
            if (file.name === fileName) {
                file.renaming = true;
                return;
            }
        });

        this.setState({
            files: [...files],
            renamingFile: true
        });
    }

    deleteFile(fileName) {
        const files = [...this.state.files];

        const index = files.findIndex((file) => {
            return file.name === fileName;
        });
        if (index > -1) files.splice(index, 1);

        this.setState({
            files
        });
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

        setTimeout(() => {
            this.setState({ currentPage: 'none' });
            if ('alt' in window) {
                alt.emit('vcode::ready');
                this.ready = true;
            }
        }, 200);
    }

    onContextCreateFile(type) {
        this.createNewFile(type);
    }

    createNewFile(fileType) {
        const files = [...this.state.files];
        const file = {
            name: '',
            type: fileType,
            code: '',
            ref: null,
            renaming: false,
            new: true
        };

        files.unshift(file);
        this.setState({ 
            files
        });
    }

    componentDidUpdate() {
        this.state.files.map((file) => {
            if (file.new || file.renaming) { 
                file.ref.focus();
                return;
            }
        });
    }

    inputBlur(event) {
        const files = [...this.state.files];

        if (this.state.renamingFile) {
            if (event.target.value.length > 0) {
                const file = files.map((file) => {
                    if (file.renaming) {
                        file.name = event.target.value;
                        file.renaming = false;
                        return;
                    }
                });

                this.setState({
                    files: [...files],
                    renamingFile: false
                });
                return;
            }

            const file = files.map((file) => {
                if (file.renaming) {
                    file.renaming = false;
                    return;
                }
            });

            this.setState({
                files: [...files],
                renamingFile: false
            });
            return;
        }

        if (event.target.value.length > 0) {
            const result = files.find((file) => {
                return file.name === event.target.value;
            });

            if (result) {
                files.shift();
                this.setState({ files: [...files] });
                return;
            }

            const file = files[0];
            file.name = event.target.value;
            file.code = `// ${file.name}`
            file.new = false;
            files[0] = file;

            this.saveCurrentFile();

            this.setState({ 
                files: [...files], 
                currentPage: 'editor', 
                currentFileName: file.name,
                code: file.code
            });

            if (this.editor) {
                if (file.type === 'server') monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVServer } ]);
                else monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVClient }, { content: natives } ]);
                this.editor.focus();
            }
            return;
        } 
        files.shift();
        this.setState({ 
            files: [...files], 
            currentPage: this.state.currentFileName === null ? 'none' : 'editor', 
            currentFileName: file.name
        });

        if (this.editor) this.editor.focus();
    }

    inputKeyPress(event) {
        if (event.key === 'Enter') this.inputBlur(event);
    }

    saveCurrentFile() {
        if (this.state.currentFile !== null) {
            const files = [...this.state.files];

            files.map((file) => {
                if (this.state.currentFileName === file.name) {
                    file.code = this.state.code;
                    return;
                }
            });
        }
    }

    doubleClickOnFile(fileName) {
        this.editFile(fileName);
    }

    editorDidMount(editor) {
        this.editor = editor;
    }

    render() {
        const none = (<Result
            icon={<img src={this.state.theme === 'dark' ? vCodeDark : vCodeLight} height='80vh' />}
            subTitle={
                <div style={{ color: this.state.theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.45)' }}>
                    To get started, press the menu button at the top called "File" and select the type of file you want to create or just right click on the left panel.
                    <p style={{ color: '#52a3ff', marginTop: '30px' }}>Author: 5exyGuy</p>
                </div>}
        />);

        const editor = (<MonacoEditor
            width={parseInt(this.state.width) - 182}
            height={parseInt(this.state.height) - 60}
            language='javascript'
            theme={this.state.theme === 'dark' ? 'vs-dark' : 'vs'}
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
                        theme={this.state.theme}
                    >
                        <TitleBar 
                            title={<div><FaFileCode /> vCode {this.state.currentFileName ? `(${this.state.currentFileName})` : '' }</div>} 
                            onMaximizeClick={this.onMaximizeClick.bind(this)}
                            onMinimizeClick={this.onMinimizeClick.bind(this)}
                            onCloseClick={this.onCloseClick.bind(this)}
                            controls
                            isMaximized={false}
                            theme={this.state.theme}
                        />
                        <Layout 
                            className='no' 
                            style={{ 
                                width: parseInt(this.state.width) - 20, 
                                height: parseInt(this.state.height) - 33, 
                                backgroundColor: this.state.theme === 'dark' ? '#1e1e1e' : 'white',
                                padding: '0px'
                            }}
                        >
                            <Header style={{ 
                                    padding: '0px', 
                                    height: 'auto', 
                                    backgroundColor: this.state.theme === 'dark' ? '#1e1e1e' : 'white' 
                                }}
                            >
                                {/* <img src={vCode} height='90vh' /> */}
                                <Menu 
                                    mode='horizontal' 
                                    onClick={this.onMenuItemClick.bind(this)}
                                    style={{ 
                                        backgroundColor: this.state.theme === 'dark' ? '#1e1e1e' : 'white',
                                        color:  this.state.theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.65)'
                                    }}
                                >
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
                                    <Menu.Item key='snippets'>Snippets (Soon)</Menu.Item>
                                </Menu>
                            </Header>
                            <Layout style={{
                                    backgroundColor: this.state.theme === 'dark' ? '#1e1e1e' : 'white'
                                }}
                            >
                                <ContextMenuTrigger id='sider'>
                                    <Sider width='auto' style={{ 
                                            overflow: "scroll", 
                                            padding: '0px 0px', 
                                            backgroundColor: this.state.theme === 'dark' ? '#1e1e1e' : 'white' 
                                        }}
                                    >
                                        <img src={this.state.theme === 'dark' ? vCodeDark : vCodeLight} height="50vh" style={{ margin: '20px 40px' }} />
                                        {/* <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> */} 
                                        {this.state.files.map((file) => {
                                            if (!file.new && !file.renaming) 
                                                return (
                                                    <ContextMenuTrigger key={file.name} id={file.name}>
                                                        <div 
                                                            onDoubleClick={this.doubleClickOnFile.bind(this, file.name)} 
                                                            className={`file ${this.state.theme} ${this.state.currentFileName === file.name ? 'selected' : ''}`}
                                                        >
                                                            {file.type === 'server' ? <FaServer color='#49a5d6' /> : <FaLaptopCode color='#368a3d' />} {file.name}
                                                        </div>
                                                    </ContextMenuTrigger>
                                                ); 

                                            return (<input 
                                                onKeyPress={this.inputKeyPress.bind(this)}
                                                onBlur={this.inputBlur.bind(this)}
                                                ref={(input) => file.ref = input} 
                                                style={{ 
                                                    padding: '0px 5px', 
                                                    border: '0',
                                                    display: 'block',
                                                    width: '100%'
                                                }}
                                            />);
                                        })} 
                                    </Sider>
                                </ContextMenuTrigger>
                                <Content style={{ 
                                        backgroundColor: this.state.theme === 'dark' ? '#1e1e1e' : 'white'
                                    }}
                                >
                                    {currentPage}
                                </Content>
                            </Layout>
                        </Layout>
                    </Window>
                </Rnd>

                <ContextMenu id='sider'>
                    <MenuItem onClick={this.createNewFile.bind(this, 'server')}>New Server File...</MenuItem>
                    <MenuItem onClick={this.createNewFile.bind(this, 'client')}>New Client File...</MenuItem>
                </ContextMenu>
                {this.state.files.map((file) => {
                    return (<ContextMenu key={file.name} id={file.name}>
                        <MenuItem onClick={this.executeFile.bind(this, file.name)}>Execute</MenuItem>
                        <MenuItem onClick={this.editFile.bind(this, file.name)}>Edit</MenuItem>
                        <MenuItem onClick={this.renameFile.bind(this, file.name)}>Rename</MenuItem>
                        <MenuItem onClick={this.deleteFile.bind(this, file.name)}>Delete</MenuItem>
                    </ContextMenu>);
                })}
            </div>
        );
    }

}