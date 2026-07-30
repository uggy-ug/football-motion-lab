const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>v*v*(3-2*v);
const mix=(a,b,t)=>a+(b-a)*t;

export const oneFootJuggling={
  id:'one-foot-juggling',
  title:'One-Foot Keep-Ups',
  duration:3.2,
  loop:true,
  phases:[
    {id:'ready',from:0,to:0.4,title:'Ready position',copy:'Balance over the left leg, keep the right ankle relaxed and watch the centre of the ball.'},
    {id:'first-touch',from:0.4,to:1.05,title:'First touch',copy:'Lift through the ankle and contact the underside of the ball with the laces.'},
    {id:'recover',from:1.05,to:1.6,title:'Recover',copy:'Let the foot return under the falling ball without swinging the whole leg.'},
    {id:'second-touch',from:1.6,to:2.25,title:'Second touch',copy:'Repeat a compact upward touch and keep the ball close to hip height.'},
    {id:'control',from:2.25,to:3.2,title:'Continuous rhythm',copy:'Maintain a steady rhythm: soft ankle, quiet upper body, small corrective movements.'}
  ],
  sample(t){
    const cycle=(t/1.6)%1;
    const contactWave=Math.max(0,1-Math.abs(cycle-.23)/.08);
    const rise=cycle<.23?smooth(cycle/.23):1-smooth(clamp((cycle-.23)/.77));
    const ballY=.42+1.05*rise;
    const footLift=.08+.18*Math.max(0,1-Math.abs(cycle-.19)/.18);
    const ankleKick=.12*Math.max(0,1-Math.abs(cycle-.22)/.1);
    const sway=Math.sin(t*Math.PI*1.25);

    const pelvis=[-.13+.025*sway,1.54+.015*Math.sin(t*Math.PI*2.5),.02];
    const chest=[-.1+.02*sway,2.1,.03];
    const head=[-.08+.015*sway,2.74,.02];

    const leftHip=[pelvis[0]-.19,pelvis[1]-.02,0];
    const rightHip=[pelvis[0]+.19,pelvis[1]-.02,0];

    const leftAnkle=[-.22,.14,.02];
    const leftKnee=[mix(leftHip[0],leftAnkle[0],.52)-.05,.86,.12];
    const leftToe=[leftAnkle[0],.06,.37];

    const rightAnkle=[.2+.025*sway,.2+footLift,.15+.02*Math.sin(t*Math.PI*2.5)];
    const rightKnee=[.22,.92+.06*footLift,.18];
    const rightToe=[rightAnkle[0],rightAnkle[1]-.07,rightAnkle[2]+.33+ankleKick];

    const armSwing=.07*sway;
    const leftShoulder=[chest[0]-.38,2.24,-.03];
    const rightShoulder=[chest[0]+.38,2.24,.04];
    const leftElbow=[leftShoulder[0]-.15,1.88,.08+armSwing];
    const rightElbow=[rightShoulder[0]+.15,1.9,-.08-armSwing];
    const leftHand=[leftElbow[0]-.02,1.56,.1+armSwing];
    const rightHand=[rightElbow[0]+.02,1.58,-.1-armSwing];

    const ball=[.2+.025*Math.sin(t*Math.PI*1.25),ballY,.48];
    const com=[pelvis[0]-.08,1.88,pelvis[2]+.01];
    const leftWeight=82-8*contactWave;

    return {
      pelvis,chest,head,
      leftHip,leftKnee,leftAnkle,leftToe,
      rightHip,rightKnee,rightAnkle,rightToe,
      leftShoulder,leftElbow,leftHand,
      rightShoulder,rightElbow,rightHand,
      ball,com,contact:contactWave,
      activeLeg:'right',
      weights:{left:leftWeight,right:100-leftWeight},
      root:[0,0,0]
    };
  }
};
