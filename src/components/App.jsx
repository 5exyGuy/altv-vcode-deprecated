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
import { FaFileCode, FaImage } from 'react-icons/fa';
import { AiFillSnippets } from 'react-icons/ai';
import { Menu, Layout } from 'antd';
import vCode from '../assets/images/vCode.png';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { Sider, Content, Header } = Layout;
  
// fake data generator
const getItems = count =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k}`,
    content: `item ${k}`
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250
});

class App extends Component {

    state = {
        prevWidth: 600,
        prevHeight: 500,
        isMaximized: false,
        width: 600,
        height: 500,
        prevX: 600,
        prevY: 100,
        x: 100,
        y: 100,
        code: `// This is a sample client code snippet\n\nalt.onServer('myEvent', onMyEvent);\n\nfunction onMyEvent(arg1, arg2) {\n\talt.log('myEvent is called');\n}`,
        items: getItems(5)
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

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }
    
        const items = reorder(
            this.state.items,
            result.source.index,
            result.destination.index
        );
    
        this.setState({
            items
        });
    }

    render() {
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
                            title={<div><FaFileCode /> vEditor</div>} 
                            onMaximizeClick={this.onMaximizeClick.bind(this)}
                            onMinimizeClick={this.onMinimizeClick.bind(this)}
                            onCloseClick={this.onCloseClick.bind(this)}
                            controls
                            isMaximized={false}
                        />
                        <Layout className='no' style={{ width: parseInt(this.state.width) - 20 }}>
                            <Sider width='auto' style={{ backgroundColor: 'white', overflow: "scroll" }}>
                                <img src={vCode} height="50vh" style={{ margin: '0px 20px' }} />
                                    <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
                                        <Droppable droppableId='droppable'>
                                        {(provided, snapshot) => (
                                            <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            style={getListStyle(snapshot.isDraggingOver)}
                                            >
                                            {this.state.items.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}
                                                    >
                                                    {item.content}
                                                    </div>
                                                )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            </div>
                                        )}
                                        </Droppable>
                                    </DragDropContext>
                            </Sider>
                            <Layout>
                                <Header style={{ padding: '0px', height: 'auto' }}>
                                    {/* <img src={vCode} height='90vh' /> */}
                                    <Menu mode='horizontal' onClick={this.onMenuItemClick.bind(this)}>
                                        <Menu.SubMenu
                                            title={
                                                <span className="submenu-title-wrapper">
                                                    <FaFileCode size='2vh' /> File
                                                </span>
                                            }
                                        >
                                            <Menu.Item key="serverFile">New Server File...</Menu.Item>
                                            <Menu.Item key="clientFile">New Client File...</Menu.Item>
                                        </Menu.SubMenu>
                                        <Menu.Item key='snippets'><AiFillSnippets size='2vh' /> Snippets (Soon)</Menu.Item>
                                       <Menu.SubMenu
                                            title={
                                                <span className="submenu-title-wrapper">
                                                    <FaImage size='2vh' /> Theme
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
                                        height={parseInt(this.state.height) - 100}
                                        language='javascript'
                                        theme='vs'
                                        value={this.state.code}
                                        onChange={this.onChange.bind(this)}
                                    />
                                </Content>
                            </Layout>
                        </Layout>
                    </Window>
                </Rnd>
        );
    }

} 

export default App;
