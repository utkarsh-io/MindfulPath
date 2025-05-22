// App.jsx

import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/chat";
import ExpertDashboard from "./pages/ExpertDashboard";
import MLmodel from "./pages/MLmodel";
//import VideoCall from "./pages/VideoCall";
import Chatbot from "./pages/chatbot"
import CounsellorApplicationForm from "./pages/CounsellorApplicationForm";
import ThanksForApplying from "./pages/ThanksForApplying";
import AdminLogin from "./pages/admin_login";
import AdminDashboard from "./pages/AdminDashboard";
import Hirecounsellors from "./pages/hirecounsellors";

function App() {
  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300">
  
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/expertdashboard" element={<ExpertDashboard />} />
        <Route path="/chat/:room" element={<Chat />} />
        <Route path="/MLmodel" element={<MLmodel />} />
        
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/counsellorapplicationform" element={<CounsellorApplicationForm />} />
        <Route path="/application-received" element={<ThanksForApplying />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/hirecounsellors" element={<Hirecounsellors />} />
      </Routes>

      <footer className="p-10 text-center bg-base-300 text-base-content">
      <p>© {new Date().getFullYear()} MindfulPath. All rights reserved.</p>
     
      </footer>
    </div>
  );
}

// make a profile page as well

export default App;
