const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>v*v*(3-2*v);
const mix=(a,b,t)=>a+(b-a)*t;

export const trick={
  id:'single-step-over',
  title:'Single Step Over',
  duration:2.4,
  phases:[
    {id:'approach',from:0,to:0.48,title:'Approach',copy:'Arrive under control, lower the hips and prepare the supporting leg.'},
    {id:'load',from:0.48,to:0.92,title:'Load the support leg',copy:'Shift the centre of mass over the left foot before lifting the right leg.'},
    {id:'deception',from:0.92,to:1.56,title:'Step over',copy:'Circle the right foot around the front of the ball while the shoulders sell the fake.'},
    {id:'touch',from:1.56,to:1.88,title:'Outside touch',copy:'Use the outside of the left foot to push the ball diagonally away.'},
    {id:'exit',from:1.88,to:2.4,title:'Acceleration',copy:'Drive from the right support leg and accelerate after the ball.'}
  ],
  sample(t){
    const approach=smooth(clamp(t/0.48));
    const load=smooth(clamp((t-0.48)/0.44));
    const step=smooth(clamp((t-0.92)/0.64));
    const touch=smooth(clamp((t-1.56)/0.32));
    const exit=smooth(clamp((t-1.88)/0.52));
    const lift=Math.sin(step*Math.PI);
    const orbit=Math.sin(step*Math.PI*0.5);
    const settle=Math.sin(clamp((t-0.48)/0.88)*Math.PI);

    const rootX=mix(0,0.18,load)+0.1*step+0.78*exit;
    const rootZ=0.12*approach+0.08*load+0.1*step+0.72*exit;
    const pelvisY=1.58-0.1*load-0.08*step+0.06*exit;

    const pelvis=[rootX,pelvisY,rootZ];
    const chest=[rootX-0.04*load+0.08*step,2.12-0.08*load-0.04*step+0.05*exit,rootZ+0.03];
    const head=[chest[0]-0.02*step,2.76-0.06*load-0.02*step+0.05*exit,chest[2]+0.01];

    const leftHip=[pelvis[0]-0.19,pelvis[1]-0.02,pelvis[2]];
    const rightHip=[pelvis[0]+0.19,pelvis[1]-0.02,pelvis[2]];

    const leftAnkle=[
      -0.18+0.03*load+0.06*step+0.16*touch+0.58*exit,
      0.16+0.03*touch+0.05*exit,
      0.02+0.02*approach+0.08*touch+0.52*exit
    ];
    const leftKnee=[
      mix(leftHip[0],leftAnkle[0],0.52)-0.08*load+0.08*touch,
      0.9-0.12*load+0.06*touch,
      mix(leftHip[2],leftAnkle[2],0.52)+0.12*load+0.08*touch
    ];
    const leftToe=[leftAnkle[0]+0.02+0.08*touch,leftAnkle[1]-0.08,leftAnkle[2]+0.34+0.06*touch];

    const rightAnkle=[
      0.18+0.22*load+0.54*Math.sin(step*Math.PI)-0.08*touch+0.34*exit,
      0.16+0.08*load+0.42*lift-0.02*touch+0.05*exit,
      0.07+0.08*load-0.22*Math.sin(step*Math.PI*2)+0.08*touch+0.42*exit
    ];
    const rightKnee=[
      mix(rightHip[0],rightAnkle[0],0.5)+0.14*orbit,
      0.95-0.06*load+0.22*lift,
      mix(rightHip[2],rightAnkle[2],0.5)+0.18*orbit
    ];
    const rightToe=[rightAnkle[0]+0.02,rightAnkle[1]-0.08,rightAnkle[2]+0.34];

    const leftShoulder=[chest[0]-0.38,chest[1]+0.14,chest[2]-0.05*step];
    const rightShoulder=[chest[0]+0.38,chest[1]+0.14,chest[2]+0.05*step];
    const leftElbow=[leftShoulder[0]-0.18+0.08*step,leftShoulder[1]-0.34,leftShoulder[2]+0.12*settle];
    const rightElbow=[rightShoulder[0]+0.2-0.08*step,rightShoulder[1]-0.3,rightShoulder[2]-0.18*settle];
    const leftHand=[leftElbow[0]-0.04,leftElbow[1]-0.34,leftElbow[2]+0.06];
    const rightHand=[rightElbow[0]-0.02,rightElbow[1]-0.34,rightElbow[2]-0.04];

    const ball=[0.04+0.42*touch+0.78*exit,0.22,0.08+0.24*touch+0.56*exit];
    const contact=clamp(1-Math.abs(t-1.72)/0.12);
    const com=[pelvis[0]-0.09*load+0.08*step+0.12*exit,pelvis[1]+0.34,pelvis[2]+0.02];
    const leftWeight=Math.round(52+35*load+5*step-46*touch-28*exit);

    return {
      pelvis,chest,head,
      leftHip,leftKnee,leftAnkle,leftToe,
      rightHip,rightKnee,rightAnkle,rightToe,
      leftShoulder,leftElbow,leftHand,
      rightShoulder,rightElbow,rightHand,
      ball,com,contact,
      activeLeg:t<1.56?'right':'left',
      weights:{left:clamp(leftWeight,8,92),right:0},
      root:[0,0,0]
    };
  }
};
