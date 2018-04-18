import React from 'react'
import vm from 'vm'
import CodeMirror from 'react-codemirror'

require('es6-promise').polyfill();
require('isomorphic-fetch');

import ReactQuill from 'react-quill';
import OmegaLogo from '../assets/OmegaSpace.png';
import GithubLogo from '../assets/GithubLogo.png';

import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:8000');

import './Home.css'
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

const sandbox = {}
vm.createContext(sandbox)

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = { text: '', savedStatus: 'not saving', execution: null }
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveStatus = this.handleSaveStatus.bind(this);
    this.runCode = this.runCode.bind(this);
    this.moveCursorToEnd = this.moveCursorToEnd.bind(this)
  }

  componentDidMount(){
      fetch('/api/gettext')
        .then(res => res.json())
        .then(data => this.setState({ text: data }));
        socket.on('subscribeToText', (text) => {
          this.setState({text: text});
        });
    };

  handleChange(value) {
    let status = '';
    // let val = this.refs.editor.props.value;

    if (value.length !== this.state.text.length) {
      // console.log("I am Emitting");
      socket.emit('toText', value);
      status = 'Changes not saved.'
    };
    // let newKey = this.state.key
    this.setState({text: value, savedStatus: status}); 
    // this.refs.editor.getCodeMirror().codemirrorValueChanged(this.state.text, this.state.text)
  };

  handleSaveStatus(status){
    this.setState({savedStatus: status})
    if (status === 'Saved!'){
      setTimeout(() => {
        this.setState({savedStatus: 'not saving'})
      },2000)
    }
  }

  moveCursorToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

  handleSave() {
    this.handleSaveStatus('Loading...')
    fetch('/api/savetext', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: this.state.text})
    })
      .then(res => res.json())
      .then(data => {
        this.handleSaveStatus('Saved!')
      })
  }

  runCode() {
    this.setState({text: this.refs.editor.getCodeMirror().getValue() })
    let text = this.state.text;

    // const sandbox = {}
    // vm.createContext(sandbox)
    // let result = vm.runInContext(text, sandbox)
    // let result = vm.runInNewContext(`${text}`, sandbox)
    let result = eval(text)
    
    this.setState({execution: JSON.stringify(result)})
  }

  render() {
    let { savedStatus } = this.state;
    let saveStatusRender = () => {
      if (savedStatus === 'not saving'){
        return '';
      } else {
        return savedStatus;
      }
    }

    return (
      <div>
        <div className="top-nav">
          <div className="omega-logo">
            <img src={OmegaLogo} alt='OmegaSpace Logo' />
          </div>

          <p className="save-status">{ saveStatusRender() }</p>

          <div onClick={this.handleSave} className="save-button">
            Save
          </div>

          <div className="github-logo">
            <a href="https://github.com/StephenGrable1/OmegaSpace">
              <img src={GithubLogo} alt="Github Logo" />
            </a>
          </div>
        </div>
        <CodeMirror ref='editor' key={this.state.text} value={this.state.text} onChange={(e) => {this.handleChange(e)}} options={{mode: 'javascript', lineNumbers: true, autofocus: true}} onFocus={(e) => this.moveCursorToEnd(e)}/>
        { this.state.text }
        <div style={{ marginTop: 10 }}>
          <button onClick={this.runCode}>Run Code</button>
        </div>
        <div>
        {/* <CodeMirror ref='editor' value={this.state.execution}  options={{mode: 'javascript', lineNumbers: true}}/> */}
          {this.state.execution}
          
          {/* { this.state.execution } */}
        </div>
        {/* <ReactQuill placeholder={'Start your Omega journey... '} value={this.state.text} onChange={this.handleChange} /> */}
      </div>
    );
  }
};

export default Home;