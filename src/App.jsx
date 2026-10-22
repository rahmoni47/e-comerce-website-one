import {Routes,Route,useLocation} from 'react-router-dom';import {useEffect} from 'react';
import {Header,Footer,Empty} from './ui.jsx';import {Home,Products,ProductPage,Checkout} from './pages.jsx';
export default function App(){const {pathname}=useLocation();useEffect(()=>window.scrollTo(0,0),[pathname]);
  return <><Header/><main><Routes><Route path="/" element={<Home/>}/><Route path="/products" element={<Products/>}/>
    <Route path="/products/:id" element={<ProductPage/>}/><Route path="/checkout" element={<Checkout/>}/>
    <Route path="*" element={<div className="sec page"><Empty title="Page not found"/></div>}/></Routes></main><Footer/></>}
