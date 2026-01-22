import { createRoot } from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import FrontPage from './components/FrontPage';
import Login from './components/Login';
import Callback from './components/Callback';
import Contracts from './components/contracts/Contracts';
import Director from './components/director/Director';
import Forbidden from './components/Forbidden';
import NotFound from './components/NotFound';
import InternalError from './components/InternalError';
import WithLogin from "./components/WithLogin";
import { BrowserRouter, Routes, Route } from "react-router-dom"

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/contracts" element={<WithLogin page={<Contracts />} />} />
      <Route path="/director" element={<WithLogin page={<Director />} />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/500" element={<InternalError />} />
    </Routes>
  </BrowserRouter>
);

reportWebVitals();