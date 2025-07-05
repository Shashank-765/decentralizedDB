import { HashRouter as Router, Routes, Route,useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import type { Book } from './types';
import Homepage from './pages/homepage';
import Header from './pages/header';
import Footer from './pages/footer';
import { ToastContainer } from 'react-toastify';
import AdminDashboard from './pages/adminDashboard';
import UserProfile from './pages/profile';
import UserDashboard from './pages/userDashboard';
import config from "../config.json"
import ProtectedRoute from './pages/protectedRoutes';
import RestrictToUsersOnly from './pages/RestrictedUserRoutes';
import ViewDocuments from './pages/viewDocuments';
import SuperAdminDashboard from './pages/superAdminDashboard';
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

  const ScrollToTop = () => {
    const location = useLocation();
  
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);
  
    return null;
  };  

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
      <ScrollToTop />
      <ToastContainer position="top-right"
        autoClose={1000}  
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" />
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/home" element={<Homepage />} />
        <Route
          path="/profile"
          element={
            <RestrictToUsersOnly user={user}>
              <UserProfile />
            </RestrictToUsersOnly>
          }
        />
        <Route
          path="/superadmin"
          element={
            // <ProtectedRoute user={user} allowedTypes={["SuperAdmin"]}>
              <SuperAdminDashboard />
            // </ProtectedRoute>
          }
        />
        <Route
          path='/viewdocuments'
          element={<ViewDocuments />}
        />
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute user={user} allowedTypes={["Admin", "User"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userDashboard"
          element={
            <ProtectedRoute user={user} allowedTypes={["User", "Admin"]}>
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
