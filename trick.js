export const trick = {
  id: 'single-step-over', title: 'Single Step Over', duration: 1.6,
  phases: [
    { id:'approach', from:0, to:0.35, title:'Approach', copy:'Approach the ball under control and prepare the supporting leg.' },
    { id:'deception', from:0.35, to:0.9, title:'Deception', copy:'Move the right foot around the ball while shoulders and hips suggest a change of direction.' },
    { id:'touch', from:0.9, to:1.1, title:'Outside touch', copy:'Use the outside of the left foot to move the ball away from the defender.' },
    { id:'exit', from:1.1, to:1.6, title:'Acceleration', copy:'Shift the centre of mass and accelerate after the ball.' }
  ],
  sample(t) {
    const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)); const smooth=v=>v*v*(3-2*v);
    const approach=smooth(clamp(t/0.35)); const deception=smooth(clamp((t-0.35)/0.55)); const touch=smooth(clamp((t-0.9)/0.2)); const exit=smooth(clamp((t-1.1)/0.5)); const circle=Math.sin(deception*Math.PI);
    return {root:[exit*0.7,0,approach*0.25+exit*0.65],torso:{leanX:-0.08*circle,leanZ:0.14*circle-0.08*exit,yaw:0.28*circle-0.18*exit},leftLeg:{hip:-0.12+0.24*touch,knee:0.16+0.34*touch,ankle:-0.12*touch},rightLeg:{hip:0.1-0.65*circle,knee:0.12+1.05*circle,ankle:0.3*circle},rightFootOrbit:{x:0.46*Math.sin(deception*Math.PI*1.15),z:0.36*(1-Math.cos(deception*Math.PI*1.15)),y:0.11*circle},ball:[0.05+touch*0.33+exit*0.72,0.22,0.05+touch*0.2+exit*0.48],weights:{left:Math.round(55+33*circle-15*exit),right:0}};
  }
};
