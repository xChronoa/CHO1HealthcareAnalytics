import Appointment from "./pages/Appointment";

import cabuyao_logo from "./assets/cabuyao_logo.png";
import cho_logo from "./assets/cho_logo.png";

import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./utils/PrivateRoute";

// import BarangayDashboard from "./pages/Barangay/BarangayDashboard";

function App() {
    return (
      <div className="relative wrapper">
        <BrowserRouter>
          <Routes>
              <Route element={<Appointment/>} path="/appointment"/>

              <Route element={<Login image={cabuyao_logo}/>} path="/barangay/login"/>
              <Route element={<Login image={cho_logo}/>} path="/admin/login"/>

              <Route element={<PrivateRoute/>} path="/admin">
              </Route>
              
              <Route element={<PrivateRoute/>} path="/barangay">
                {/* <Route element={<BarangayDashboard/>}/> */}
              </Route>
          </Routes>
        </BrowserRouter>
      </div>
    );
}

export default App;
