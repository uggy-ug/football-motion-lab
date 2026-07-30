const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>v*v*(3-2*v);
const smoother=v=>v*v*v*(v*(v*6-15)+10);
const mix=(a,b,t)=>a+(b-a)*t;
const pulse=(t,c,w)=>clamp(1-Math.abs(t-c)/w);
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=a=>Math.hypot(...a);
const norm=a=>{const l=len(a)||1;return mul(a,1/l)};

function twoBoneIK(hip,target,pole,upper=.78,lower=.78){
  const v=sub(target,hip);
  const d=clamp(len(v),Math.abs(upper-lower)+.001,upper+lower-.001);
  const dir=norm(v);
  let plane=norm(sub(pole,mul(dir,dot(pole,dir))));
  if(len(plane)<.01) plane=norm(cross(dir,[0,0,1]));
  const along=(upper*upper-lower*lower+d*d)/(2*d);
  const height=Math.sqrt(Math.max(0,upper*upper-along*along));
  return add(hip,add(mul(dir,along),mul(plane,height)));
}

function ballAt(t){
  const launch=clamp((t-.70)/.20);
  const flight=clamp((t-.88)/1.84);
  const drop=clamp((t-2.72)/.34);
  let y;
  if(t<.88) y=.22+.34*smooth(launch);
  else if(t<2.72) y=.56+.58*4*flight*(1-flight);
  else y=.56-.34*smooth(drop);
  return [.055,y,.08];
}

export const aroundTheWorld={
  id:'around-the-world',
  title:'Around the World · IK v2',
  duration:3.35,
  phases:[
    {id:'set',from:0,to:.62,title:'Set the rhythm',copy:'Plant the support foot and bring the working foot under the ball.'},
    {id:'pop',from:.62,to:1.02,title:'Pop the ball',copy:'Lift the ball vertically with the laces; keep the pelvis above the support leg.'},
    {id:'circle',from:1.02,to:2.30,title:'Circle the ball',copy:'The ankle follows a vertical ball-centred orbit: below, outside, above, inside and back below.'},
    {id:'return',from:2.30,to:2.82,title:'Return under the body',copy:'Retract the working foot beneath the hip before the ball drops.'},
    {id:'absorb',from:2.82,to:3.35,title:'Absorb and reset',copy:'Receive the ball with a soft ankle and knee and restore the juggling stance.'}
  ],
  sample(t){
    const set=smoother(clamp(t/.62));
    const pop=smoother(clamp((t-.62)/.40));
    const circle=smoother(clamp((t-1.02)/1.28));
    const ret=smoother(clamp((t-2.30)/.52));
    const absorb=smoother(clamp((t-2.82)/.53));

    const ball=ballAt(t);
    const compression=.09*pulse(t,.73,.26)+.07*pulse(t,3.02,.24);
    const pelvisX=-.09-.045*pop+.018*Math.sin(circle*Math.PI)-.012*ret;
    const pelvisZ=.025-.010*circle+.010*ret;
    const pelvisY=1.58-compression;
    const pelvisYaw=.035*pop+.065*Math.sin(circle*Math.PI)-.035*ret;
    const pelvis=[pelvisX,pelvisY,pelvisZ];

    const hs=.19;
    const leftHip=[pelvisX-hs*Math.cos(pelvisYaw),pelvisY-.02,pelvisZ+hs*Math.sin(pelvisYaw)];
    const rightHip=[pelvisX+hs*Math.cos(pelvisYaw),pelvisY-.02,pelvisZ-hs*Math.sin(pelvisYaw)];

    const leftAnkle=[-.255,.16,.035];
    const leftToe=[-.25,.085,.395];
    const leftKnee=twoBoneIK(leftHip,leftAnkle,[-.55,.05,.46],.79,.78);

    const ready=[.17,.18,.10];
    const liftTarget=[ball[0]+.03,ball[1]-.24,ball[2]+.03];
    const returnTarget=[.18,.20,.11];
    let rightAnkle;

    if(t<.62){
      rightAnkle=[mix(.20,ready[0],set),mix(.17,ready[1],set),mix(.10,ready[2],set)];
    }else if(t<1.02){
      rightAnkle=ready.map((v,i)=>mix(v,liftTarget[i],pop));
    }else if(t<2.30){
      const theta=-Math.PI/2+Math.PI*2*circle;
      const radius=.34+.025*Math.sin(Math.PI*circle);
      rightAnkle=[
        ball[0]+radius*Math.cos(theta),
        ball[1]+radius*Math.sin(theta),
        ball[2]+.055+.045*Math.sin(theta)
      ];
    }else if(t<2.82){
      const endBall=ballAt(2.30);
      const orbitEnd=[endBall[0],endBall[1]-.34,endBall[2]+.055-.045];
      rightAnkle=orbitEnd.map((v,i)=>mix(v,returnTarget[i],ret));
    }else{
      rightAnkle=returnTarget.map((v,i)=>mix(v,ready[i],absorb));
    }

    const kneePole=[.52,.16,.50];
    const rightKnee=twoBoneIK(rightHip,rightAnkle,kneePole,.79,.78);

    let footDir;
    if(t>=1.02&&t<2.30){
      const theta=-Math.PI/2+Math.PI*2*circle;
      const tangent=norm([-Math.sin(theta),Math.cos(theta),.12*Math.cos(theta)]);
      footDir=norm(add(mul(tangent,.18),[0,-.045,.34]));
    }else footDir=norm([0,-.045,.36]);
    const rightToe=add(rightAnkle,footDir);

    const chestYaw=-pelvisYaw*.5;
    const chest=[pelvisX-.015*pop+.010*ret,2.11-compression*.42,pelvisZ+.055];
    const head=[chest[0],chest[1]+.62,chest[2]-.025*pop];
    const leftShoulder=[chest[0]-.38*Math.cos(chestYaw),chest[1]+.14,chest[2]+.38*Math.sin(chestYaw)];
    const rightShoulder=[chest[0]+.38*Math.cos(chestYaw),chest[1]+.14,chest[2]-.38*Math.sin(chestYaw)];
    const arm=.075*Math.sin(circle*Math.PI);
    const leftElbow=[leftShoulder[0]-.16,leftShoulder[1]-.31,leftShoulder[2]+.13+arm];
    const rightElbow=[rightShoulder[0]+.16,rightShoulder[1]-.30,rightShoulder[2]-.13-arm];
    const leftHand=[leftElbow[0]-.04,leftElbow[1]-.34,leftElbow[2]+.05];
    const rightHand=[rightElbow[0]+.04,rightElbow[1]-.34,rightElbow[2]-.05];

    const contact=Math.max(pulse(t,.75,.075),pulse(t,3.00,.09));
    const com=[pelvisX-.075-.025*pop+.015*Math.sin(circle*Math.PI),pelvisY+.34,pelvisZ];
    const leftWeight=clamp(74+14*pop+5*Math.sin(circle*Math.PI)-16*ret,52,94);

    return {pelvis,chest,head,leftHip,leftKnee,leftAnkle,leftToe,rightHip,rightKnee,rightAnkle,rightToe,leftShoulder,leftElbow,leftHand,rightShoulder,rightElbow,rightHand,ball,com,contact,activeLeg:'right',weights:{left:leftWeight,right:100-leftWeight},root:[0,0,0]};
  }
};