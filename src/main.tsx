import { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeNativeAuth } from '@/utils/nativeAuthSetup';

// Initialize native auth plugins for mobile
initializeNativeAuth().catch(console.error);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
