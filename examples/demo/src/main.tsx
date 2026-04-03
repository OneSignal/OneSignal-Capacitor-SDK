import { setupIonicReact } from '@ionic/react';
import { createRoot } from 'react-dom/client';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import App from './App';

setupIonicReact();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
