export const SAMPLE_TASKS = [
  {id:'cups', title:'Take cups to the kitchen', detail:'Collect the cups and put them by the sink.', points:5, zone:'table'},
  {id:'clothes', title:'Give the chair a fresh start', detail:'Put clothes in the hamper or back in their drawers.', points:10, zone:'chair'},
  {id:'toys', title:'Find a home for the toys', detail:'Gather the toys and return them to their bin.', points:10, zone:'floor'},
  {id:'table', title:'Wipe the coffee table', detail:'Clear the surface first, then give it a wipe.', points:10, zone:'table'}
];
export const DECORATIONS = [
  {id:'plant',name:'Happy little plant',description:'A leafy friend for your windowsill.',price:15,icon:'plant'},
  {id:'rug',name:'Peachy rug',description:'A warm new color for your cozy corner.',price:25,icon:'rug'},
  {id:'lamp',name:'Golden hour lamp',description:'A little glow for a job well done.',price:35,icon:'lamp'}
];
export function freshState(){return {version:1,coins:0,totalEarned:0,tasks:[],source:'sample',owned:[],completedCount:0,sessionCount:0,history:[],settings:{endpoint:'',rules:'',voice:true,automatic:false}};}
export function sanitizeState(raw){
 const s=freshState(); if(!raw || raw.version!==1)return s;
 for(const k of ['coins','totalEarned','completedCount','sessionCount'])s[k]=Math.max(0,Math.min(1000000,Number(raw[k])||0));
 s.owned=Array.isArray(raw.owned)?[...new Set(raw.owned.filter(x=>DECORATIONS.some(d=>d.id===x)))]:[];
 s.source=['sample','ai','custom'].includes(raw.source)?raw.source:'sample';
 s.tasks=Array.isArray(raw.tasks)?raw.tasks.slice(0,20).filter(t=>t && typeof t.title==='string' && typeof t.id==='string').map(t=>({id:t.id.slice(0,100),title:t.title.slice(0,140),detail:String(t.detail||'').slice(0,300),points:Math.max(1,Math.min(25,Number(t.points)||5)),done:!!t.done,zone:String(t.zone||'other')})):[];
 s.history=Array.isArray(raw.history)?raw.history.slice(0,30).filter(x=>x && typeof x.title==='string' && typeof x.date==='string'):[];
 s.settings={endpoint:typeof raw.settings?.endpoint==='string'?raw.settings.endpoint:'',rules:String(raw.settings?.rules||'').slice(0,2000),voice:raw.settings?.voice!==false,automatic:raw.settings?.automatic===true}; return s;
}
export function completeTask(state,id){const t=state.tasks.find(t=>t.id===id);if(!t||t.done)return 0;t.done=true;state.coins+=t.points;state.totalEarned+=t.points;state.completedCount++;state.history.unshift({title:t.title,points:t.points,date:new Date().toISOString()});state.history=state.history.slice(0,30);return t.points;}
export function purchase(state,id){const d=DECORATIONS.find(d=>d.id===id);if(!d||state.owned.includes(id)||state.coins<d.price)return false;state.coins-=d.price;state.owned.push(id);return true;}
// Never treat an object leaving the frame as proof it reached its destination.
// Stable, high-confidence visual changes can complete ONLY directly observable tasks.
export function observeTasks(tasks,observations,streaks,automatic,viewClear){
 const completed=[],suggestions=[]; const seen=new Set();
 if(!viewClear){streaks.clear();return {completed,suggestions};}
 for(const o of observations||[]){if(seen.has(o.id))continue;seen.add(o.id);const t=tasks.find(t=>t.id===o.id);if(!t||t.done)continue;
  const stable=o.status==='complete' && Number(o.confidence)>=0.9;
  const count=stable?(streaks.get(t.id)||0)+1:0;streaks.set(t.id,count);
  if(count>=2){if(automatic && o.directlyVisible===true)completed.push(t.id);else suggestions.push(t.id);}
 }
 for(const t of tasks)if(!seen.has(t.id))streaks.delete(t.id);
 return {completed,suggestions};
}
export function validEndpoint(value){try{const u=new URL(value);return u.protocol==='https:' && !u.username && !u.password && !u.search && !u.hash;}catch{return false;}}
