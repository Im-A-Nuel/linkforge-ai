// Chainlink Functions source - runs on the DON (Decentralized Oracle Network).
// Pipeline: market signals -> quantitative scores -> Deepseek V3.1 decision -> ABI-encode.
// Falls back to rule-based logic when secrets.eigenaiKey is not configured.
export const CHAINLINK_FUNCTIONS_SOURCE = `
const[u,r,e]=[args[0],+args[1],args[2]==="true"];
const RL=["LOW","MEDIUM","HIGH"];
const RR=[
  "Conditions are within acceptable risk tolerance.",
  "Risk is elevated; shift part of the portfolio to stable assets.",
  "Risk is controlled and sentiment is positive; increase exposure gradually.",
  "Volatility is high; diversify to reduce concentration risk."
];
const[mk,sk]=await Promise.all([
  Functions.makeHttpRequest({url:"https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd&include_24hr_change=true"}),
  Functions.makeHttpRequest({url:"https://api.alternative.me/fng/"})
]);
if(mk.error||!mk.data)throw Error("Market fetch failed");
const fng=sk.error?50:+sk.data.data[0].value;
const sent=(fng-50)*2;
const eth=mk.data.ethereum?.usd_24h_change??0;
const btc=mk.data.bitcoin?.usd_24h_change??0;
const vol=Math.min(Math.round((Math.abs(eth)+Math.abs(btc))/2*20),100);
const risk=Math.min(Math.round((sent<0?-sent:0)*.4+vol*.6),100);
const esg=e?78:60;
let act=risk>70&&r===0?1:vol>80?3:risk<30&&r===2&&sent>30?2:0;
let rs=RR[act];
if(secrets.eigenaiKey){
  const p=\`You are an autonomous DeFi portfolio risk manager in a Chainlink CRE workflow.\\nMarket: Fear&Greed=\${fng}/100, Sentiment=\${sent}, ETH=\${eth.toFixed(2)}%, BTC=\${btc.toFixed(2)}%, Volatility=\${vol}/100, Risk=\${risk}/100\\nUser: RiskProfile=\${RL[r]||"MEDIUM"}, ESG=\${e}\\nActions: 0=HOLD 1=SHIFT_TO_STABLE 2=INCREASE_EXPOSURE 3=DIVERSIFY\\nJSON only: {"a":<0-3>,"r":"<short reason>"}\`;
  const ai=await Functions.makeHttpRequest({
    url:"https://api-web.eigenai.com/api/v1/chat/completions",
    method:"POST",
    headers:{"Authorization":\`Bearer \${secrets.eigenaiKey}\`,"Content-Type":"application/json"},
    data:{model:"deepseek-v31-terminus",messages:[{role:"user",content:p}],max_tokens:120,temperature:0.1,chat_template_kwargs:{thinking:false}}
  });
  if(!ai.error){try{
    const raw=ai.data.choices[0].message.content.trim().replace(/^\`\`\`(?:json)?\\s*/i,"").replace(/\\s*\`\`\`\\s*$/i,"");
    const q=JSON.parse(raw);
    if(q.a>=0&&q.a<=3){act=q.a|0;rs=RR[act]}
    if(typeof q.r==="string"){const t=q.r.replace(/\\s+/g," ").trim();if(t)rs=t}
  }catch(_){}}
}
const concat=(...p)=>{let l=0;for(const x of p)l+=x.length;const o=new Uint8Array(l);let i=0;for(const x of p){o.set(x,i);i+=x.length}return o};
const enc=v=>Functions.encodeUint256(BigInt(v));
const encI=v=>Functions.encodeInt256(BigInt(Math.round(v)));
const short=s=>s.replace(/[^a-zA-Z0-9 ,.;:!?-]/g," ").replace(/\\s+/g," ").trim();
const packed=(short(rs)||short(RR[act])||"Risk controls active.").slice(0,30);
const encS=s=>{let b=new TextEncoder().encode(s);if(b.length>32)b=b.slice(0,32);const o=new Uint8Array(64);o.set(enc(b.length),0);o.set(b,32);return o};
return concat(encI(sent*100),enc(vol),enc(risk),enc(esg),enc(act),enc(192),encS("r:"+packed));
`.trim();
