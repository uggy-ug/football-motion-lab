import * as THREE from 'https://esm.sh/three@0.179.1';
import { OrbitControls } from 'https://esm.sh/three@0.179.1/examples/jsm/controls/OrbitControls.js';
import { trick } from './trick.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x07111f,8,18);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);
camera.position.set(4.8,3.1,6.6);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3.2;controls.maxDistance=11;controls.target.set(0,1.3,.35);
controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
scene.add(new THREE.HemisphereLight(0xbdd8ff,0x112014,2.1));
const sun=new THREE.DirectionalLight(0xffffff,3.2);sun.position.set(4,8,5);sun.castShadow=true;scene.add(sun);
const ground=new THREE.Mesh(new THREE.CircleGeometry(7,64),new THREE.MeshStandardMaterial({color:0x173c32,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(12,24,0x315c55,0x24453f);grid.position.y=.003;scene.add(grid);

const bodyMat=new THREE.MeshStandardMaterial({color:0xaac8ee,roughness:.58});
const activeMat=new THREE.MeshStandardMaterial({color:0xffc85a,roughness:.48});
const jointMat=new THREE.MeshStandardMaterial({color:0xf4f7fb,roughness:.4});
const ballMat=new THREE.MeshStandardMaterial({color:0xe9f4ff,roughness:.45});
const player=new THREE.Group();scene.add(player);
const yAxis=new THREE.Vector3(0,1,0);

function makeJoint(radius=.09){const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,18,12),jointMat);mesh.castShadow=true;player.add(mesh);return mesh}
function makeSegment(radius=.07,material=bodyMat){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,1,14),material);mesh.castShadow=true;player.add(mesh);return mesh}
function setSegment(mesh,a,b){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const delta=end.clone().sub(start);mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.scale.set(1,delta.length(),1);mesh.quaternion.setFromUnitVectors(yAxis,delta.normalize())}
function setJoint(mesh,p){mesh.position.set(...p)}
function makeFoot(material=bodyMat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.19,.12,.40),material);mesh.castShadow=true;player.add(mesh);return mesh}
function setFoot(mesh,ankle,toe){const a=new THREE.Vector3(...ankle),t=new THREE.Vector3(...toe);mesh.position.copy(a).lerp(t,.55);mesh.position.y=.10;mesh.lookAt(t);mesh.rotateY(Math.PI);}

const joints={pelvis:makeJoint(.16),chest:makeJoint(.16),head:makeJoint(.24),leftShoulder:makeJoint(.085),rightShoulder:makeJoint(.085),leftElbow:makeJoint(.075),rightElbow:makeJoint(.075),leftHand:makeJoint(.07),rightHand:makeJoint(.07),leftHip:makeJoint(.10),rightHip:makeJoint(.10),leftKnee:makeJoint(.105),rightKnee:makeJoint(.105),leftAnkle:makeJoint(.085),rightAnkle:makeJoint(.085)};
const segments={spine:makeSegment(.20),shoulders:makeSegment(.07),leftUpperArm:makeSegment(.06),leftForearm:makeSegment(.055),rightUpperArm:makeSegment(.06),rightForearm:makeSegment(.055),leftThigh:makeSegment(.09),leftShin:makeSegment(.075),rightThigh:makeSegment(.09),rightShin:makeSegment(.075)};
const leftFoot=makeFoot(),rightFoot=makeFoot();
const ball=new THREE.Mesh(new THREE.SphereGeometry(.22,28,20),ballMat);ball.castShadow=true;scene.add(ball);
const arrow=new THREE.ArrowHelper(new THREE.Vector3(-1,0,1).normalize(),new THREE.Vector3(),.7,0x66e1ff,.2,.1);scene.add(arrow);

let time=0,playing=false,speed=1,last=performance.now();
const timeline=document.querySelector('#timeline'),play=document.querySelector('#play');
const phaseTitle=document.querySelector('#phase-title'),phaseCopy=document.querySelector('#phase-copy');
const leftWeight=document.querySelector('#left-weight'),rightWeight=document.querySelector('#right-weight');
const timeEl=document.querySelector('#time'),phaseRoot=document.querySelector('#phases');
timeline.max=trick.duration;
trick.phases.forEach((p,i)=>phaseRoot.insertAdjacentHTML('beforeend',`<article class="phase-card" data-phase="${i}"><small>${p.from.toFixed(2)}–${p.to.toFixed(2)}s</small><h3>${p.title}</h3></article>`));
function currentPhase(t){return trick.phases.findIndex(p=>t>=p.from&&t<=p.to)}
function setActiveLeg(active){segments.leftThigh.material=segments.leftShin.material=leftFoot.material=active==='left'?activeMat:bodyMat;segments.rightThigh.material=segments.rightShin.material=rightFoot.material=active==='right'?activeMat:bodyMat}
function apply(t){
  const s=trick.sample(t),j=s.joints;
  Object.keys(joints).forEach(k=>setJoint(joints[k],j[k]));
  setSegment(segments.spine,j.pelvis,j.chest);setSegment(segments.shoulders,j.leftShoulder,j.rightShoulder);
  setSegment(segments.leftUpperArm,j.leftShoulder,j.leftElbow);setSegment(segments.leftForearm,j.leftElbow,j.leftHand);
  setSegment(segments.rightUpperArm,j.rightShoulder,j.rightElbow);setSegment(segments.rightForearm,j.rightElbow,j.rightHand);
  setSegment(segments.leftThigh,j.leftHip,j.leftKnee);setSegment(segments.leftShin,j.leftKnee,j.leftAnkle);
  setSegment(segments.rightThigh,j.rightHip,j.rightKnee);setSegment(segments.rightShin,j.rightKnee,j.rightAnkle);
  setFoot(leftFoot,j.leftAnkle,j.leftToe);setFoot(rightFoot,j.rightAnkle,j.rightToe);setActiveLeg(s.active);
  ball.position.set(...s.ball);ball.rotation.x=t*4.2;ball.rotation.z=t*2.4;
  arrow.position.copy(ball.position);arrow.position.y=.38;arrow.setDirection(new THREE.Vector3(-1,0,1).normalize());arrow.setLength(t>1.02?.55+Math.max(0,t-1.02):.18,.18,.09);
  const lw=Math.round(s.weights.left);leftWeight.textContent=`${lw}%`;rightWeight.textContent=`${100-lw}%`;
  const idx=Math.max(0,currentPhase(t));phaseTitle.textContent=trick.phases[idx].title;phaseCopy.textContent=trick.phases[idx].copy;
  document.querySelectorAll('.phase-card').forEach((el,i)=>el.classList.toggle('active-card',i===idx));timeline.value=t;timeEl.textContent=`${t.toFixed(2)}s`;
}
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);resize();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(playing){time+=dt*speed;if(time>trick.duration)time=0}apply(time);controls.update();renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);
play.addEventListener('click',()=>{playing=!playing;play.textContent=playing?'Pause':'Play'});
document.querySelector('#restart').addEventListener('click',()=>{time=0;playing=false;play.textContent='Play'});
document.querySelector('#speed').addEventListener('change',e=>speed=Number(e.target.value));
timeline.addEventListener('input',e=>{time=Number(e.target.value);playing=false;play.textContent='Play'});
const views={front:[0,2.7,7],side:[7,2.7,.35],rear:[0,2.7,-6.5],top:[0,8,.35]};
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{camera.position.set(...views[b.dataset.view]);controls.target.set(-.05,1.3,.45);controls.update()}));
