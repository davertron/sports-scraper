import { render } from 'preact';
import { App } from './App';

const container = document.getElementById('guitar-app');
if (!container) throw new Error('Could not find guitar-app element');
render(<App />, container);
