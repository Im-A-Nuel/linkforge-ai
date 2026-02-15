// Chainlink Functions source for real-time market analysis.
// This code runs on the DON and fetches fresh market/sentiment data per request.
export const CHAINLINK_FUNCTIONS_SOURCE = `
const[u,r,e]=[args[0],+args[1],args[2]==="true"];
const m=await Functions.makeHttpRequest({url:"https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd&include_24hr_change=true"});
const s=await Functions.makeHttpRequest({url:"https://api.alternative.me/fng/"});
if(m.error||!m.data)throw Error("Fetch failed");
const sent=s.error?0:(+s.data.data[0].value-50)*2;
let vol=50,count=0;
for(const k of["ethereum","bitcoin"]){
  const v=m.data[k]?.usd_24h_change;
  if(v){vol+=Math.abs(v)*20;count++}
}
vol=count?Math.min(Math.round(vol/count),100):50;
const risk=Math.min(Math.round((sent<0?-sent:0)*.4+vol*.6),100);
const act=risk>70&&r===0?1:vol>80?3:risk<30&&r===2&&sent>30?2:0;
const concat=(...p)=>{let l=0;for(const x of p)l+=x.length;const o=new Uint8Array(l);let i=0;for(const x of p){o.set(x,i);i+=x.length}return o};
const enc=v=>Functions.encodeUint256(BigInt(v));
const encI=v=>Functions.encodeInt256(BigInt(Math.round(v)));
return concat(encI(sent*100),enc(vol),enc(risk),enc(75),enc(act),enc(192),enc(0));
`.trim();
