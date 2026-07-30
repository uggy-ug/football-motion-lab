import * as THREE from 'https://esm.sh/three@0.179.1';
import { OrbitControls } from 'https://esm.sh/three@0.179.1/examples/jsm/controls/OrbitControls.js';
import { tricks } from './tricks.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x07111f,8,18);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(4.8,3.15,6.8);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3.2;controls.maxDistance=12;controls.target.set(.25,1.25,.3);controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
scene.add(new THREE.HemisphereLight(0xbdd8ff,0x112014,2.1));
const sun=new THREE.DirectionalLight(0xffffff,3.4);sun.position.set(4,8,5);sun.castShadow=true;scene.add(sun);
const ground=new THREE.Mesh(new THREE.CircleGeometry(7,64),new THREE.MeshStandardMaterial({color:0x173c32,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(12,24,0x315c55,0x24453f);grid.position.y=.003;scene.add(grid);

const bodyMat=new THREE.MeshStandardMaterial({color:0xaac8ee,roughness:.58,metalness:.05});
const activeMat=new THREE.MeshStandardMaterial({color:0xffc85a,roughness:.48});
const jointMat=new THREE.MeshStandardMaterial({color:0xf4f7fb,roughness:.4});
const cyanMat=new THREE.MeshBasicMaterial({color:0x66e1ff});
const player=new THREE.Group();scene.add(player);
function sphere(r=.1,mat=jointMat){const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,12),mat);m.castShadow=true;player.add(m);return m}
function segment(r=.065,mat=bodyMat){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,12),mat);m.castShadow=true;player.add(m);return m}
function setSegment(mesh,a,b){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),mid=av.clone().add(bv).multiplyScalar(.5);mesh.position.copy(mid);mesh.scale.set(1,av.distanceTo(bv),1);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.clone().sub(av).normalize())}
function setPoint(mesh,p){mesh.position.set(...p)}
const joints={pelvis:sphere(.17),chest:sphere(.15),head:sphere(.23),leftHip:sphere(.1),leftKnee:sphere(.105),leftAnkle:sphere(.09),rightHip:sphere(.1),rightKnee:sphere(.105),rightAnkle:sphere(.09),leftShoulder:sphere(.09),leftElbow:sphere(.08),leftHand:sphere(.075),rightShoulder:sphere(.09),rightElbow:sphere(.08),rightHand:sphere(.075)};
const bones={spine:segment(.12),neck:segment(.08),shoulders:segment(.07),hips:segment(.08),leftThigh:segment(.085),leftShin:segment(.072),rightThigh:segment(.085),rightShin:segment(.072),leftUpperArm:segment(.06),leftForearm:segment(.052),rightUpperArm:segment(.06),rightForearm:segment(.052)};
const leftFoot=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.42),bodyMat);leftFoot.castShadow=true;player.add(leftFoot);
const rightFoot=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.42),bodyMat);rightFoot.castShadow=true;player.add(rightFoot);
function setFoot(mesh,ankle,toe){const a=new THREE.Vector3(...ankle),b=new THREE.Vector3(...toe),mid=a.clone().lerp(b,.52);mesh.position.copy(mid);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.clone().sub(a).normalize())}
const ball=new THREE.Mesh(new THREE.SphereGeometry(.22,28,20),new THREE.MeshStandardMaterial({color:0xe9f4ff,roughness:.45}));ball.castShadow=true;scene.add(ball);
const ballArrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,.65).normalize(),new THREE.Vector3(),1.0,0x66e1ff,.22,.11);scene.add(ballArrow);
const com=sphere(.095,cyanMat);com.renderOrder=5;
const comLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:0x66e1ff,dashSize:.08,gapSize:.06,transparent:true,opacity:.75}));scene.add(comLine);
const contactRing=new THREE.Mesh(new THREE.RingGeometry(.24,.31,40),new THREE.MeshBasicMaterial({color:0xffc85a,transparent:true,opacity:0,side:THREE.DoubleSide}));contactRing.rotation.x=-Math.PI/2;scene.add(contactRing);
const pathGroup=new THREE.Group();scene.add(pathGroup);
function makePath(color,points){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const line=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.55}));pathGroup.add(line)}

let trick=tricks[0],time=0,playing=false,speed=1,last=performance.now();
const timeline=document.querySelector('#timeline'),play=document.querySelector('#play'),phaseTitle=document.querySelector('#phase-title'),phaseCopy=document.querySelector('#phase-copy'),leftWeight=document.querySelector('#left-weight'),rightWeight=document.querySelector('#right-weight'),timeEl=document.querySelector('#time'),durationEl=document.querySelector('#duration'),phaseRoot=document.querySelector('#phases'),titleEl=document.querySelector('#trick-title'),trickSelect=document.querySelector('#trick-select');
tricks.forEach((item,i)=>trickSelect.insertAdjacentHTML('beforeend',`<option value="${i}">${item.title}</option>`));
function loadTrick(next){trick=next;time=0;playing=false;play.textContent='Play';titleEl.textContent=trick.title;timeline.max=String(trick.duration);timeline.value='0';durationEl.textContent=`${trick.duration.toFixed(2)}s`;phaseRoot.innerHTML='';trick.phases.forEach((p,i)=>phaseRoot.insertAdjacentHTML('beforeend',`<article class="phase-card" data-phase="${i}"><small>${p.from.toFixed(2)}–${p.to.toFixed(2)}s</small><h3>${p.title}</h3></article>`));pathGroup.clear();const samples=Array.from({length:90},(_,i)=>trick.sample(trick.duration*i/89));makePath(0xffc85a,samples.map(s=>s.rightAnkle));makePath(0x66e1ff,samples.map(s=>s.ball));makePath(0x9ae6b4,samples.map(s=>s.com));apply(0)}
function currentPhase(t){return trick.phases.findIndex(p=>t>=p.from&&t<=p.to)}
function apply(t){const s=trick.sample(t);Object.entries(joints).forEach(([k,m])=>setPoint(m,s[k]));setSegment(bones.spine,s.pelvis,s.chest);setSegment(bones.neck,s.chest,s.head);setSegment(bones.shoulders,s.leftShoulder,s.rightShoulder);setSegment(bones.hips,s.leftHip,s.rightHip);setSegment(bones.leftThigh,s.leftHip,s.leftKnee);setSegment(bones.leftShin,s.leftKnee,s.leftAnkle);setSegment(bones.rightThigh,s.rightHip,s.rightKnee);setSegment(bones.rightShin,s.rightKnee,s.rightAnkle);setSegment(bones.leftUpperArm,s.leftShoulder,s.leftElbow);setSegment(bones.leftForearm,s.leftElbow,s.leftHand);setSegment(bones.rightUpperArm,s.rightShoulder,s.rightElbow);setSegment(bones.rightForearm,s.rightElbow,s.rightHand);setFoot(leftFoot,s.leftAnkle,s.leftToe);setFoot(rightFoot,s.rightAnkle,s.rightToe);const rightActive=s.activeLeg==='right';[bones.rightThigh,bones.rightShin,rightFoot].forEach(m=>m.material=rightActive?activeMat:bodyMat);[bones.leftThigh,bones.leftShin,leftFoot].forEach(m=>m.material=rightActive?bodyMat:activeMat);ball.position.set(...s.ball);ball.rotation.x=t*4.6;ball.rotation.z=t*2.1;ballArrow.position.copy(ball.position);ballArrow.position.y=s.ball[1]+.12;ballArrow.setDirection(new THREE.Vector3(0,1,.05).normalize());ballArrow.setLength(trick.id==='one-foot-juggling'?.55:.35+Math.max(0,t-1.56)*1.15,.2,.1);com.position.set(...s.com);const floor=[s.com[0],.02,s.com[2]];comLine.geometry.setFromPoints([new THREE.Vector3(...s.com),new THREE.Vector3(...floor)]);comLine.computeLineDistances();contactRing.position.set(s.ball[0],.015,s.ball[2]);contactRing.material.opacity=.75*s.contact;contactRing.scale.setScalar(.7+.5*s.contact);const lw=Math.round(s.weights.left);leftWeight.textContent=`${lw}%`;rightWeight.textContent=`${100-lw}%`;const idx=Math.max(0,currentPhase(t));phaseTitle.textContent=trick.phases[idx].title;phaseCopy.textContent=trick.phases[idx].copy;document.querySelectorAll('.phase-card').forEach((el,i)=>el.classList.toggle('active-card',i===idx));timeline.value=String(t);timeEl.textContent=`${t.toFixed(2)}s`}
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);resize();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(playing){time+=dt*speed;if(time>trick.duration)time=0}apply(time);controls.update();renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);
play.addEventListener('click',()=>{playing=!playing;play.textContent=playing?'Pause':'Play'});document.querySelector('#restart').addEventListener('click',()=>{time=0;playing=false;play.textContent='Play'});document.querySelector('#speed').addEventListener('change',e=>speed=Number(e.target.value));timeline.addEventListener('input',e=>{time=Number(e.target.value);playing=false;play.textContent='Play'});trickSelect.addEventListener('change',e=>loadTrick(tricks[Number(e.target.value)]));
const views={front:[0,2.8,7],side:[7,2.8,.3],rear:[0,2.8,-7],top:[.3,8,.31]};document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{camera.position.set(...views[b.dataset.view]);controls.target.set(.1,1.3,.3);controls.update()}));
loadTrick(trick);
