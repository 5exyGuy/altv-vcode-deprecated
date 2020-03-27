import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { altVClient } from '../types/altv-client';
import { altVServer } from '../types/altv-server';
import { natives } from '../types/natives';
import './App.css';
import { Rnd } from 'react-rnd';
import { FaFileCode, FaServer, FaLaptopCode } from 'react-icons/fa';
import { IoMdCloudyNight, IoMdPartlySunny } from 'react-icons/io';
import vCodeLight from '../assets/images/vCodeLight.png';
import vCodeDark from '../assets/images/vCodeDark.png';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { Layout, Result } from 'antd';

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
        theme: 'light',
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

    clickMenuItem(itemName) {
        switch (itemName) {
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
        // const none = (<Result
        //     icon={<img src={this.state.theme === 'dark' ? vCodeDark : vCodeLight} height='80vh' />}
        //     subTitle={
        //         <div style={{ color: this.state.theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.45)' }}>
        //             To get started, press the menu button at the top called 'File' and select the type of file you want to create or just right click on the left panel.
        //             <p style={{ color: '#52a3ff', marginTop: '30px' }}>Author: 5exyGuy</p>
        //         </div>}
        // />);
        const none = <div></div>;

        const editor = (<MonacoEditor
            width={parseInt(this.state.width) - 180}
            height={parseInt(this.state.height) - 76}
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
                    cancel='.no-drag'
                >
                    <div className='window' style={{ border: '0', overflow: '', width: this.state.width, height: this.state.height }}>
                        <div className='window-caption'>
                            <span className='icon'><FaFileCode /></span>
                            <span className='title'>vCode {this.state.currentFileName ? `(${this.state.currentFileName})` : '' }</span>
                            <div className='buttons'>
                                <span className='btn-min' onClick={this.onMinimizeClick.bind(this)}></span>
                                <span className='btn-max' onClick={this.onMaximizeClick.bind(this)}></span>
                                <span className='btn-close' onClick={this.onCloseClick.bind(this)}></span>
                            </div>
                        </div>
                        <div className='no-drag window-content'>
                            <div className='row' style={{ margin: '0px 0px' }}>
                                <div className='cell-xxl-12' style={{ padding: '0px 0px' }}>
                                    <ul className='h-menu'>
                                        <li>
                                            <a className='dropdown-toggle'>File</a>
                                            <ul className='d-menu' data-role='dropdown'>
                                                <li>
                                                    <a onClick={this.clickMenuItem.bind(this, 'serverFile')}>
                                                        <span className='icon' style={{ top: '25%' }}><FaServer /></span>New Server File...
                                                    </a>
                                                </li>
                                                <li>
                                                    <a onClick={this.clickMenuItem.bind(this, 'clientFile')}>
                                                        <span className='icon' style={{ top: '25%' }}><FaLaptopCode /></span>New Client File...
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <a className='dropdown-toggle'>Theme</a>
                                            <ul className='d-menu' data-role='dropdown'>
                                                <li>
                                                    <a onClick={this.clickMenuItem.bind(this, 'dark')}>
                                                    <span className='icon' style={{ top: '25%' }}><IoMdCloudyNight /></span>Dark
                                                    </a>
                                                </li>
                                                <li>
                                                    <a onClick={this.clickMenuItem.bind(this, 'light')}>
                                                        <span className='icon' style={{ top: '25%' }}><IoMdPartlySunny /></span>Light
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li><a onClick={this.clickMenuItem.bind(this, 'snippets')}>Snippets</a></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className='clearfix' style={{ height: parseInt(this.state.height) - 76 }}>
                                <ContextMenuTrigger id='sider'>
                                    <div className="box" style={{ width: '180px', height: parseInt(this.state.height) - 76 }}>
                                        <img src={this.state.theme === 'dark' ? vCodeDark : vCodeLight} height='50vh' style={{ margin: '20px 40px' }} />
                                        {/* <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> */} 
                                        {this.state.files.map((file) => {
                                            if (!file.new && !file.renaming) 
                                                return (
                                                    <ContextMenuTrigger key={file.name} id={file.name}>
                                                        <div 
                                                            onDoubleClick={this.doubleClickOnFile.bind(this, file.name)} 
                                                            className={`vfile ${this.state.theme} ${this.state.currentFileName === file.name ? 'vselected' : ''}`}
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
                                     </div>
                                </ContextMenuTrigger>
                                <div className='box' style={{ height: parseInt(this.state.height) - 76 }}>
                                    {currentPage}
                                </div>
                            </div>
                        </div>
                    </div>
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