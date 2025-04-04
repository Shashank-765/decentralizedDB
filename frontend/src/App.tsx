import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

import type { Book } from './types';
import Homepage from './pages/homepage';
import Header from './pages/header';
import UploadPage from './pages/upload';
import Footer from './pages/footer';
import { ToastContainer} from 'react-toastify';
import UserDashboard from './pages/dashboard';
import UserProfile from './pages/profile';
import config from "../config.json"


function App() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    console.log("Fetching Books...",books);
    const getBooks = async () => {
      const response = await fetch(`${config.URL_BACKEND}books`);
      const data = await response.json();
      setBooks(data);
    };
    getBooks();
  }, []);

  // ✅ Animated Title and Favicon
  useEffect(() => {
    const frames = [
      { title: "🌍 D", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 De", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Dec", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Dece", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decen", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decent", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentr", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentra", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentral", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentrali", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentraliz", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentralize", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentralized", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentralized D", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentralized DB", favicon: "/decentralizedDb/vite1.gif" },
      { title: "🌍 Decentralized DB", favicon: "/decentralizedDb/vite1.gif" },
     
    ];

    let index = 0;
    const interval = setInterval(() => {
      document.title = frames[index].title; // Update tab title

      const favicon = document.querySelector("link[rel='shortcut icon']");
      if (favicon) {
        favicon.setAttribute("href", frames[index].favicon); // Update favicon
      }

      index = (index + 1) % frames.length;
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <ToastContainer />
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
      <Footer />

    </Router>
  );
}

export default App;
