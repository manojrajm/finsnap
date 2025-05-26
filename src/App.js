import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import BillingForm from "./components/BillingForm";
import Homepage from "./components/HomePage";
import Invoice from "./components/Invoice";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/billing-form" element={<BillingForm />} />
        <Route path="/invoice" element={<Invoice />} />

      </Routes>
    </Router>
    // <>
    // <Invoice/>
    // </>

  );
};

export default App;
