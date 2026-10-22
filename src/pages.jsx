import {useState} from 'react';import {Link,useParams,useSearchParams} from 'react-router-dom';
import {api,useAsync} from './api.js';import {fmt,toCents,useCart} from './cart.jsx';
import {Img,ProductCard,Skeletons,ErrorBox,Empty,NAME} from './ui.jsx';

export function Home(){
  const cats=useAsync(s=>api.categories(s),[]);const prods=useAsync(s=>api.products({page:0,size:8},s),[]);
  const list=prods.data?.content||[];
  return <>
  <section className="hero"><div className="hero-copy"><h1>Everything you need, delivered to your door.</h1>
    <p>Browse the full catalogue, pick your size and colour, and order in one step. Delivery is priced by your state.</p>
    <Link to="/products" className="btn big">Shop all products</Link></div>
    <div className="mosaic" aria-hidden={list.length===0}>{list.slice(0,4).map((p,i)=><Link key={p.id} to={`/products/${p.id}`} className={'m m'+i}><Img src={p.mainImg} alt={p.name}/></Link>)}</div></section>
  <section className="sec"><div className="sec-h"><h2>Shop by category</h2></div>
    {cats.loading?<div className="cats">{[0,1,2,3].map(i=><div key={i} className="cat skel"/>)}</div>
    :cats.error?<ErrorBox error={cats.error} retry={cats.retry}/>
    :!cats.data?.length?<Empty title="No categories yet"/>
    :<div className="cats">{cats.data.map(c=><Link key={c.id} to={`/products?category=${c.id}`} className="cat"><Img src={c.img} alt=""/><div><h3>{c.name}</h3><p>{c.description}</p></div></Link>)}</div>}</section>
  <section className="sec"><div className="sec-h"><h2>Latest products</h2><Link to="/products" className="link">See everything</Link></div>
    {prods.loading?<Skeletons n={4}/>:prods.error?<ErrorBox error={prods.error} retry={prods.retry}/>
    :!list.length?<Empty title="No products yet"/>:<div className="grid">{list.slice(0,8).map(p=><ProductCard key={p.id} p={p}/>)}</div>}</section>
  </>;
}

export function Products(){
  const [sp,setSp]=useSearchParams();const cat=sp.get('category')||'';const q=sp.get('q')||'';const page=Number(sp.get('page')||0);
  const [draft,setDraft]=useState(q);
  const cats=useAsync(s=>api.categories(s),[]);
  // category -> GET /categories/{id} (returns its products); otherwise paged list or server-side search
  const res=useAsync(async s=>{
    if(cat){const c=await api.category(cat,s);return {title:c.name,items:c.products||[],total:(c.products||[]).length}}
    const d=q?await api.searchProducts({query:q,page,size:12},s):await api.products({page,size:12},s);
    return {title:q?`Results for “${q}”`:'All products',items:d.content||[],total:d.page?.totalElements,pages:d.page?.totalPages||1};
  },[cat,q,page]);
  const set=o=>{const n=new URLSearchParams(sp);Object.entries(o).forEach(([k,v])=>v?n.set(k,v):n.delete(k));setSp(n)};
  const d=res.data;
  return <div className="sec page"><div className="sec-h"><div><h1>{d?.title||'Products'}</h1>{d&&<p className="muted">{d.total} product{d.total===1?'':'s'}</p>}</div>
    {!cat&&<form className="search" onSubmit={e=>{e.preventDefault();set({q:draft.trim(),page:''})}} role="search"><label className="sr" htmlFor="q">Search products</label>
      <input id="q" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Search products"/><button className="btn">Search</button></form>}</div>
    <div className="chips" role="group" aria-label="Categories"><button className={!cat?'on':''} onClick={()=>setSp({})}>All</button>
      {(cats.data||[]).map(c=><button key={c.id} className={cat===c.id?'on':''} onClick={()=>setSp({category:c.id})}>{c.name}</button>)}</div>
    {res.loading?<Skeletons n={8}/>:res.error?<ErrorBox error={res.error} retry={res.retry}/>
    :!d.items.length?<Empty title="No products found"><button className="btn" onClick={()=>{setDraft('');setSp({})}}>Back to all products</button></Empty>
    :<><div className="grid">{d.items.map(p=><ProductCard key={p.id} p={p}/>)}</div>
      {d.pages>1&&<div className="pager"><button className="btn ghost" disabled={page<=0} onClick={()=>set({page:page-1||''})}>Previous</button><span>Page {page+1} of {d.pages}</span>
      <button className="btn ghost" disabled={page+1>=d.pages} onClick={()=>set({page:page+1})}>Next</button></div>}</>}</div>;
}

export function ProductPage(){
  const {id}=useParams();const {add}=useCart();
  const r=useAsync(s=>api.product(id,s),[id]);const [qty,setQty]=useState(1);const [size,setSize]=useState('');const [color,setColor]=useState('');
  const [img,setImg]=useState(null);const [added,setAdded]=useState(false);
  if(r.loading)return <div className="sec page"><div className="pdp"><div className="pimg skel big"/><div><div className="skel line"/><div className="skel line s"/></div></div></div>;
  if(r.error)return <div className="sec page">{r.error.status===404||r.error.status===400?<Empty title="Product not found"><Link className="btn" to="/products">Back to products</Link></Empty>:<ErrorBox error={r.error} retry={r.retry}/>}</div>;
  const p=r.data;const imgs=[p.mainImg,...(p.extraImgs||[])].filter(Boolean);const cur=img||imgs[0];
  const needs=(p.sizes?.length&&!size)||(p.colors?.length&&!color);const out=p.available===false;
  return <div className="sec page"><Link to={p.categoryId?`/products?category=${p.categoryId}`:'/products'} className="link">Back to {p.category||'products'}</Link>
    <div className="pdp"><div><div className="pimg big"><Img src={cur} alt={p.name}/></div>
      {imgs.length>1&&<div className="thumbs">{imgs.map(u=><button key={u} className={u===cur?'on':''} onClick={()=>setImg(u)} aria-label="Show image"><Img src={u} alt=""/></button>)}</div>}</div>
    <div className="info"><p className="muted">{p.category}</p><h1>{p.name}</h1><p className="price xl">{fmt(toCents(p.price))}</p>
      {p.description&&<p className="desc">{p.description}</p>}
      {!!p.sizes?.length&&<fieldset><legend>Size</legend><div className="opts">{p.sizes.map(s=><button key={s} className={size===s?'on':''} onClick={()=>setSize(s)}>{s}</button>)}</div></fieldset>}
      {!!p.colors?.length&&<fieldset><legend>Colour</legend><div className="opts">{p.colors.map(c=><button key={c} className={color===c?'on':''} onClick={()=>setColor(c)}>{c}</button>)}</div></fieldset>}
      <div className="buy"><div className="qty"><button aria-label="Decrease" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button><span aria-live="polite">{qty}</span><button aria-label="Increase" onClick={()=>setQty(q=>Math.min(99,q+1))}>+</button></div>
        <button className="btn big" disabled={out||needs} onClick={()=>{add(p,{size:size||undefined,color:color||undefined,qty});setAdded(true);setTimeout(()=>setAdded(false),1800)}}>{out?'Sold out':added?'Added to cart':'Add to cart'}</button></div>
      {needs&&!out&&<p className="muted">Choose {[p.sizes?.length&&!size&&'a size',p.colors?.length&&!color&&'a colour'].filter(Boolean).join(' and ')} to continue.</p>}
      {added&&<Link to="/checkout" className="link">Go to checkout</Link>}</div></div></div>;
}

export function Checkout(){
  const {items,subtotal,setQty,remove,clear}=useCart();
  const st=useAsync(s=>api.states(s),[]);
  const [f,setF]=useState({customerFirstName:'',customerLastName:'',customerPhone:'',shippingAddress:'',state:''});
  const [busy,setBusy]=useState(false);const [err,setErr]=useState('');const [done,setDone]=useState(null);
  const on=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const state=(st.data||[]).find(s=>String(s.id)===f.state);
  // Orders carry a shipping address, so home-delivery pricing (deliveryToHome) is applied. Backend result is authoritative.
  const fee=state?toCents(state.deliveryToHome):null;const total=subtotal+(fee||0);
  const submit=async e=>{e.preventDefault();if(busy||!state)return;setBusy(true);setErr('');
    try{const o=await api.createOrder({...f,state:Number(f.state),orderItems:items.map(i=>({productId:i.id,color:i.color,size:i.size,quantity:i.qty,price:i.price}))});
      setDone(o);clear();}catch(x){setErr(x.message)}finally{setBusy(false)}};
  if(done)return <div className="sec page"><div className="state ok"><h1>Order received</h1><p>Order reference {done.id}. Status: {done.status}.</p>
    <dl className="sum"><div><dt>Products</dt><dd>{fmt(toCents(done.productsPrice))}</dd></div><div><dt>Delivery</dt><dd>{fmt(toCents(done.deliveryPrice))}</dd></div><div className="tot"><dt>Total</dt><dd>{fmt(toCents(done.totalPrice))}</dd></div></dl>
    <Link className="btn" to="/products">Keep shopping</Link></div></div>;
  if(!items.length)return <div className="sec page"><Empty title="Your cart is empty"><Link className="btn" to="/products">Browse products</Link></Empty></div>;
  return <div className="sec page"><h1>Checkout</h1><div className="co">
    <form onSubmit={submit}><div className="two"><label>First name<input required maxLength={50} value={f.customerFirstName} onChange={on('customerFirstName')} autoComplete="given-name"/></label>
      <label>Last name<input required maxLength={50} value={f.customerLastName} onChange={on('customerLastName')} autoComplete="family-name"/></label></div>
      <label>Phone<input required type="tel" value={f.customerPhone} onChange={on('customerPhone')} autoComplete="tel"/></label>
      <label>State<select required value={f.state} onChange={on('state')} disabled={st.loading}><option value="">{st.loading?'Loading…':'Select your state'}</option>{(st.data||[]).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      {st.error&&<ErrorBox error={st.error} retry={st.retry}/>}
      <label>Shipping address<textarea required rows={3} value={f.shippingAddress} onChange={on('shippingAddress')} autoComplete="street-address"/></label>
      {err&&<p className="err" role="alert">Order failed: {err}</p>}
      <button className="btn big" disabled={busy||!state}>{busy?'Placing order…':'Place order'}</button></form>
    <aside className="cartbox"><h2>Your order</h2>
      {items.map(i=><div className="line" key={i.key}><Img src={i.img} alt={i.name}/><div><b>{i.name}</b><small>{[i.size,i.color].filter(Boolean).join(' / ')}</small>
        <div className="qty sm"><button aria-label="Decrease" onClick={()=>setQty(i.key,i.qty-1)}>−</button><span>{i.qty}</span><button aria-label="Increase" onClick={()=>setQty(i.key,i.qty+1)}>+</button><button className="rm" onClick={()=>remove(i.key)}>Remove</button></div></div>
        <span>{fmt(toCents(i.price)*i.qty)}</span></div>)}
      <dl className="sum"><div><dt>Products subtotal</dt><dd>{fmt(subtotal)}</dd></div>
        <div><dt>Delivery fee</dt><dd>{state?fmt(fee):'Select a state'}</dd></div>
        <div className="tot"><dt>Final total</dt><dd>{state?fmt(total):'—'}</dd></div></dl>
      <p className="muted">The server confirms the final amounts when the order is placed.</p></aside></div></div>;
}
