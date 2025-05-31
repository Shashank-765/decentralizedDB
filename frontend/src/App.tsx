import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

import type { Book } from './types';
import Homepage from './pages/homepage';
import Edit from './pages/edit';
import ForgotPassword from './pages/forgetpassword';
import Header from './pages/header';
import UploadPage from './pages/upload';
import Footer from './pages/footer';
import { ToastContainer } from 'react-toastify';
import UserDashboard from './pages/dashboard';
import UserProfile from './pages/profile';
import config from "../config.json"
import ProtectedRoute from './pages/protectedRoutes';
import RestrictToUsersOnly from './pages/RestrictedUserRoutes';
import ViewDocuments from './pages/viewDocuments';
import NotFound from './pages/notFound'

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userObj = JSON.parse(userString);
      setUser(userObj);
    } else {
      setUser(null);
    }
  }

  , []);

  useEffect(() => {
    console.log("Fetching Books...", books);
    const getBooks = async () => {
      const response = await fetch(`${config.URL_BACKEND}books`);
      const data = await response.json();
      setBooks(data);
    };
    getBooks();
  }, []);

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
      document.title = frames[index].title;

      const favicon = document.querySelector("link[rel='shortcut icon']");
      if (favicon) {
        favicon.setAttribute("href", frames[index].favicon);
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
        <Route
          path="/upload"
          element={
            <RestrictToUsersOnly user={user}>
              <UploadPage />
            </RestrictToUsersOnly>
          }
        />

        <Route
          path="/profile"
          element={
            <RestrictToUsersOnly user={user}>
              <UserProfile />
            </RestrictToUsersOnly>
          }
        />

        <Route
          path="/edit"
          element={
            <RestrictToUsersOnly user={user}>
              <Edit />
            </RestrictToUsersOnly>
          }
        />

        <Route
          path="/forgotpass"
          element={
            <RestrictToUsersOnly user={user}>
              <ForgotPassword />
            </RestrictToUsersOnly>
          }
        />
        <Route
          path='/viewdocuments'
          element={<ViewDocuments />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} allowedTypes={["Admin"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
