import {NextRequest,NextResponse} from "next/server";
import {createHmac,timingSafeEqual} from "crypto";
import {cashfree} from "@/lib/cashfree-abroad";
import {service} from "@/lib/abroad-order";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try{
 const raw=await request.text(),timestamp=request.headers.get("x-webhook-timestamp")||"",signature=request.headers.get("x-webhook-signature")||"";
 const secret=process.env.CASHFREE_CLIENT_SECRET;
 if(!secret||!timestamp||!signature)return NextResponse.json({error:"Unauthorized"},{status:401});
 const expected=createHmac("sha256",secret).update(timestamp+raw).digest("base64");
 const a=Buffer.from(signature),b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:"Invalid signature"},{status:401});
 const body=JSON.parse(raw);const orderId=String(body?.data?.order?.order_id||"");
 if(!/^GBA-[A-Z0-9]{20}$/.test(orderId))return NextResponse.json({ok:true});
 const db=service();const {data:order}=await db.from("abroad_orders").select("id,total_usd,payment_status").eq("id",orderId).maybeSingle();
 if(!order||order.payment_status==="PAID")return NextResponse.json({ok:true});
 const cf=await cashfree(`/orders/${encodeURIComponent(orderId)}`);
 if(cf.order_status==="PAID"&&cf.order_currency==="USD"&&Math.abs(Number(cf.order_amount)-Number(order.total_usd))<0.001){
  const {error}=await db.from("abroad_orders").update({payment_status:"PAID",paid_at:new Date().toISOString()}).eq("id",orderId).eq("payment_status","PENDING");if(error)throw error;
 }
 return NextResponse.json({ok:true});
 }catch(error){console.error("Cashfree webhook failed",error);return NextResponse.json({error:"Webhook processing failed"},{status:500});}
}
