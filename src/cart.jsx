import {createContext,useContext,useEffect,useMemo,useState} from 'react';
export const toCents=v=>Math.round(Number(v||0)*100);
const CUR=import.meta.env.VITE_CURRENCY||'DZD';
export const fmt=c=>new Intl.NumberFormat(undefined,{style:'currency',currency:CUR,maximumFractionDigits:2}).format(c/100);
const Ctx=createContext();export const useCart=()=>useContext(Ctx);
const load=()=>{try{return JSON.parse(localStorage.getItem('cart')||'[]')}catch{return[]}};
export function CartProvider({children}){
  const [items,setItems]=useState(load);
  useEffect(()=>{try{localStorage.setItem('cart',JSON.stringify(items))}catch{}},[items]);
  const v=useMemo(()=>({items,
    count:items.reduce((a,i)=>a+i.qty,0),
    subtotal:items.reduce((a,i)=>a+toCents(i.price)*i.qty,0),
    add:(p,{size,color,qty=1})=>setItems(cur=>{const key=[p.id,size,color].join('|');
      const f=cur.find(i=>i.key===key);
      return f?cur.map(i=>i.key===key?{...i,qty:i.qty+qty}:i):[...cur,{key,id:p.id,name:p.name,price:p.price,img:p.mainImg,size,color,qty}]}),
    setQty:(key,q)=>setItems(c=>c.map(i=>i.key===key?{...i,qty:Math.max(1,Math.min(99,q))}:i)),
    remove:key=>setItems(c=>c.filter(i=>i.key!==key)),
    clear:()=>setItems([])}),[items]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
