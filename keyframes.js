export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

const curves={
  linear:t=>t,
  smooth:t=>t*t*(3-2*t),
  smoother:t=>t*t*t*(t*(t*6-15)+10),
  easeIn:t=>t*t,
  easeOut:t=>1-(1-t)*(1-t),
  snap:t=>1-Math.pow(1-t,4)
};

const lerp=(a,b,t)=>a+(b-a)*t;

export function sampleTrack(frames,time,defaultValue=0){
  if(!frames?.length)return defaultValue;
  if(time<=frames[0].time)return frames[0].value;
  const last=frames[frames.length-1];
  if(time>=last.time)return last.value;
  for(let i=0;i<frames.length-1;i++){
    const a=frames[i],b=frames[i+1];
    if(time<a.time||time>b.time)continue;
    const span=Math.max(.0001,b.time-a.time);
    const raw=clamp((time-a.time)/span);
    const curve=curves[b.curve||a.curve||'smoother']||curves.smoother;
    return lerp(a.value,b.value,curve(raw));
  }
  return last.value;
}

export function createMotionSampler(tracks){
  return time=>Object.fromEntries(Object.entries(tracks).map(([name,frames])=>[name,sampleTrack(frames,time)]));
}

export const pulse=(time,centre,width)=>clamp(1-Math.abs(time-centre)/width);
