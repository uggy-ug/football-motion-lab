const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>v*v*(3-2*v);
const smoother=v=>v*v*v*(v*(v*6-15)+10);
const mix=(a,b,t)=>a+(b-a)*t;
const pulse=(t,c,w)=>clamp(1-Math.abs(t-c)/w);

export const aroundTheWorld={
  id:'around-the-world',
  title:'Around the World',
  duration:3.2,
  phases:[
    {id:'settle',from:0,to:0.55,title:'Set the rhythm',copy:'Stay tall but elastic. Let the support ankle and knee absorb the ball rhythm.'},
    {id:'pop',from:0.55,to:1.02,title:'Pop the ball',copy:'Lift the ball with the laces while the hips remain centred over the support foot.'},
    {id:'circle',from:1.02,to:2.12,title:'Circle the ball',copy:'Lead with the knee, then let the ankle travel around the rising ball in one continuous loop.'},
    {id:'catch',from:2.12,to:2.62,title:'Re-centre',copy:'Bring the working foot back under the body before the ball drops.'},
    {id:'recover',from:2.62,to:3.2,title:'Recover the rhythm',copy:'Absorb the next touch and return to a balanced juggling stance.'}
  ],
  sample(t){
    const settle=smoother(clamp(t/0.55));
    const pop=smoother(clamp((t-0.55)/0.47));
    const circle=smoother(clamp((t-1.02)/1.10));
    const catchP=smoother(clamp((t-2.12)/0.50));
    const recover=smoother(clamp((t-2.62)/0.58));

    const rhythm=Math.sin((t/3.2)*Math.PI*2);
    const compression=0.075*pulse(t,.72,.28)+0.10*pulse(t,2.78,.25);
    const rootX=0.05*settle+0.10*pop+0.04*Math.sin(circle*Math.PI)-0.07*catchP;
    const rootZ=0.025*rhythm+0.06*pop-0.035*circle+0.04*recover;
    const pelvisY=1.58-compression+0.035*Math.sin(t*5.4)-0.045*Math.sin(circle*Math.PI);
    const pelvisYaw=-0.10*pop+0.23*Math.sin(circle*Math.PI)-0.10*catchP;

    const pelvis=[rootX,pelvisY,rootZ];
    const chest=[
      rootX-0.055*pop-0.10*Math.sin(circle*Math.PI)+0.05*catchP,
      2.12-compression*0.55+0.018*Math.sin(t*4.7),
      rootZ+0.055+0.025*Math.sin(circle*Math.PI*2)
    ];
    const head=[
      chest[0]+0.025*Math.sin(circle*Math.PI*2),
      chest[1]+0.62,
      chest[2]+0.02-0.045*pop-0.03*circle
    ];

    const hipSpread=.19;
    const leftHip=[pelvis[0]-hipSpread*Math.cos(pelvisYaw),pelvis[1]-.02,pelvis[2]+hipSpread*Math.sin(pelvisYaw)];
    const rightHip=[pelvis[0]+hipSpread*Math.cos(pelvisYaw),pelvis[1]-.02,pelvis[2]-hipSpread*Math.sin(pelvisYaw)];

    const leftAnkle=[-0.17+0.07*rootX,0.15+0.02*Math.sin(t*4.8),0.03+0.02*rootZ];
    const leftKnee=[
      mix(leftHip[0],leftAnkle[0],.5)-0.08-0.06*compression,
      .91-.12*compression+0.025*Math.sin(t*4.9),
      mix(leftHip[2],leftAnkle[2],.5)+.12+.035*pop
    ];
    const leftToe=[leftAnkle[0]+.015,leftAnkle[1]-.075,leftAnkle[2]+.36];

    const theta=circle*Math.PI*2;
    const orbitRadius=.36+.08*Math.sin(circle*Math.PI);
    const preLift=.16*pop;
    const circleX=.20+orbitRadius*Math.sin(theta);
    const circleZ=.09-orbitRadius*Math.cos(theta);
    const circleY=.60+.22*Math.sin(theta*.5)+.10*Math.sin(circle*Math.PI);

    const rightAnkle=[
      mix(.18,.22,pop)*(1-circle)+circleX*circle + .05*catchP,
      .16+preLift*(1-circle)+circleY*circle-.38*catchP+.05*recover,
      .07+.10*pop*(1-circle)+circleZ*circle+.03*catchP
    ];
    const rightKnee=[
      mix(rightHip[0],rightAnkle[0],.46)+.16*pop+.22*Math.sin(circle*Math.PI),
      .96+.18*pop+.31*Math.sin(circle*Math.PI)-.10*catchP,
      mix(rightHip[2],rightAnkle[2],.46)+.18*pop+.16*Math.cos(theta)*circle
    ];
    const footYaw=.35*Math.sin(theta)*circle;
    const rightToe=[rightAnkle[0]+.08*footYaw,rightAnkle[1]-.055,rightAnkle[2]+.34-.05*Math.cos(theta)*circle];

    const shoulderTwist=-pelvisYaw*.75-.12*Math.sin(circle*Math.PI);
    const leftShoulder=[chest[0]-.38*Math.cos(shoulderTwist),chest[1]+.14,chest[2]+.38*Math.sin(shoulderTwist)];
    const rightShoulder=[chest[0]+.38*Math.cos(shoulderTwist),chest[1]+.14,chest[2]-.38*Math.sin(shoulderTwist)];
    const armSwing=.20*Math.sin(circle*Math.PI)+.08*Math.sin(t*4.4);
    const leftElbow=[leftShoulder[0]-.18,leftShoulder[1]-.29,leftShoulder[2]+.16+armSwing];
    const rightElbow=[rightShoulder[0]+.18,rightShoulder[1]-.27,rightShoulder[2]-.17-armSwing];
    const leftHand=[leftElbow[0]-.05,leftElbow[1]-.33,leftElbow[2]+.07];
    const rightHand=[rightElbow[0]+.04,rightElbow[1]-.33,rightElbow[2]-.06];

    const launch=clamp((t-.69)/.18);
    const flight=clamp((t-.82)/1.62);
    const drop=clamp((t-2.44)/.36);
    const ballY=t<.82?(.22+.40*smooth(launch)):(t<2.44?(0.62+1.06*4*flight*(1-flight)):(.62-.36*smooth(drop)));
    const ball=[.04+.045*Math.sin(flight*Math.PI),ballY,.08+.025*Math.sin(flight*Math.PI*2)];
    const contact=Math.max(pulse(t,.72,.09),pulse(t,2.78,.10));
    const com=[pelvis[0]-.09-.055*pop+.08*Math.sin(circle*Math.PI),pelvis[1]+.34,pelvis[2]+.012];
    const leftWeight=clamp(68+20*pop+8*Math.sin(circle*Math.PI)-26*catchP,12,94);

    return {pelvis,chest,head,leftHip,leftKnee,leftAnkle,leftToe,rightHip,rightKnee,rightAnkle,rightToe,leftShoulder,leftElbow,leftHand,rightShoulder,rightElbow,rightHand,ball,com,contact,activeLeg:'right',weights:{left:leftWeight,right:100-leftWeight},root:[0,0,0]};
  }
};