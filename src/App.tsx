import React from 'react';
import Button from './components/Button/button';
import { ButtonSize, ButtonType } from './components/Button/buttonTypes';

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <h1>hello world</h1>
        <h2>hello world</h2>
        <h3>hello world</h3>
        <Button onClick={e => { e.preventDefault(); alert('123') }}>hello</Button>
        <Button btnType='primary' size='lg'>hello</Button>
        <Button btnType='danger'>hello</Button>
      </header>
    </div>
  );
}

export default App;
