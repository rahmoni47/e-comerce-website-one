import {useState} from 'react';import {Link,NavLink} from 'react-router-dom';
import {fmt,toCents,useCart} from './cart.jsx';
export const NAME=import.meta.env.VITE_STORE_NAME||'Your Store';
export function Img({src,alt,className}){const [bad,setBad]=useState(!src);
  return bad?<div className={'img-fallback '+(className||'')} role="img" aria-label={alt}>No image</div>
  :<img className={className} src={src} alt={alt} loading="lazy" onError={()=>setBad(true)}/>}
export function Header(){const {count}=useCart();
  return <header className="hdr"><Link to="/" className="brand">{NAME}</Link>
    <nav aria-label="Main"><NavLink to="/" end>Home</NavLink><NavLink to="/products">All products</NavLink>
    <NavLink to="/checkout" className="cartlink" aria-label={`Cart, ${count} items`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 7h12l-1 12H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
      {count>0&&<b>{count}</b>}</NavLink></nav></header>}
export const Footer=()=><footer className="ftr"><b>{NAME}</b><nav aria-label="Footer"><Link to="/products">All products</Link><Link to="/checkout">Cart</Link></nav></footer>;
export function ProductCard({p}){
  return <Link to={`/products/${p.id}`} className="pcard">
    <div className="pimg"><Img src={p.mainImg} alt={p.name}/>{p.available===false&&<span className="tag">Sold out</span>}</div>
    <div className="pmeta"><h3>{p.name}</h3><span className="price">{fmt(toCents(p.price))}</span></div></Link>}
export const Skeletons=({n=8})=><div className="grid">{Array.from({length:n},(_,i)=><div key={i} className="sk"><div className="pimg skel"/><div className="skel line"/><div className="skel line s"/></div>)}</div>;
export const ErrorBox=({error,retry})=><div className="state" role="alert"><h3>Something went wrong</h3><p>{error?.message||'Could not reach the store.'}</p>{retry&&<button className="btn" onClick={retry}>Try again</button>}</div>;
export const Empty=({title,children})=><div className="state"><h3>{title}</h3>{children}</div>;
