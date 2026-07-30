import { clamp, createMotionSampler, pulse } from './keyframes.js';

const mix=(a,b,t)=>a+(b-a)*t;
const controls=createMotionSampler({
  crouch:[{time:0,value:.01},{time:.48,value:.09},{time:.76,value:.16,curve:'easeIn'},{time:1.02,value:.05,curve:'snap'},{time:2.3,value:.03},{time:2.76,value:.13},{time:3.2,value:.01}],
  lateral:[{time:0,value:0},{time:.55,value:-.035},{time:.92,value:-.13},{time:1.5,value:-.17},{time:2.15,value:-.11},{time:2.65,value:-.03},{time:3.2,value:0}],
  forward:[{time:0,value:0},{time:.72,value:.025},{time:1.2,value:.07},{time:2.2,value:.035},{time:3.2,value:0}],
  pelvisYaw:[{time:0,value:0},{time:.78,value:-.08},{time:1.35,value:.18},{time:1.82,value:.27},{time:2.25,value:.08},{time:3.2,value:0}],
  chestYaw:[{time:0,value:0},{time:.9,value:.06},{time:1.5,value:-.17},{time:2.0,value:-.23},{time:2.55,value:-.04},{time:3.2,value:0}],
  orbit:[{time:0,value:0},{time:1.02,value:0},{time:2.18,value:1,curve:'linear'},{time:3.2,value:1}],
  kneeLead:[{time:0,value:0},{time:.72,value:.12},{time:1.12,value:.34},{time:1.6,value:.48},{time:2.18,value:.16},{time:2.65,value:0}],
  footLift:[{time:0,value:0},{time:.7,value:.12},{time:1.05,value:.46},{time:1.55,value:.67},{time:2.18,value:.39},{time:2.62,value:.04},{time:3.2,value:0}],
  armOpen:[{time:0,value:.03},{time:.8,value:.08},{time:1.5,value:.31},{time:2.0,value:.38},{time:2.6,value:.11},{time:3.2,value:.03}],
  gazeDown:[{time:0,value:.06},{time:.75,value:.15},{time:1.65,value:.23},{time:2.55,value:.14},{time:3.2,value:.06}]
});

export const aroundTheWorld={
  id:'around-the-world',title:'Around the World',duration:3.2,
  phases:[
    {id:'settle',from:0,to:.55,title:'Set the rhythm',copy:'Load the ankle and knee before the lift. Keep the chest quiet over the support foot.'},
    {id:'pop',from:.55,to:1.02,title:'Pop the ball',copy:'The foot lifts the ball while the support leg extends and the pelvis begins to rotate.'},
    {id:'circle',from:1.02,to:2.18,title:'Circle the ball',copy:'Lead with the knee. The foot follows a wide continuous orbit while chest and pelvis counter-rotate.'},
    {id:'catch',from:2.18,to:2.65,title:'Re-centre',copy:'Retract the working leg under the hips before the ball descends.'},
    {id:'recover',from:2.65,to:3.2,title:'Recover the rhythm',copy:'Absorb the next contact through ankle, knee and hip without losing posture.'}
  ],
  sample(t){
    const c=controls(t),theta=c.orbit*Math.PI*2;
    const rebound=.012*Math.sin(t*10)*(1-clamp((t-1.02)/1.2));
    const rootX=c.lateral+.025*Math.sin(t*2.8),rootZ=c.forward+.012*Math.sin(t*4.2);
    const pelvisY=1.59-c.crouch+rebound;
    const pelvis=[rootX,pelvisY,rootZ];
    const chest=[rootX-.42*c.chestYaw,2.13-.54*c.crouch,rootZ+.055+.035*Math.sin(theta)*c.orbit];
    const head=[chest[0]+.035*Math.sin(theta)*c.orbit,chest[1]+.62,chest[2]-.18*c.gazeDown];

    const hs=.19;
    const leftHip=[pelvis[0]-hs*Math.cos(c.pelvisYaw),pelvis[1]-.02,pelvis[2]+hs*Math.sin(c.pelvisYaw)];
    const rightHip=[pelvis[0]+hs*Math.cos(c.pelvisYaw),pelvis[1]-.02,pelvis[2]-hs*Math.sin(c.pelvisYaw)];

    const leftAnkle=[-.18+.18*rootX,.15-.025*c.crouch,.025+.08*rootZ];
    const leftKnee=[mix(leftHip[0],leftAnkle[0],.5)-.08-.12*c.crouch,.92-.34*c.crouch,mix(leftHip[2],leftAnkle[2],.5)+.13+.04*c.forward];
    const leftToe=[leftAnkle[0]+.01,leftAnkle[1]-.075,leftAnkle[2]+.36];

    const radius=.33+.08*Math.sin(Math.PI*c.orbit);
    const orbitX=.13+radius*Math.sin(theta),orbitZ=.10-radius*Math.cos(theta);
    const rightAnkle=[mix(.18,orbitX,c.orbit)+.04*c.kneeLead,.16+c.footLift+.12*Math.sin(theta*.5)*c.orbit, mix(.07,orbitZ,c.orbit)];
    const rightKnee=[mix(rightHip[0],rightAnkle[0],.48)+.22*c.kneeLead,.96+.55*c.kneeLead,mix(rightHip[2],rightAnkle[2],.48)+.16*c.kneeLead+.09*Math.cos(theta)*c.orbit];
    const toePitch=.07+.11*Math.sin(theta+.6)*c.orbit;
    const rightToe=[rightAnkle[0]+.08*Math.sin(theta)*c.orbit,rightAnkle[1]-.055+toePitch,rightAnkle[2]+.34-.06*Math.cos(theta)*c.orbit];

    const sy=c.chestYaw;
    const leftShoulder=[chest[0]-.38*Math.cos(sy),chest[1]+.14,chest[2]+.38*Math.sin(sy)];
    const rightShoulder=[chest[0]+.38*Math.cos(sy),chest[1]+.14,chest[2]-.38*Math.sin(sy)];
    const leftElbow=[leftShoulder[0]-.18,leftShoulder[1]-.27,leftShoulder[2]+.15+c.armOpen];
    const rightElbow=[rightShoulder[0]+.18,rightShoulder[1]-.27,rightShoulder[2]-.15-c.armOpen];
    const leftHand=[leftElbow[0]-.04,leftElbow[1]-.33,leftElbow[2]+.08];
    const rightHand=[rightElbow[0]+.04,rightElbow[1]-.33,rightElbow[2]-.08];

    const launch=clamp((t-.68)/.18),flight=clamp((t-.84)/1.62),drop=clamp((t-2.46)/.30);
    const ballY=t<.84?.22+.43*(1-Math.pow(1-launch,3)):t<2.46?.64+1.05*4*flight*(1-flight):.64-.4*drop*drop;
    const ball=[.03+.04*Math.sin(flight*Math.PI),ballY,.08+.022*Math.sin(flight*Math.PI*2)];
    const contact=Math.max(pulse(t,.72,.085),pulse(t,2.78,.09));
    const com=[pelvis[0]-.08-.06*c.kneeLead,pelvis[1]+.34,pelvis[2]+.01];
    const leftWeight=clamp(68+24*c.kneeLead+18*c.crouch-20*clamp((t-2.18)/.48),10,95);
    return {pelvis,chest,head,leftHip,leftKnee,leftAnkle,leftToe,rightHip,rightKnee,rightAnkle,rightToe,leftShoulder,leftElbow,leftHand,rightShoulder,rightElbow,rightHand,ball,com,contact,activeLeg:'right',weights:{left:leftWeight,right:100-leftWeight},root:[0,0,0]};
  }
};
