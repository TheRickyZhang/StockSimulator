import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Market from './Market';
// import Vote from './Vote';

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Market />} />
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
      </BrowserRouter>
  );
};

export default App;
