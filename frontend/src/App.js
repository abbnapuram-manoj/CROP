import React,{useState,createContext,useContext} from "react";
import {BrowserRouter,Routes,Route,NavLink} from "react-router-dom";
import T from "./i18n/translations";
import Home    from "./pages/Home";
import Input   from "./pages/Input";
import Result  from "./pages/Result";
import History from "./pages/History";
import About   from "./pages/About";
import "./App.css";

export const Ctx = createContext();
export const useApp = () => useContext(Ctx);

function Navbar(){
  const {lang,setLang,t}=useApp();
  const [open,setOpen]=useState(false);
  return(
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-emoji">🌾</span>
        <div>
          <div className="nav-name">{t.appName}</div>
          <div className="nav-tag">{t.tagline}</div>
        </div>
      </div>
      <button className="hamburger" onClick={()=>setOpen(o=>!o)}>☰</button>
      <div className={`nav-links ${open?"open":""}`} onClick={()=>setOpen(false)}>
        <NavLink to="/" end>{t.nav.home}</NavLink>
        <NavLink to="/input">{t.nav.input}</NavLink>
        <NavLink to="/history">{t.nav.history}</NavLink>
        <NavLink to="/about">{t.nav.about}</NavLink>
      </div>
      <div className="lang-pills">
        {[["en","EN"],["te","తె"],["hi","हि"]].map(([l,label])=>(
          <button key={l} className={`lang-pill ${lang===l?"active":""}`} onClick={()=>setLang(l)}>{label}</button>
        ))}
      </div>
    </nav>
  );
}

export default function App(){
  const [lang,setLang]     = useState("en");
  const [result,setResult] = useState(null);
  const [locInfo,setLoc]   = useState(null);
  const t = T[lang]||T["en"];
  return(
    <Ctx.Provider value={{lang,setLang,t,result,setResult,locInfo,setLoc}}>
      <BrowserRouter>
        <div className="shell">
          <Navbar/>
          <main className="body">
            <Routes>
              <Route path="/"        element={<Home/>}/>
              <Route path="/input"   element={<Input/>}/>
              <Route path="/result"  element={<Result/>}/>
              <Route path="/history" element={<History/>}/>
              <Route path="/about"   element={<About/>}/>
            </Routes>
          </main>
          <footer className="foot">
            🌱 CROP v2.0 — Vignan's University Field Project 2025–26 | CSE Dept
          </footer>
        </div>
      </BrowserRouter>
    </Ctx.Provider>
  );
}
