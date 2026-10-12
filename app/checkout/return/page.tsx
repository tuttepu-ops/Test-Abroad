"use client";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {supabase} from "@/lib/supabase";
import Link from "next/link";
import {useBox} from "@/components/BoxProvider";
export default function ReturnPage(){const {clearBox}=useBox();const params=useSearchParams();const id=params.get("order_id");const [message,setMessage]=useState("Verifying your payment…");
 useEffect(()=>{if(!id){setMessage("Missing order reference");return;}let active=true;async function check(){try{const {data}=await supabase.auth.getSession();if(!data.session){setMessage("Please sign in again to verify your payment.");return;}const result=await fetch("/api/abroad/verify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({orderId:id})});const json=await result.json();if(active && result.ok && json.paid) clearBox();if(active)setMessage(result.ok?(json.paid?"Payment confirmed. Thank you for your order!":"Payment not yet confirmed. Please check again shortly."):(json.error||"Verification unavailable"));}catch{if(active)setMessage("Verification unavailable. Your order is saved; please retry shortly.");}}check();return()=>{active=false};},[id,clearBox]);
 return <main className="subPage checkoutPage"><section className="section shell"><h1>Order status</h1><p>{message}</p><p>Order reference: {id}</p><Link className="goldButton" href="/checkout">Back to checkout</Link></section></main>}
