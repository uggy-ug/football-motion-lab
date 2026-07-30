const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a,b,t)=>a+(b-a)*t;

export const trick={
  id:'single-step-over',title:'Single Step Over',duration:1.8,
  phases:[
    {id:'approach',from:0,to:.42,title:'Approach',copy:'Arrive balanced, shorten the final step and keep the ball close.'},
    {id:'deception',from:.42,to:1.02,title:'Step over',copy:'Shift onto the left leg while the right foot circles around the front of the ball.'},
    {id:'touch',from:1.02,to:1.28,title:'Outside touch',copy:'Use the outside of the left foot to push the ball diagonally away.'},
    {id:'exit',from:1.28,to:1.8,title:'Acceleration',copy:'Drive the body after the ball and recover into the first running step.'}
  ],
  sample(t){
    const approach=smooth(t/.42);
    const step=smooth((t-.42)/.60);
    const touch=smooth((t-1.02)/.26);
    const exit=smooth((t-1.28)/.52);
    const lift=Math.sin(step*Math.PI);
    const bodyX=.10*step-.18*touch-.22*exit;
    const bodyZ=.12*approach+.10*step+.28*touch+.72*exit;
    const dip=.08*Math.sin(step*Math.PI)+.05*Math.sin(touch*Math.PI);
    const pelvis=[bodyX,1.48-dip,bodyZ];
    const chest=[bodyX+.07*step-.05*exit,2.10-dip,bodyZ+.03];
    const head=[chest[0],2.72-dip,chest[2]+.015];
    const shoulderY=2.34-dip;
    const shoulderTurn=.10*step-.14*exit;
    const leftShoulder=[bodyX-.34,shoulderY,bodyZ+shoulderTurn];
    const rightShoulder=[bodyX+.34,shoulderY,bodyZ-shoulderTurn];
    const leftElbow=[bodyX-.48,1.98-dip,bodyZ-.10*step];
    const rightElbow=[bodyX+.46,1.98-dip,bodyZ+.16*step];
    const leftHand=[bodyX-.40,1.64-dip,bodyZ-.15*step];
    const rightHand=[bodyX+.36,1.64-dip,bodyZ+.24*step];

    const leftHip=[pelvis[0]-.18,pelvis[1]-.03,pelvis[2]];
    const rightHip=[pelvis[0]+.18,pelvis[1]-.03,pelvis[2]];

    const leftAnkle=[-.22-.12*touch-.28*exit,.12,.03+.14*touch+.60*exit];
    const leftToe=[leftAnkle[0]-.03,.08,leftAnkle[2]+.34];
    const leftKnee=[mix(leftHip[0],leftAnkle[0],.52)-.05, .80-.05*step+.08*touch, mix(leftHip[2],leftAnkle[2],.48)+.08];

    const arc=Math.sin(step*Math.PI);
    const rightAnkle=[
      .22+.48*arc-.10*step+.12*exit,
      .12+.25*lift,
      .02+.52*step-.10*arc+.44*exit
    ];
    const rightToe=[rightAnkle[0]-.04*step,.08+(.18*lift),rightAnkle[2]+.34];
    const rightKnee=[mix(rightHip[0],rightAnkle[0],.53)+.10*arc,.82+.12*lift,mix(rightHip[2],rightAnkle[2],.48)-.02];

    const ball=[-.04-.42*touch-.70*exit,.22,.28+.28*touch+.70*exit];
    const leftWeight=Math.round(55+35*lift-22*touch-18*exit);

    return {joints:{pelvis,chest,head,leftShoulder,rightShoulder,leftElbow,rightElbow,leftHand,rightHand,leftHip,rightHip,leftKnee,rightKnee,leftAnkle,rightAnkle,leftToe,rightToe},ball,weights:{left:clamp(leftWeight,8,92)},active:touch>.15?'left':'right'};
  }
};
