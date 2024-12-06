import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Homepage from "./components/landing_page";
import SignIn from "./components/shared/SignIn";
import SignUp from "./components/shared/SignUp";
import Dashboard from "./components/dashboard";
import UserInfo from "./components/dashboard/userInfo/userInfo";
import Time from "./components/dashboard/time/time";
import Park from "./components/dashboard/park/park";
// import Reservation from "./components/dashboard/reservation/reservation";
import Privacy from "./components/shared/privacy/privacy";
import Terms from "./components/shared/terms/terms";
import Team from "./components/shared/team/team";
import NotFound from "./components/shared/error/NotFound";

import "./App.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/userInfo" element={<UserInfo />} />
          <Route path="/dashboard/time" element={<Time />} />
          <Route path="/dashboard/park" element={<Park />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/team" element={<Team />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <div>
          <ToastContainer />
        </div>
      </Router>
    </>
  );
}

export default App;
