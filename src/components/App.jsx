import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { altVClient } from '../types/altv-client';
import { altVServer } from '../types/altv-server';
import { natives } from '../types/natives';
// import { Window, TitleBar, Text } from 'react-desktop/macOs';
import { Window, TitleBar } from 'react-desktop/windows';
import './App.css';
import { Rnd } from 'react-rnd';
import { FaFileCode, FaServer, FaDesktop, FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { Menu, Layout, List, Result, Button, Empty, Form, Input, Tag } from 'antd';
import vCode from '../assets/images/vCode.png';

const { Sider, Content, Header } = Layout;

const layout = {
    wrapperCol: { offset: 6, span: 10 },
};

const tailLayout = {
    wrapperCol: { offset: 6, span: 10 },
};

export default class App extends Component {

    state = {
        prevWidth: 600,
        prevHeight: 500,
        isMaximized: false,
        width: 900,
        height: 600,
        prevX: 600,
        prevY: 100,
        x: 100,
        y: 100,
        code: `// This is a sample client code snippet\n\nalt.onServer('myEvent', onMyEvent);\n\nfunction onMyEvent(arg1, arg2) {\n\talt.log('myEvent is called');\n}`,
        currentPage: 'none',
        currentFile: 'none',
        newFileType: 'none',
        newFileName: '',
        newFileValidate: 'validating',
        files: []
    };

    currClientLibDisposable = null;
    currServerLibDisposable = null;
    currNativesLibDisposable = null;

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

    onChange(newValue, e) {
        this.setState({
            code: newValue
        });
    }

    onMenuItemClick(event) {
        switch (event.key) {
            case 'serverFile':
                this.setState({ newFileType: 'server', currentPage: 'newFile' });
                break;
            case 'clientFile':
                this.setState({ newFileType: 'client', currentPage: 'newFile' });
                break;
        }
    }

    onFileNameInput(event) {
        this.setState({ newFileName: event.target.value });
    }

    onCreateNewFile() {
        if (this.state.newFileName.length < 1 || this.state.newFileName.length > 20) {
            this.setState({ newFileValidate: 'error' });
            return;
        }

        const file = this.state.files.find((file) => {
            return file.name === this.state.newFileName;
        });

        if (file) {
            this.setState({ newFileValidate: 'error' });
            return;
        }

        this.state.files.push({
            name: this.state.newFileName,
            type: this.state.newFileType,
            code: ''
        })
        this.setState({ 
            newFileValidate: 'validating', 
            currentPage: 'editor', 
            currentFile: this.state.newFileName,
            code: `// This is a ${this.state.newFileType} file`
        });

        if (this.state.newFileType === 'server') {
            monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVServer } ]);
        } else {
            monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVClient }, { content: natives } ]);
        }
    }

    onFileEdit(fileName) {
        const files = this.state.files;

        if (this.state.currentFile !== fileName) {
            const index = files.findIndex((file) => {
                return file.name === this.state.currentFile;
            });

            if (index > -1) 
                files[index] = {
                    name: files[index].name,
                    type: files[index].type,
                    code: this.state.code
                }

            console.log(files[index]);
        } else return;

        const file = files.find((file) => {
            return file.name === fileName;
        });

        if (!file) return;

        console.log(this.currClientLibDisposable);
        console.log(this.currNativesLibDisposable);
        console.log(this.currServerLibDisposable);

        if (file.type === 'server') {
            monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVServer } ]);
        } else {
            monaco.languages.typescript.javascriptDefaults.setExtraLibs([ { content: altVClient }, { content: natives } ]);
        }

        this.setState({ 
            currentPage: 'editor', 
            currentFile: fileName, 
            files: files, 
            code: file.code 
        });
    }

    onFileDelete(fileName) {
        console.log(fileName);

        const index = this.state.files.findIndex((file) => {
            return file.name === fileName;
        });

        if (index > -1) {
            this.state.files.splice(index, 1);
            this.setState({ files: this.state.files });
        }

        if (this.state.currentFile === fileName) this.setState({ currentPage: 'none', currentFile: 'none' });
    }

    render() {
        const none = <Result
            icon={<img src={vCode} height='80vh' />}
            subTitle='To get started, press the menu button at the top called "File" and select the type of file you want to create.'
        />;

        const editor = <MonacoEditor
            width={parseInt(this.state.width) - 20}
            height={parseInt(this.state.height) - 130}
            language='javascript'
            theme='vs'
            value={this.state.code}
            onChange={this.onChange.bind(this)}
        />;
        
        const newFile = <Form
            {...layout}
            layout='vertical'
            style={{ paddingTop: '100px' }}
        >
            <Form.Item name='fileType'>
                <Tag 
                    color={this.state.newFileType === 'server' ? 'blue' : 'green'}
                    style={{ width: '100%', textAlign: 'center' }}
                >
                    {this.state.newFileType === 'server' ? 'Server File' : 'Client File'}
                </Tag>
            </Form.Item>

            <Form.Item name='fileName' validateStatus={this.state.newFileValidate}>
                <Input placeholder='Input your file name' onInput={this.onFileNameInput.bind(this)} />
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type='ghost' onClick={this.onCreateNewFile.bind(this)} block>
                    Create
                </Button>
            </Form.Item>
        </Form>;

        let currentPage = <div></div>;

        switch (this.state.currentPage) {
            case 'none':
                currentPage = none;
                break;
            case 'editor':
                currentPage = editor;
                break;
            case 'newFile':
                currentPage = newFile;
                break;
        }

        return (
            <Rnd
                size={{ width: this.state.width,  height: this.state.height }}
                position={{ x: this.state.x, y: this.state.y }}
                onDrag={this.onDrag.bind(this)}
                onDragStop={this.onDrag.bind(this)}
                onDragStart={this.onDrag.bind(this)}
                onResize={this.onResize.bind(this)}
                onResizeStart={this.onResize.bind(this)}
                onResizeStop={this.onResize.bind(this)}
                minWidth={300}
                minHeight={300}
                bounds='body'
                cancel='.no'
            >
                <Window
                    chrome
                    height={this.state.height}
                    padding='10px'
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
                    <Layout className='no' style={{ width: parseInt(this.state.width) - 20, height: parseInt(this.state.height) - 50, backgroundColor: 'white' }}>
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
                            <Sider width='auto' style={{ backgroundColor: 'white', overflow: "scroll", paddingRight: '10px' }}>
                                <img src={vCode} height="50vh" style={{ margin: '20px 40px' }} />
                                {this.state.files.length !== 0 ? <List
                                    itemLayout="horizontal"
                                    dataSource={this.state.files}
                                    renderItem={(file) => (
                                    <List.Item 
                                        style={{ backgroundColor: this.state.currentFile === file.name ? 'yellow' : 'white' }}
                                        actions={[<FaEdit onClick={this.onFileEdit.bind(this, file.name)} />, <MdDelete onClick={this.onFileDelete.bind(this, file.name)} />]}
                                    >
                                        <List.Item.Meta
                                            avatar={file.type === 'server' ? <FaServer color="#4190eb" size='20px'/> : <FaDesktop color="#4190eb" size='20px'/>}
                                            description={file.name}
                                        />
                                    </List.Item>
                                    )}
                                /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            </Sider>
                            <Content style={{ paddingTop: '10px' }}>
                                {currentPage}
                            </Content>
                        </Layout>
                    </Layout>
                </Window>
            </Rnd>
        );
    }

}