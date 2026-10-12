import {NextRequest,NextResponse} from "next/server";
import {currentUser,service} from "@/lib/abroad-order";
import {cashfree} from "@/lib/cashfree-abroad";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try {
 const user=await currentUser(request);if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
 const {orderId}=await request.json();if(!/^GBA-[A-Z0-9]{20}$/.test(String(orderId||"")))return NextResponse.json({error:"Invalid order"},{status:400});
 const db=service();const {data:order,error}=await db.from("abroad_orders").select("id,user_id,total_usd,payment_status").eq("id",orderId).eq("user_id",user.id).single();if(error||!order)return NextResponse.json({error:"Order not found"},{status:404});
 const cf=await cashfree(`/orders/${encodeURIComponent(orderId)}`);
 const paid=cf.order_status==="PAID" && cf.order_currency==="USD" && Math.abs(Number(cf.order_amount)-Number(order.total_usd))<0.001;
 if(paid && order.payment_status!=="PAID"){
  const {error:statusError}=await db.from("abroad_orders").update({payment_status:"PAID",paid_at:new Date().toISOString()}).eq("id",orderId).eq("user_id",user.id).eq("payment_status","PENDING");if(statusError)throw statusError;
 }
 return NextResponse.json({paid:paid||order.payment_status==="PAID",status:paid?"PAID":cf.order_status});
 }catch(error){console.error("Abroad verification failed",error);return NextResponse.json({error:"Unable to verify payment"},{status:500});}
}
