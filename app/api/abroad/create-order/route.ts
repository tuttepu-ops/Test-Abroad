import { NextRequest,NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentUser,service,validateCart } from "@/lib/abroad-order";
import { cashfree } from "@/lib/cashfree-abroad";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try {
 const user=await currentUser(request);
 if(!user) return NextResponse.json({error:"Please sign in before checkout"},{status:401});
 const body=await request.json();const address=body.address || {};
 for(const key of ["name","phone","email","country","address1","city","state","postal"]){if(!String(address[key]||"").trim())return NextResponse.json({error:`Missing ${key}`},{status:400});}
 if(String(address.email).toLowerCase() !== String(user.email||"").toLowerCase()) return NextResponse.json({error:"Use your signed-in email for checkout"},{status:400});
 const totals=await validateCart(body.lines,body.couponCode);
 const orderId=`GBA-${randomUUID().replace(/-/g,"").slice(0,20).toUpperCase()}`;
 const db=service();
 const {error:profileError}=await db.from("abroad_customers").upsert({user_id:user.id,email:user.email,full_name:String(address.name),phone:String(address.phone),updated_at:new Date().toISOString()},{onConflict:"user_id"});
 if(profileError)throw profileError;
 const {error:insertError}=await db.from("abroad_orders").insert({id:orderId,user_id:user.id,email:user.email,address,items:totals.items,country:address.country,subtotal_usd:totals.subtotal_usd,discount_usd:totals.discount_usd,coupon_code:totals.coupon_code,transport_usd:totals.transport_usd,total_usd:totals.total_usd,shipment_weight_kg:totals.shipment_weight_kg,payment_status:"PENDING",checkout_method:"CASHFREE",gift_mode:!!body.giftMode});
 if(insertError)throw insertError;
 // NOTE: USD orders require international-currency activation on your Cashfree merchant account.
 // Don't convert silently to INR or charge an invented FX rate.
 const cf=await cashfree("/orders",{method:"POST",body:JSON.stringify({order_id:orderId,order_amount:totals.total_usd,order_currency:"USD",customer_details:{customer_id:user.id,customer_name:address.name,customer_email:user.email,customer_phone:String(address.phone).replace(/[^\d]/g,"")},order_meta:{return_url:`${request.nextUrl.origin}/checkout/return?order_id=${encodeURIComponent(orderId)}`},order_note:"Godavari Basket Abroad"})});
 const {error:updateError}=await db.from("abroad_orders").update({cashfree_order_id:cf.order_id,payment_session_id:cf.payment_session_id}).eq("id",orderId);
 if(updateError)throw updateError;
 return NextResponse.json({orderId,paymentSessionId:cf.payment_session_id,mode:process.env.CASHFREE_ENV==="production"?"production":"sandbox"});
 }catch(error){console.error("Abroad payment creation failed",error);return NextResponse.json({error:error instanceof Error?error.message:"Unable to initiate payment"},{status:500});}
}
