import {useEffect,useState} from 'react';
const BASE=(import.meta.env.VITE_API_BASE_URL||'https://store-1-r9p7.onrender.com').replace(/\/$/,'');
async function req(path,{params,signal,method='GET',body}={}){
  const url=new URL(BASE+path);
  Object.entries(params||{}).forEach(([k,v])=>v!=null&&v!==''&&url.searchParams.set(k,v));
  const r=await fetch(url,{method,signal,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
  if(!r.ok){let m;try{const j=await r.json();m=j.message||j.error||(j.errors&&JSON.stringify(j.errors))}catch{}
    throw Object.assign(new Error(m||`Request failed (${r.status})`),{status:r.status})}
  const t=await r.text();return t?JSON.parse(t):null;
}
export const api={
  products:(params,signal)=>req('/api/v1/products',{params,signal}),            // GET paged list
  searchProducts:(params,signal)=>req('/api/v1/products/search',{params,signal}), // GET ?query=
  product:(id,signal)=>req(`/api/v1/products/${id}`,{signal}),
  categories:(signal)=>req('/api/v1/categories/all',{signal}),
  category:(id,signal)=>req(`/api/v1/categories/${id}`,{signal}),               // includes its products
  states:(signal)=>req('/api/v1/states/available',{signal}),                    // delivery prices per state
  createOrder:(body)=>req('/api/v1/orders',{method:'POST',body}),
};
export function useAsync(fn,deps){
  const [s,set]=useState({loading:true});const [n,setN]=useState(0);
  useEffect(()=>{const c=new AbortController();set({loading:true});
    fn(c.signal).then(data=>set({data}),e=>{if(e.name!=='AbortError')set({error:e})});
    return()=>c.abort();// eslint-disable-next-line
  },[...deps,n]);
  return {...s,retry:()=>setN(x=>x+1)};
}
