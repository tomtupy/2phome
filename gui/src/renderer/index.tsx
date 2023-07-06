//import newrelic from 'newrelic';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

window.electron.ipcRenderer.getSensorData();
window.electron.ipcRenderer.loadEarthImageryData();
window.electron.ipcRenderer.getDrywellImages();
window.electron.ipcRenderer.getPingData();