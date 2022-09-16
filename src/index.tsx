import ReactDOM from 'react-dom/client';
import './index.css';

import { App } from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

ReactDOM.createRoot(rootEl).render(<App />);
