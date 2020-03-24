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
import { Menu, Layout, Modal, Tag, List, Avatar } from 'antd';
import vCode from '../assets/images/vCode.png';

const { Sider, Content, Header } = Layout;

const data = [
    {
      title: 'Ant Design Title 1',
    },
    {
      title: 'Ant Design Title 2',
    },
    {
      title: 'Ant Design Title 3',
    },
    {
      title: 'Ant Design Title 4',
    },
];

class App extends Component {

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
        modalVisible: false
    };

    menuItems = {

    };

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
        
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    render() {
        const {items} = this.state;

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
                        title={<div><FaFileCode /> vCode</div>} 
                        onMaximizeClick={this.onMaximizeClick.bind(this)}
                        onMinimizeClick={this.onMinimizeClick.bind(this)}
                        onCloseClick={this.onCloseClick.bind(this)}
                        controls
                        isMaximized={false}
                    />
                    <Layout className='no' style={{ width: parseInt(this.state.width) - 20, height: parseInt(this.state.height) - 50, backgroundColor: 'white' }}>
                        <Sider width='auto' style={{ backgroundColor: 'white', overflow: "scroll", paddingRight: '10px' }}>
                            <img src={vCode} height="50vh" style={{ margin: '0px 40px', marginBottom: '20px' }} />
                            <List
                                itemLayout="horizontal"
                                dataSource={data}
                                renderItem={item => (
                                <List.Item actions={[<FaEdit />, <MdDelete />]}>
                                    <List.Item.Meta
                                    avatar={<FaDesktop size='20px'/>}
                                    description="Server File"
                                    />
                                </List.Item>
                                )}
                            />
                        </Sider>
                        <Layout style={{ backgroundColor: 'white' }}>
                            <Header style={{ padding: '0px', height: 'auto', paddingBottom: '30px', backgroundColor: 'white' }}>
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
                            <Content>
                                <MonacoEditor
                                    width={parseInt(this.state.width) - 20}
                                    height={parseInt(this.state.height) - 130}
                                    language='javascript'
                                    theme='vs'
                                    value={this.state.code}
                                    onChange={this.onChange.bind(this)}
                                />
                            </Content>
                        </Layout>
                    </Layout>
                    <Modal
                        title="Vertically centered modal dialog"
                        centered
                        visible={this.state.modalVisible}
                        onOk={() => this.setModalVisible(false)}
                        onCancel={() => this.setModalVisible(false)}
                    >
                        <p>some contents...</p>
                        <p>some contents...</p>
                        <p>some contents...</p>
                    </Modal>
                </Window>
            </Rnd>
        );
    }

} 

export default App;
