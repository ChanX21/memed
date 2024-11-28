import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './compoments/Navbar';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<div/>} />
          {/*<Route path="/create-token" element={<CreateToken />} />
          <Route path="/token/:id" element={<TokenPage />} />*/}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
