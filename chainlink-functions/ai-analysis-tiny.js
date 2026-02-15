// ULTRA-TINY version - <1KB
const[u,r]=[args[0],+args[1]];
const m=await Functions.makeHttpRequest({url:"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"});
if(m.error)throw Error("Failed");
const s=await Functions.makeHttpRequest({url:"https://api.alternative.me/fng/"});
const sent=s.error?0:(+s.data.data[0].value-50)*2;
const vol=Math.min(Math.round(Math.abs(m.data.ethereum?.usd_24h_change||0)*20),100);
const risk=Math.min(Math.round((sent<0?-sent:0)*.4+vol*.6),100);
const act=risk>70&&r===0?1:vol>80?3:risk<30&&r===2&&sent>30?2:0;
const c=(...p)=>{let l=0;for(const x of p)l+=x.length;const o=new Uint8Array(l);let i=0;for(const x of p){o.set(x,i);i+=x.length}return o};
const e=v=>Functions.encodeUint256(BigInt(v));
const i=v=>Functions.encodeInt256(BigInt(Math.round(v)));
return c(i(sent*100),e(vol),e(risk),e(75),e(act),e(192),e(0));
