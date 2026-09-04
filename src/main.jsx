import { createRoot } from 'react-dom/client'
import './index.css'
import './responsive.css'
import 'react-awesome-slider/dist/styles.css';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'
import ImagePortalManager from './portals/ImagePortalManager.jsx';
import LoginPortalManager from './portals/LoginPortal.jsx';
import ApplyJobPortalManager from './portals/ApplyJobPortal.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContextProvider>
      <App />
      <ImagePortalManager />
      <LoginPortalManager />
      <ApplyJobPortalManager />
    </AppContextProvider>
  </BrowserRouter>,
)
