import React from 'react'
require('es6-promise').polyfill();
require('isomorphic-fetch');

import ReactQuill from 'react-quill';
import OmegaLogo from '../assets/OmegaSpace.png';
import GithubLogo from '../assets/GithubLogo.png';

import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:8000');

import './Home.css'
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
let CodeMirror = require('react-codemirror');
let MirrorConsole = require('codemirror-console');
let mirror_editor = new MirrorConsole();

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = { text: '', savedStatus: 'not saving' }
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveStatus = this.handleSaveStatus.bind(this);
    this.toggleReadOnly = this.toggleReadOnly.bind(this);
    // this.results = this.results.bind(this);
    // this.valueGetter = this.valueGetter.bind(this);
  }

  componentDidMount(){
      fetch('/api/gettext')
        .then(res => res.json())
        .then(data => this.setState({ text: data }));
        // socket.on('subscribeToText', (text) => {
        //   this.setState({text: text});
        // });
    };

  handleChange(value) {
    let status = '';
    let val = this.refs.editor.props.value;

    if (value.length !== this.state.text.length) {
        console.log("I am Emitting");
        // socket.emit('toText', value);
        status = 'Changes not saved.'
      };
      this.setState({text: value, savedStatus: status});
      // console.log(this.refs.editor.getCodeMirror().getValue())

      console.log(mirror_editor.runInContext({console: console.log(val)}, function(err, res) {
        if (err) console.log(err)
      }));
  };

  // valueGetter() {
  //   console.log(CodeMirror.getValue());
  // }

  handleSaveStatus(status){
    this.setState({savedStatus: status})
    if (status === 'Saved!'){
      setTimeout(() => {
        this.setState({savedStatus: 'not saving'})
      },2000)
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

  toggleReadOnly() {
    console.log(this.refs.editor.getCodeMirror().getValue())
    this.setState({text: this.refs.editor.getCodeMirror().getValue() })
  }

  results() {
    return eval(this.refs.editor.codeMirror.getValue())
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

    let resultS = eval(JSON.stringify(this.state.text))

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
        <CodeMirror ref='editor' value={this.state.text} onChange={this.handleChange} options={{mode: 'javascript', lineNumbers: true}}/>
        <div style={{ marginTop: 10 }}>
          <select onChange={this.changeMode} value={this.state.mode}>
            <option value="markdown">Markdown</option>
            <option value="javascript">JavaScript</option>
          </select>
          <button onClick={this.toggleReadOnly}></button>
        </div>
        <div>
          { resultS }
        </div>
        {/* <ReactQuill placeholder={'Start your Omega journey... '} value={this.state.text} onChange={this.handleChange} /> */}
      </div>
    );
  }
};

export default Home;