import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/controls/OrbitControls.js';
import { trick } from './trick.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x07111f,8,18);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);
camera.position.set(5.5,3.4,7.2);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,1.25,0);
scene.add(new THREE.HemisphereLight(0xbdd8ff,0x112014,2.1));
const sun=new THREE.DirectionalLight(0xffffff,3.2);sun.position.set(4,8,5);sun.castShadow=true;scene.add(sun);
const ground=new THREE.Mesh(new THREE.CircleGeometry(7,64),new THREE.MeshStandardMaterial({color:0x173c32,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const rings=new THREE.GridHelper(12,24,0x315c55,0x24453f);rings.position.y=.003;scene.add(rings);

const player=new THREE.Group();scene.add(player);
const bodyMat=new THREE.MeshStandardMaterial({color:0xaac8ee,roughness:.58,metalness:.05});
const activeMat=new THREE.MeshStandardMaterial({color:0xffc85a,roughness:.5});
const jointMat=new THREE.MeshStandardMaterial({color:0xf4f7fb,roughness:.4});
function limb(len,r=.075,mat=bodyMat){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len-r*2,8,14),mat);m.position.y=-len/2;m.castShadow=true;g.add(m);return g}
function joint(r=.105){const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,12),jointMat);m.castShadow=true;return m}
const pelvis=joint(.18);pelvis.position.y=1.65;player.add(pelvis);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.62,8,18),bodyMat);torso.position.y=2.05;torso.castShadow=true;player.add(torso);
const head=joint(.24);head.position.y=2.73;player.add(head);
const shoulder=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.72,6,12),bodyMat);shoulder.rotation.z=Math.PI/2;shoulder.position.y=2.35;player.add(shoulder);
function makeLeg(x,active=false){const hip=new THREE.Group();hip.position.set(x,1.58,0);player.add(hip);const thigh=limb(.68,.09,active?activeMat:bodyMat);hip.add(thigh);const knee=joint(.11);knee.position.y=-.68;hip.add(knee);const shin=limb(.66,.075,active?activeMat:bodyMat);shin.position.y=-.68;hip.add(shin);const foot=new THREE.Mesh(new THREE.BoxGeometry(.17,.12,.43),active?activeMat:bodyMat);foot.position.set(0,-1.35,.13);foot.castShadow=true;hip.add(foot);return {hip,shin,foot}}
const left=makeLeg(-.18,false),right=makeLeg(.18,true);
const ball=new THREE.Mesh(new THREE.SphereGeometry(.22,28,20),new THREE.MeshStandardMaterial({color:0xe9f4ff,roughness:.45}));ball.castShadow=true;scene.add(ball);
const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,.6).normalize(),new THREE.Vector3(),1.1,0x66e1ff,.25,.13);scene.add(arrow);

let time=0,playing=false,speed=1,last=performance.now();
const timeline=document.querySelector('#timeline'),play=document.querySelector('#play');
const phaseTitle=document.querySelector('#phase-title'),phaseCopy=document.querySelector('#phase-copy');
const leftWeight=document.querySelector('#left-weight'),rightWeight=document.querySelector('#right-weight');
const timeEl=document.querySelector('#time'),phaseRoot=document.querySelector('#phases');
trick.phases.forEach((p,i)=>phaseRoot.insertAdjacentHTML('beforeend',`<article class="phase-card" data-phase="${i}"><small>${p.from.toFixed(2)}–${p.to.toFixed(2)}s</small><h3>${p.title}</h3></article>`));
function currentPhase(t){return trick.phases.findIndex(p=>t>=p.from&&t<=p.to)}
function apply(t){const s=trick.sample(t);player.position.set(...s.root);torso.rotation.set(s.torso.leanZ,s.torso.yaw,s.torso.leanX);head.rotation.y=s.torso.yaw*.6;shoulder.rotation.y=s.torso.yaw;left.hip.rotation.x=s.leftLeg.hip;left.shin.rotation.x=s.leftLeg.knee;left.foot.rotation.x=s.leftLeg.ankle;right.hip.rotation.x=s.rightLeg.hip;right.hip.position.x=.18+s.rightFootOrbit.x;right.hip.position.z=s.rightFootOrbit.z;right.hip.position.y=1.58+s.rightFootOrbit.y;right.shin.rotation.x=s.rightLeg.knee;right.foot.rotation.x=s.rightLeg.ankle;ball.position.set(...s.ball);ball.rotation.x=t*4;ball.rotation.z=t*2.2;arrow.position.copy(ball.position);arrow.position.y=.38;arrow.setLength(.4+Math.max(0,t-.85)*1.1,.22,.11);const lw=Math.min(95,Math.max(5,s.weights.left));leftWeight.textContent=`${lw}%`;rightWeight.textContent=`${100-lw}%`;const idx=Math.max(0,currentPhase(t));phaseTitle.textContent=trick.phases[idx].title;phaseCopy.textContent=trick.phases[idx].copy;document.querySelectorAll('.phase-card').forEach((el,i)=>el.classList.toggle('active-card',i===idx));timeline.value=t;timeEl.textContent=`${t.toFixed(2)}s`}
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);resize();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(playing){time+=dt*speed;if(time>trick.duration){time=0}}apply(time);controls.update();renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);
play.onclick=()=>{playing=!playing;play.textContent=playing?'Pause':'Play'};
document.querySelector('#restart').onclick=()=>{time=0;playing=false;play.textContent='Play'};
document.querySelector('#speed').onchange=e=>speed=Number(e.target.value);
timeline.oninput=e=>{time=Number(e.target.value);playing=false;play.textContent='Play'};
const views={front:[0,2.8,7],side:[7,2.8,0],rear:[0,2.8,-7],top:[0,8,.01]};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{camera.position.set(...views[b.dataset.view]);controls.target.set(.25,1.25,.2);controls.update()});
