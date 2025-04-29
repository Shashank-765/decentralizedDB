import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="301195259865-qjq17fdpsk2nt1vuticdd6f9biu2hlg6.apps.googleusercontent.com">
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </GoogleOAuthProvider>,
)
