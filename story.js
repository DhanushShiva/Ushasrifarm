/* USHASRI Farms: scroll-controlled 3D story (Three.js + GSAP ScrollTrigger).
   Everything is a pure function of scroll progress S.t, so scrolling up reverses it. */
(()=>{'use strict';
const $=s=>document.querySelector(s),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),sm=x=>(x=clamp(x))*x*(3-2*x),lerp=(a,b,x)=>a+(b-a)*x;
const hero=$('#hero'),mobile=innerWidth<760,fb=()=>hero.classList.add('static');
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!window.THREE||!window.gsap||!window.ScrollTrigger)return fb();
let R;try{R=new THREE.WebGLRenderer({canvas:$('#scene'),antialias:!mobile,powerPreference:'high-performance'});if(!R.getContext())throw 0}catch(e){return fb()}
$('#scene').addEventListener('webglcontextlost',fb);
gsap.registerPlugin(ScrollTrigger);
R.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.1;
R.shadowMap.enabled=!mobile;R.shadowMap.type=THREE.PCFSoftShadowMap;R.localClippingEnabled=true;
const scn=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,60),C=n=>new THREE.Color(n);
scn.background=C(0x0b1d15);scn.fog=new THREE.Fog(0x0b1d15,9,26);
/* image-based lighting from a tiny studio scene: gives eggs, yolk and caps believable highlights */
{const pm=new THREE.PMREMGenerator(R),es=new THREE.Scene(),sky=new THREE.Mesh(new THREE.SphereGeometry(20,16,12),new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true})),p=sky.geometry.attributes.position,cs=[];
for(let i=0;i<p.count;i++){const c=new THREE.Color().setHSL(.1,.25,.1+.4*Math.max(0,p.getY(i)/20));cs.push(c.r,c.g,c.b)}
sky.geometry.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));es.add(sky);
[[6,8,6,8,6,5],[-8,4,2,4,8,1.5],[0,3,-9,10,3,2]].forEach(([x,y,z,w,h,i])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(i,i,i*.9),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)});
scn.environment=pm.fromScene(es,.04).texture}
const hemi=new THREE.HemisphereLight(0xfff1dc,0x2a1d12,.3),key=new THREE.DirectionalLight(0xffe2b8,1.6),rim=new THREE.DirectionalLight(0x9fd6b0,.9);
key.position.set(4,7,5);rim.position.set(-5,3,-4);key.castShadow=!mobile;key.shadow.mapSize.set(1024,1024);
{const s=key.shadow.camera;s.left=s.bottom=-7;s.right=s.top=7;s.far=25;key.shadow.bias=-.0006;key.shadow.normalBias=.03}
scn.add(hemi,key,rim);
/* procedural textures (no downloads) */
let sd=11;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(rep)t.repeat.set(rep[0],rep[1]);return t}
const strawT=tex(512,512,(g,w,h)=>{g.fillStyle='#46321f';g.fillRect(0,0,w,h);const cs=['#7b5b37','#a88650','#2e2116','#8c6d44'];g.globalAlpha=.55;for(let i=0;i<2200;i++){g.strokeStyle=cs[i%4];g.lineWidth=1+rnd()*2;const x=rnd()*w,y=rnd()*h,a=rnd()*6.28,l=8+rnd()*26;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()}},[3,2]);
const capT=tex(256,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#e9e2d2');gr.addColorStop(.35,'#c8c1b0');gr.addColorStop(1,'#9d9d94');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let i=0;i<420;i++){g.fillStyle=`rgba(${rnd()<.5?'255,255,255':'60,55,45'},${.04+rnd()*.07})`;g.fillRect(rnd()*w,0,1+rnd()*2,h)}});
const fT=tex(256,256,(g,w,h)=>{g.fillStyle='#6a3d20';g.fillRect(0,0,w,h);const cs=['#8a5330','#5a3118','#a0683b','#3a2012','#c28a52'];for(let y=0;y<h+12;y+=9)for(let x=-12+(y/9%2)*10;x<w+12;x+=20){g.fillStyle=cs[(rnd()*5)|0];g.beginPath();g.ellipse(x,y,11,10,0,0,Math.PI);g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.stroke()}},[3,3]);
const wT=tex(256,128,(g,w,h)=>{g.fillStyle='#8a6232';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=-32;x<w;x+=32){const o=(y/16%2)*16;g.fillStyle=['#b88a4e','#a67a42','#c79a5e'][(rnd()*3)|0];g.fillRect(x+o,y+1,30,14);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+o,y+14,30,2)}},[4,1]);
const eT=tex(256,128,(g,w,h)=>{g.fillStyle='#d3a273';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=`rgba(${90+rnd()*60},${60+rnd()*40},40,${.05+rnd()*.12})`;g.beginPath();g.arc(rnd()*w,rnd()*h,.6+rnd()*1.6,0,6.28);g.fill()}});
const M=(o)=>new THREE.MeshStandardMaterial(o);
const floorM=M({color:0x0f261b,roughness:1,envMapIntensity:.08}),floor=new THREE.Mesh(new THREE.CircleGeometry(48,48),floorM);floor.rotation.x=-Math.PI/2;floor.position.y=-1.7;floor.receiveShadow=true;scn.add(floor);
const A=new THREE.Group(),B=new THREE.Group();scn.add(A,B);
const anchor=(p,x,y,z)=>{const o=new THREE.Object3D();o.position.set(x,y,z);p.add(o);return o};
function basket(){const g=new THREE.Group(),m=M({map:wT,roughness:.9,side:THREE.DoubleSide}),pr=[[.62,0],[.7,.05],[.84,.3],[.97,.62],[1,.7]].map(([x,y])=>new THREE.Vector2(x,y));
 const o=new THREE.Mesh(new THREE.LatheGeometry(pr,40),m),r=new THREE.Mesh(new THREE.TorusGeometry(.99,.05,8,48),m);r.rotation.x=Math.PI/2;r.position.y=.7;g.add(o,r);return g}
/* ===== Experience A: oyster mushrooms ===== */
const sg=new THREE.CylinderGeometry(1.15,1.25,1.7,48,12);
{const p=sg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.04*Math.sin(x*7+y*5)*Math.cos(z*6+y*3)+.025*Math.sin(y*19+x*11);p.setXYZ(i,x*n,y,z*n)}sg.computeVertexNormals()}
/* realistic grow bag: packed straw core + clear wrinkled polythene skin, cuffed open top, side slits with pins */
const bagT=tex(512,512,(g,w,h)=>{g.fillStyle='#8f6f3e';g.fillRect(0,0,w,h);const cs=['#c9a762','#b08c4c','#6e5128','#dcc07a','#4a3519'];
 for(let i=0;i<3400;i++){g.globalAlpha=.5+rnd()*.4;g.strokeStyle=cs[i%5];g.lineWidth=.8+rnd()*2.2;const x=rnd()*w,y=rnd()*h,a=(rnd()<.8?(rnd()-.5)*.7:rnd()*6.28),l=14+rnd()*40;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*l*.5,y+Math.sin(a)*l*.5+(rnd()-.5)*6,x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()}
 g.globalAlpha=1;for(let i=0;i<260;i++){g.fillStyle=`rgba(20,12,4,${.15+rnd()*.25})`;g.fillRect(rnd()*w,rnd()*h,2+rnd()*5,1)}},[3,1.6]);
const subM=M({map:bagT,roughness:1}),sub=new THREE.Group();sub.add(new THREE.Mesh(sg,subM));sub.position.y=-.85;A.add(sub);
const bagD=(a,y)=>.022*Math.sin(a*11+y*1.3)+.015*Math.sin(a*19-y*3.1+2)+.012*Math.sin(y*13+a*2)+.008*Math.sin(a*37+y*5),
 bagR=(a,y)=>{const r=1.2-y/1.7*.1+.065+bagD(a,y);return r*(1-.09*Math.pow(clamp((-y-.7)/.17),2))};
const gG=new THREE.CylinderGeometry(1,1,1.76,112,48,true),gp=gG.attributes.position;
for(let i=0;i<gp.count;i++){const y=gp.getY(i),a=Math.atan2(gp.getZ(i),gp.getX(i)),r=bagR(a,y);gp.setXYZ(i,Math.cos(a)*r,y+.005,Math.sin(a)*r)}gG.computeVertexNormals();
const glassM=new THREE.MeshPhysicalMaterial({color:0xeaf3f0,transparent:true,opacity:.3,roughness:.1,metalness:0,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:2.2,side:THREE.DoubleSide,depthWrite:false}),
 bagGlass=new THREE.Mesh(gG,glassM);bagGlass.renderOrder=2;sub.add(bagGlass);
const bot=new THREE.Mesh(new THREE.CircleGeometry(1.08,48),glassM);bot.rotation.x=Math.PI/2;bot.position.y=-.87;bot.renderOrder=2;sub.add(bot);
const cG=new THREE.TorusGeometry(1.22,.055,12,112),cp2=cG.attributes.position;
for(let i=0;i<cp2.count;i++){const x=cp2.getX(i),y=cp2.getY(i),a=Math.atan2(y,x),k=1+.02*Math.sin(a*9)+.012*Math.sin(a*23);cp2.setXYZ(i,x*k,y*k,cp2.getZ(i)*(1+.5*Math.sin(a*6+1)))}cG.computeVertexNormals();
const collar=new THREE.Mesh(cG,glassM.clone());collar.material.opacity=.5;collar.rotation.x=Math.PI/2;collar.position.y=.87;collar.renderOrder=2;sub.add(collar);
const slitM=M({color:0x140d06,roughness:1}),pinM=M({color:0xf1e9d8,roughness:.8}),pins=[],bagFx=[bagGlass,bot,collar];
[[.35,-.5,.2],[1.35,.12,-.15],[2.3,-.25,.3],[3.3,.3,-.2],[4.25,-.55,.15],[5.25,-.05,.25],[5.9,-.62,-.3]].forEach(([a,y,t])=>{
 const r=bagR(a,y)+.006,px=Math.cos(a)*r,pz=Math.sin(a)*r,o=new THREE.Vector3(px*2,y,pz*2),sl=new THREE.Mesh(new THREE.CircleGeometry(1,20),slitM);
 sl.scale.set(.21,.034,1);sl.position.set(px,y,pz);sl.lookAt(o);sl.rotateZ(t);sub.add(sl);bagFx.push(sl);
 const pg=new THREE.Group();pg.position.set(px,y,pz);pg.lookAt(o);pg.rotateZ(t);
 [[-.07,0,.045],[.0,.012,.06],[.07,-.004,.04]].forEach(([dx,dy,L],j)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),pinM);s.scale.set(.02,.02,L);s.position.set(dx,dy,L*.8);const c=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),pinM);c.scale.set(.05+j*.006,.05+j*.006,.026);c.position.set(dx,dy,L*1.6);pg.add(s,c)});
 sub.add(pg);pins.push(pg)});
/* mycelium: random-walk hyphae drawn over the substrate; drawRange spreads them outward */
const surf=(a,y)=>{const r0=1.15+(-y)/1.7*.1,x=r0*Math.cos(a),z=r0*Math.sin(a),yl=y+.85,n=1+.04*Math.sin(x*7+yl*5)*Math.cos(z*6+yl*3)+.025*Math.sin(yl*19+x*11);return[x*n*1.02,y,z*n*1.02]};
const Wk=[];for(let i=0;i<46;i++)Wk.push(i<16?{t:1,a:rnd()*6.28,r:rnd()*.9,d:rnd()*6.28}:{t:0,a:rnd()*6.28,r:-.2-rnd()*1.4,d:rnd()*6.28});
const P=w=>w.t?[w.r*Math.cos(w.a),.014,w.r*Math.sin(w.a)]:surf(w.a,w.r);
const seg=[];for(let s=0;s<90;s++)for(let i=0;i<Wk.length;i++){const w=Wk[i],p0=P(w);w.d+=(rnd()-.5)*.9;if(w.t){w.a+=Math.sin(w.d)*.05/Math.max(w.r,.2);w.r=clamp(w.r+Math.cos(w.d)*.05,0,1.08)}else{w.a+=Math.cos(w.d)*.05/1.2;w.r=clamp(w.r+Math.sin(w.d)*.05,-1.68,-.03)}seg.push(...p0,...P(w));if(rnd()<.012&&Wk.length<150)Wk.push({...w,d:w.d+(rnd()-.5)*2})}
const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.Float32BufferAttribute(seg,3));
const myc=new THREE.LineSegments(mg,new THREE.LineBasicMaterial({color:0xfffaf0,transparent:true,opacity:.9})),mTot=seg.length/3;A.add(myc);
const grains=new THREE.InstancedMesh(new THREE.SphereGeometry(.04,8,6),M({color:0xe9dcb0,roughness:.7}),260);
{const m=new THREE.Matrix4();for(let i=0;i<260;i++){const a=rnd()*6.28,r=Math.sqrt(rnd())*1.05;m.compose(new THREE.Vector3(r*Math.cos(a),.03+rnd()*.03,r*Math.sin(a)),new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd()*3,rnd()*3,rnd()*3)),new THREE.Vector3(1.5,.9,.9));grains.setMatrixAt(i,m)}}A.add(grains);
/* oyster cap: ruffled, lateral-stem fan with a separate gill surface underneath */
function fan(under,nr,na){const a0=Math.PI*.64,a1=Math.PI*2.36,pos=[],uv=[],idx=[];
 for(let j=0;j<=nr;j++)for(let i=0;i<=na;i++){const r=j/nr,a=a0+(a1-a0)*i/na,w=1+.1*Math.sin(a*5+1)*r*r*r+.05*Math.sin(a*13)*r*r*r*r;
  let y=.46*Math.sqrt(Math.max(0,1-r*r))-.18*r*r*r*r;if(under)y-=.06+.03*r*Math.sin(a*70);
  pos.push(Math.cos(a)*r*w*1.15,y,Math.sin(a)*r*w-.9);uv.push(i/na,r)}
 for(let j=0;j<nr;j++)for(let i=0;i<na;i++){const p=j*(na+1)+i,q=p+na+1;idx.push(p,q,p+1,p+1,q,q+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
const nr=mobile?14:22,na=mobile?60:110,capG=fan(false,nr,na),gilG=fan(true,nr,na);
const capMs=[0xffffff,0xe0cfb0,0xb4bcc8,0xd8ccb8].map(c=>M({map:capT,color:c,roughness:.7,side:THREE.DoubleSide})),gilM=M({color:0xf0e8d6,roughness:.85,side:THREE.DoubleSide});
const stemG=new THREE.CylinderGeometry(.13,.075,1,14);stemG.translate(0,.5,0);const stemM=M({color:0xe7dcc4,roughness:.9});
const N=mobile?12:18,ms=[],up=new THREE.Vector3(0,1,0);
for(let i=0;i<N;i++){
 const a=i*2.399+.4,g=new THREE.Group();let pos,dir,size;
 if(i===0){pos=new THREE.Vector3(.1,0,.35);dir=new THREE.Vector3(0,1,.25);size=1.25}
 else if(i<7){const r=.15+.8*Math.sqrt(rnd());pos=new THREE.Vector3(r*Math.cos(a),0,r*Math.sin(a));dir=new THREE.Vector3(Math.cos(a)*.45,1,Math.sin(a)*.45);size=.55+rnd()*.5}
 else{const y=-.12-rnd()*.9;pos=new THREE.Vector3(1.2*Math.cos(a),y,1.2*Math.sin(a));dir=new THREE.Vector3(Math.cos(a),.6,Math.sin(a));size=.5+rnd()*.5}
 const stem=new THREE.Mesh(stemG,stemM),cp=new THREE.Group();cp.rotation.order='YXZ';cp.rotation.set(.55+rnd()*.35,i===0?Math.PI:rnd()*6.28,0);
 cp.add(new THREE.Mesh(capG,capMs[i%4]),new THREE.Mesh(gilG,gilM));g.add(stem,cp);g.position.copy(pos);g.quaternion.setFromUnitVectors(up,dir.normalize());A.add(g);
 const rr=.1+.5*rnd(),bd=new THREE.Vector3(Math.cos(a)*rr*.8,1,Math.sin(a)*rr*.8).normalize();
 ms.push({g,stem,cp,size,L:.5*size+.15,i,p0:pos.clone(),q0:g.quaternion.clone(),pB:new THREE.Vector3(4+rr*Math.cos(a),-1.42+rnd()*.1,rr*Math.sin(a)),qB:new THREE.Quaternion().setFromUnitVectors(up,bd)})}
const bA=basket();bA.position.set(4,-1.7,0);A.add(bA);
/* ===== Experience B: Nati Koli and the desi egg ===== */
const eGeo=new THREE.LatheGeometry(Array.from({length:25},(_,i)=>{const t=Math.PI*i/24;return new THREE.Vector2(Math.max(1e-4,.5*Math.sin(t)*(1+.1*Math.cos(t))),-.66*Math.cos(t))}),40);
const nest=new THREE.Group();nest.position.y=-1.7;nest.add(new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.5,.02],[.85,.12],[.95,.26],[.88,.3]].map(([x,y])=>new THREE.Vector2(x,y)),36),M({map:strawT,roughness:1,side:THREE.DoubleSide})));
{const st=new THREE.InstancedMesh(new THREE.CylinderGeometry(.012,.012,.5,4),M({color:0xcaa35a,roughness:.8}),140),m=new THREE.Matrix4();
 for(let i=0;i<140;i++){const a=rnd()*6.28,r=.55+rnd()*.45;m.compose(new THREE.Vector3(Math.cos(a)*r,.08+(r-.5)*.3,Math.sin(a)*r),new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd()*3,rnd()*6,rnd()*3)),new THREE.Vector3(1,.6+rnd()*.7,1));st.setMatrixAt(i,m)}nest.add(st)}
B.add(nest);
{const gm=new THREE.InstancedMesh(new THREE.ConeGeometry(.05,.55,3),M({color:0xffffff,roughness:1}),mobile?250:500),m=new THREE.Matrix4();
 for(let i=0;i<gm.count;i++){const a=rnd()*6.28,r=3.8+rnd()*10;m.compose(new THREE.Vector3(Math.cos(a)*r*1.2,-1.43,Math.sin(a)*r),new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd()-.5)*.3,0,(rnd()-.5)*.3)),new THREE.Vector3(1,.6+rnd()*1.3,1));gm.setMatrixAt(i,m);gm.setColorAt(i,new THREE.Color().setHSL(.25+rnd()*.07,.4+rnd()*.2,.2+rnd()*.15))}B.add(gm)}
const bB=basket();bB.scale.setScalar(.6);bB.position.set(2.2,-1.7,.9);B.add(bB);
const eggM=M({map:eT,roughness:.5,side:THREE.DoubleSide});
const pe=[];for(let i=0;i<3;i++){const e=new THREE.Mesh(eGeo,eggM),a=i*2.1;e.scale.setScalar(.26);e.rotation.set(0,a,Math.PI/2);e.position.set(2.2+Math.cos(a)*.14,-1.5,.9+Math.sin(a)*.14);B.add(e);pe.push(e)}
const eL=new THREE.Mesh(eGeo,eggM);eL.rotation.order='YXZ';B.add(eL);
/* native hen, built from plumage-textured ellipsoids with a walkable leg rig */
const fm=M({map:fT,roughness:.9}),mk=(g,geo,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);g.add(m);return m};
const SP=new THREE.SphereGeometry(1,24,16),hen=new THREE.Group(),bod=new THREE.Group(),hd=new THREE.Group(),legs=[];hen.add(bod);
mk(bod,SP,fm,0,1,0,.62,.55,.95,.12);
mk(bod,SP,M({map:fT,color:0xd9a070,roughness:.9}),0,.9,.55,.45,.42,.42);
const dk=M({color:0x1d1b20,roughness:.45,metalness:.3});
for(let k=-2;k<=2;k++)mk(bod,SP,dk,k*.11,1.4,-.95,.06,.5,.2,-.55,0,k*.22);
[-1,1].forEach(s=>mk(bod,SP,M({map:fT,color:0xb08060,roughness:.9}),s*.58,1,-.05,.1,.4,.7,0,0,s*.18));
hd.position.set(0,1.15,.55);bod.add(hd);
mk(hd,new THREE.CylinderGeometry(.14,.2,.75,12),fm,0,.38,.12,1,1,1,.3);
mk(hd,SP,fm,0,.82,.35,.19,.21,.26);
mk(hd,new THREE.ConeGeometry(.07,.22,10),M({color:0xd9a63a,roughness:.5}),0,.78,.6,1,1,1,Math.PI/2);
const red=M({color:0xc0392b,roughness:.55});[[1.02,.33],[1,.4],[.97,.47]].forEach(([y,z])=>mk(hd,SP,red,0,y,z,.035,.09,.07));mk(hd,SP,red,0,.62,.5,.04,.1,.05);
[-1,1].forEach(s=>mk(hd,SP,M({color:0x050505,roughness:.2}),s*.15,.86,.45,.035,.035,.035));
const lm=M({color:0xd2a23a,roughness:.6});
[-1,1].forEach(s=>{const l=new THREE.Group();l.position.set(s*.25,.68,.05);mk(l,new THREE.CylinderGeometry(.05,.04,.7,8),lm,0,-.35,0);[-.3,0,.3].forEach(a=>mk(l,new THREE.CylinderGeometry(.025,.02,.28,5),lm,Math.sin(a)*.12,-.68,.1,1,1,1,Math.PI/2,0,-a));hen.add(l);legs.push(l)});
B.add(hen);
/* egg cutaway: shell, albumen and yolk sections */
const prof=Array.from({length:49},(_,i)=>{const t=Math.PI*i/48;return[.5*Math.sin(t)*(1+.1*Math.cos(t)),-.66*Math.cos(t)]});
const shp=k=>{const s=new THREE.Shape();prof.forEach(([x,y],i)=>i?s.lineTo(x*k,y*k):s.moveTo(x*k,y*k));prof.slice().reverse().forEach(([x,y])=>s.lineTo(-x*k,y*k));return new THREE.ShapeGeometry(s)};
const pBack=new THREE.Plane(new THREE.Vector3(0,0,-1),0),pFront=new THREE.Plane(new THREE.Vector3(0,0,1),0);
const shB=eggM.clone();shB.clippingPlanes=[pBack];const shF=eggM.clone();shF.clippingPlanes=[pFront];shF.transparent=true;
const cutG=new THREE.Group(),frontH=new THREE.Mesh(eGeo,shF);
const sec=(g,c,z)=>{const m=new THREE.Mesh(g,M({color:c,roughness:.35,side:THREE.DoubleSide}));m.position.z=z;cutG.add(m)};
cutG.add(new THREE.Mesh(eGeo,shB),frontH);sec(shp(1),0xc98f5d,.002);sec(shp(.93),0xf4efe2,.004);
const yk=new THREE.Mesh(new THREE.CircleGeometry(.27,40),M({color:0xf2a31c,roughness:.3}));yk.position.set(0,-.02,.008);cutG.add(yk);
const yk2=new THREE.Mesh(new THREE.CircleGeometry(.15,32),M({color:0xf9c14a,roughness:.3}));yk2.position.set(.03,0,.012);cutG.add(yk2);
B.add(cutG);
{const sh=o=>o.traverse(m=>{if(m.isMesh&&!m.isInstancedMesh||m.isInstancedMesh){m.castShadow=true;m.receiveShadow=true}});[sub,bA,bB,hen,nest,eL,cutG,...ms.map(m=>m.g)].forEach(sh)}
bagFx.forEach(m=>{m.castShadow=false;m.receiveShadow=false});
/* labels */
const L=[];const lab=(t,p,a,b)=>{const el=document.createElement('div');el.className='lbl';el.innerHTML='<i></i><b>'+t+'</b>';$('#labels').append(el);L.push({el,p,a,b,g:b<10?0:1})};
const h0=ms[0];
lab('Spawn',anchor(A,.5,.05,.3),.2,1.4);lab('Substrate',anchor(A,-1.05,-1.2,.6),.3,2.4);lab('Mycelium',anchor(A,1.2,-.6,.45),1.3,2.6);
lab('Mushroom cap',anchor(h0.cp,0,.5,-.9),4.2,6.1);lab('Gills',anchor(h0.cp,0,.2,-.45),4.4,6.1);lab('Stem',anchor(h0.g,0,.3,0),4.6,6.1);
lab('Shell',anchor(cutG,-.47,.1,.02),17.3,19.1);lab('Egg white',anchor(cutG,-.33,.36,.02),17.4,19.1);lab('Egg yolk',anchor(cutG,.05,-.02,.02),17.5,19.1);
L.forEach(l=>{l.g=l.b<10?0:1});
/* camera rails (Catmull-Rom through per-chapter keyframes: position, look-at) */
const rail=k=>[new THREE.CatmullRomCurve3(k.map(v=>new THREE.Vector3(v[0],v[1],v[2]))),new THREE.CatmullRomCurve3(k.map(v=>new THREE.Vector3(v[3],v[4],v[5]))),new THREE.CatmullRomCurve3(k.map(v=>new THREE.Vector3(v[6],0,0)))];
/* keys per chapter: [camX,camY,camZ, lookX,lookY,lookZ, fov]. Wide establishing shots, a few deliberate closer beats. */
const cA=rail([[0,2.2,7.8,0,-.7,0,34],[3.4,.6,7.6,0,-.7,0,34],[-2.2,1.6,8.8,0,-.4,0,36],[0,1.2,9.6,0,.1,0,37],[1.4,.8,10.4,0,.35,.3,38],[0,1.6,12.6,0,.6,0,38],[1.6,2.2,13.6,1.6,.3,0,38],[3.6,1.6,10.6,3.6,-.5,0,36],[4.2,.8,7.8,4,-.7,0,34],[4.6,.3,8.4,4,-.8,0,34]]);
const cB=rail([[-1.5,0,9.6,-2.7,-.8,1.2,36],[-1.8,.4,10.6,-2,-.8,.9,36],[-.8,.2,8.6,-.2,-1,.2,36],[1.6,.2,9.4,-.1,-.9,.2,36],[.9,.1,6.6,-.2,-1.1,.2,36],[1.2,.2,7.6,1.1,-1,.5,36],[1.3,-.3,6.6,1.15,-.6,1.5,34],[1.3,-.3,6.8,1.15,-.6,1.5,34],[1.4,-.4,6.2,1.15,-.6,1.5,34]]);
/* UI */
const CH=[['Oyster mushroom journey 1/10','Spawn meets substrate','Mushroom spawn, grain colonised by mycelium, is mixed into a prepared growing substrate such as straw.'],['Oyster mushroom journey 2/10','Mycelium spreads','White mycelium threads grow through the substrate and bind it together.'],['Oyster mushroom journey 3/10','Pins appear','Tiny primordia, called pins, push out of the surface when conditions are right.'],['Oyster mushroom journey 4/10','Growing','Stems lengthen and the first small caps begin to form.'],['Oyster mushroom journey 5/10','Caps expand','Caps widen and ruffle into the soft fan shape oyster mushrooms are known for.'],['Oyster mushroom journey 6/10','A full cluster','A mature cluster: the cap, the gills beneath it, and the short stem joining them.'],['Oyster mushroom journey 7/10','Harvest','Mature clusters are picked by hand at harvest time.'],['Oyster mushroom journey 8/10','Into the basket','Freshly picked mushrooms are placed gently into a natural basket.'],['Oyster mushroom journey 9/10','Fresh from the farm','Tender, fresh and ready to supply.'],['Oyster mushroom journey 10/10','What is inside','Nutritional highlights of raw oyster mushrooms.'],
['Nati Koli and desi egg 1/9','Nati Koli at home','Our native country chicken, the Nati Koli, in a natural farm setting.'],['Nati Koli and desi egg 2/9','Heading to the nest','When ready to lay, a hen looks for a quiet, sheltered nest.'],['Nati Koli and desi egg 3/9','Settling in','She settles into the straw and stays calm and still.'],['Nati Koli and desi egg 4/9','Laying','An egg is laid while she rests on the nest.'],['Nati Koli and desi egg 5/9','A fresh egg','A freshly laid egg rests in the nest.'],['Nati Koli and desi egg 6/9','Collecting','Eggs are collected gently and placed in a basket.'],['Nati Koli and desi egg 7/9','The desi egg','A closer look at a brown-shelled desi egg.'],['Nati Koli and desi egg 8/9','Inside the egg','A cross-section: the shell, the egg white and the yolk.'],['Nati Koli and desi egg 9/9','What is inside','Nutritional highlights for one large egg.']];
const NC=CH.length,WT=CH.map((_,i)=>i===9||i===18?1.7:1),WS=WT.reduce((a,b)=>a+b,0),WC=WT.reduce((a,w)=>(a.push(a[a.length-1]+w),a),[0]),warp=t=>{const x=t*WS;let i=0;while(i<NC-1&&x>=WC[i+1])i++;return i+(x-WC[i])/WT[i]},intro=$('#intro'),chap=$('#chap'),cn=$('#cn'),ct=$('#ct'),cx=$('#cx'),ci=$('.ci'),veil=$('.veil'),bar=$('#bar'),nA=$('#nutA'),nB=$('#nutB');
const lisA=[...nA.querySelectorAll('li')],lisB=[...nB.querySelectorAll('li')];
const nut=(el,lis,u,out)=>{el.style.opacity=(sm(u/.15)*out).toFixed(3);lis.forEach((li,k)=>{const p=sm((u-.12-k*.1)/.2);li.style.opacity=p;li.style.transform=`translateX(${(1-p)*-18}px)`;const n=li.querySelector('.num');if(n)n.textContent=(+n.dataset.v*p).toFixed(+n.dataset.d||0);const b=li.querySelector('i');if(b)b.style.transform=`scaleX(${p})`})};
let dm=1;function fit(){const w=hero.clientWidth,h=innerHeight;dm=Math.max(1,1.1/(w/h));R.setSize(w,h,false);cam.aspect=w/h;if(w>900)cam.setViewOffset(w,h,-w*.14,0,w,h);else if(w<760)cam.setViewOffset(w,h,0,h*.06,w,h);else cam.clearViewOffset();cam.updateProjectionMatrix()}
addEventListener('resize',fit);fit();
const S={t:0},V=new THREE.Vector3(),T=new THREE.Vector3(),S0=[-3.9,1.7],N0=[-.1,.1],O=[-5.2,-2.4],NP=new THREE.Vector3(0,-1.54,0),BP=new THREE.Vector3(2.2,-1.38,.9),DP=new THREE.Vector3(.8,-.5,1.5);let ES=.26,HN=hen,gh=null,useM=false,gb=null;
const yawIn=Math.atan2(N0[0]-S0[0],N0[1]-S0[1]),yawOut=Math.atan2(O[0]-N0[0],O[1]-N0[1]);
let live=true,last=-1;
function render(){if(!live)return;
 const t=S.t,ch=warp(t),inB=ch>=10;A.visible=!inB;B.visible=inB;
 scn.background.copy(inB?C(0x2a2818):C(0x0b1d15));hemi.intensity=inB?.7:.3;rim.intensity=inB?1.1:.9;scn.fog.color.copy(scn.background);floorM.color.copy(inB?C(0x48442a):C(0x0f261b));key.color.copy(inB?C(0xfff0d0):C(0xffe2b8));
 veil.style.opacity=clamp(1-Math.abs(ch-10)/.3).toFixed(3);bar.style.width=(t*100)+'%';
 const idx=Math.min(NC-1,Math.floor(ch));
 if(idx!==last){last=idx;cn.textContent=CH[idx][0];ct.textContent=CH[idx][1];cx.textContent=CH[idx][2];ci.classList.remove('in');void ci.offsetWidth;ci.classList.add('in');hero.classList.toggle('nutOn',idx===9||idx===18)}
 const io=1-sm(ch/.45);intro.style.opacity=io;intro.style.pointerEvents=io<.15?'none':'auto';chap.style.opacity=sm((ch-.4)/.3);
 nut(nA,lisA,ch-9,1-sm((ch-9.75)/.25));nut(nB,lisB,ch-18,1);
 if(!inB){
  const my=sm((ch-.8)/1.4);mg.setDrawRange(0,(mTot*my)|0);subM.emissive.setScalar(.1*my);grains.visible=ch<3.3;const sk=sm((ch-7.8)/.7)*2.4;sub.position.y=-.85-sk;myc.position.y=-sk;bA.scale.setScalar(Math.max(.001,sm((ch-4.4)/.8)));const pk=Math.max(.001,sm((ch-2.8)/1.2)*(1-sm((ch-6.2)/.8)));pins.forEach(q=>q.scale.setScalar(pk));
  if(useM)for(const c of cl){const gI=sm((ch-c.st)/3),hv=sm((ch-c.hs)/1),sy=Math.pow(gI,.8),sx=Math.pow(gI,1.3),f=lerp(c.fs,c.fb,hv);c.piv.visible=gI>.003;c.piv.scale.set(sx*f,sy*f,sx*f);c.piv.position.lerpVectors(c.p0,c.pB,hv);c.piv.position.y+=Math.sin(Math.PI*hv)*1;c.piv.rotation.y=c.r0+hv*.7}
  else for(const m of ms){const gi=sm((ch-(2+m.i/N*1.1))/1.9),cs=sm((gi-.3)/.7),hv=sm((ch-(6+m.i/N*.8))/1);
   m.g.visible=gi>.002;m.stem.scale.set(m.size*(.35+.65*gi),m.L*gi+.001,m.size*(.35+.65*gi));m.cp.position.y=m.L*gi;m.cp.scale.setScalar(m.size*.62*cs+1e-4);
   m.g.position.lerpVectors(m.p0,m.pB,hv);m.g.position.y+=Math.sin(Math.PI*hv)*1.3;m.g.quaternion.copy(m.q0).slerp(m.qB,hv);m.g.scale.setScalar(lerp(1,.55,hv))}
 }else{
  /* hen now starts directly in the walking state: no fly / landing / wake-up intro clip */
  const w1=sm((ch-10.2)/2.4),w2=sm((ch-14)/.9),sq=sm((ch-12.6)/.7)-sm((ch-13.9)/.5),mv=clamp(Math.min(w1,1-w1)*12+Math.min(w2,1-w2)*12);
  let x=lerp(S0[0],N0[0],w1),z=lerp(S0[1],N0[1],w1);if(w2>0){x=lerp(N0[0],O[0],w2);z=lerp(N0[1],O[1],w2)}
  HN.visible=ch<14.95;HN.position.set(x,-1.7-(gh?.38:.42)*sq,z);HN.rotation.y=lerp(yawIn,yawOut,sm((ch-13.9)/.5));
  const ph=(w1*4.9+w2*5.7)*5;legs[0].rotation.x=Math.sin(ph)*.6*mv;legs[1].rotation.x=-Math.sin(ph)*.6*mv;legs.forEach(l=>l.scale.y=1-.85*sq);
  bod.position.y=Math.abs(Math.sin(ph))*.04*mv+Math.sin(ch*40)*.012*sq;hd.rotation.x=Math.max(0,Math.sin(ch*26))*.28*(1-w1)+Math.sin(ph*2)*.06*mv;
  if(gh){gh.aI.time=0;gh.aW.time=((w1*4.9+w2*5.7)/1.15)%1;gh.aI.setEffectiveWeight(Math.max(.001,1-mv));gh.aW.setEffectiveWeight(Math.max(.001,mv));gh.mx.update(0)}
  if(gb)gb.scale.setScalar(Math.max(.001,1.25*sm((ch-12.2)/.8)));const e1=sm((ch-14.6)/1.1),e2=sm((ch-15.9)/.9);eL.visible=ch>=13.2&&ch<17;
  eL.position.lerpVectors(NP,BP,e1);eL.position.y+=Math.sin(Math.PI*e1)*1;eL.position.lerp(DP,e2);eL.scale.setScalar(lerp(ES*sm((ch-13.2)/.8),1.3,e2));
  eL.rotation.set(0,.5+(Math.PI*2-.5)*sm((ch-16.3)/.7),lerp(Math.PI/2,0,e2));
  const u=ch-17;cutG.visible=ch>=17;cutG.position.copy(DP);cutG.scale.setScalar(1.3);const f=sm((u-.1)/.6);frontH.position.z=.8*f;shF.opacity=1-sm((u-.2)/.5);frontH.visible=shF.opacity>.01;
 }
 const pc=inB?cB:cA,u=inB?clamp((ch-10)/8):clamp(ch/9);pc[1].getPoint(u,T);pc[0].getPoint(u,cam.position);cam.position.sub(T).multiplyScalar(dm>1.15&&!inB?dm*(1+.35*sm((ch-5.6)/.6)*(1-sm((ch-7.4)/.6))):dm).add(T);cam.lookAt(T);pc[2].getPoint(u,V);if(Math.abs(cam.fov-V.x)>.01){cam.fov=V.x;cam.updateProjectionMatrix()}cam.updateMatrixWorld();const dist=cam.position.distanceTo(T);scn.fog.near=dist+5;scn.fog.far=dist+22;
 const W=hero.clientWidth,H=innerHeight;
 for(const l of L){const op=(l.g===(inB?1:0))?sm((ch-l.a)/.3)*sm((l.b-ch)/.3):0;if(op<.02){l.el.style.opacity=0;continue}
  l.p.updateWorldMatrix(true,false);V.setFromMatrixPosition(l.p.matrixWorld).project(cam);const x=(V.x*.5+.5)*W,y=(-V.y*.5+.5)*H;
  l.el.style.opacity=V.z>1?0:op.toFixed(3);l.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;l.el.classList.toggle('flip',x>W*.62)}
 R.render(scn,cam)}
/* ===== Real 3D models (GLB). The code-built versions above stay as an automatic fallback if a file fails to load. ===== */
const MD='assets/models/',gl=THREE.GLTFLoader?new THREE.GLTFLoader():null,cl=[];
const prep=o=>o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;if(m.isSkinnedMesh)m.frustumCulled=false;[].concat(m.material).forEach(x=>{x.metalness=0;x.roughness=Math.max(x.roughness||0,.65);x.envMapIntensity=.6})});
const get=(f,ok)=>gl&&gl.load(MD+f,g=>{try{ok(g)}catch(e){console.warn(f,e)}},undefined,()=>console.warn('could not load',f));
/* Realistic feathers: the GLB ships its feather cards as alpha-BLEND, which sorts badly (ghosting, washed-out, holes).
   Convert to hard cutout + alpha-to-coverage, restore real depth writing, sharpen the maps, and add a soft feather sheen. */
const featherUp=o=>{const mxA=R.capabilities.getMaxAnisotropy();o.traverse(m=>{if(!m.isMesh)return;[].concat(m.material).forEach(x=>{
 x.transparent=false;x.alphaTest=.4;x.alphaToCoverage=!mobile;x.depthWrite=true;x.side=THREE.DoubleSide;
 x.metalness=0;x.roughness=.58;x.envMapIntensity=1.05;x.color.setRGB(1.06,1.03,1);
 if(x.normalMap)x.normalScale.set(1.35,1.35);
 [x.map,x.normalMap].forEach(t=>{if(t){t.anisotropy=Math.min(mxA,mobile?4:16);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.needsUpdate=true}});
 x.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>',
  'float fr=pow(1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0),3.0);gl_FragColor.rgb+=fr*0.10*vec3(1.0,0.86,0.66);\n#include <dithering_fragment>')};
 x.needsUpdate=true})})};
get('mushroom.glb',g=>{
 /* [x, z, yaw, final scale, grow-start chapter, harvest delay] */
 const sp=[[0,0,0,1.5,2,0],[.85,.6,.9,.62,2.5,.3],[-.8,-.65,2.2,.55,2.8,.6]].slice(0,mobile?2:3),hp=[[4,-1.5,0],[3.55,-1.45,.32],[4.4,-1.45,-.3]],fbk=[.6,.26,.24];
 sp.forEach(([x,z,r,fs,st,hs],i)=>{const piv=new THREE.Group(),m=g.scene.clone(true);prep(m);m.position.y=.89;piv.add(m);piv.position.set(x,0,z);piv.rotation.y=r;A.add(piv);cl.push({piv,m,fs,fb:fbk[i],st,hs:6+hs,r0:r,p0:new THREE.Vector3(x,0,z),pB:new THREE.Vector3(...hp[i])})});
 const m0=cl[0].m;L[3].p=anchor(m0,0,.78,.05);L[4].p=anchor(m0,-.6,-.5,.55);L[5].p=anchor(m0,.02,-.1,.15);
 ms.forEach(m=>m.g.visible=false);useM=true});
get('hen.glb',g=>{const h=g.scene;prep(h);featherUp(h);const w=new THREE.Group();h.position.set(0,-.014,.058);w.add(h);w.scale.setScalar(3.3);B.add(w);
 const mx=new THREE.AnimationMixer(h),c=g.animations[0],sub=(n,a,b)=>THREE.AnimationUtils.subclip(c,n,a,b,30),aI=mx.clipAction(sub('idle',0,42)),aW=mx.clipAction(sub('walk',168,198));
 [aI,aW].forEach(a=>{a.play();a.timeScale=0});gh={mx,aI,aW};hen.visible=false;HN=w});
get('basket.glb',g=>{const b=g.scene;prep(b);b.traverse(m=>{if(m.isMesh)[].concat(m.material).forEach(x=>x.color.setRGB(1,.88,.76))});const w=new THREE.Group();w.add(b);w.scale.setScalar(1.25);w.position.set(2.3,-1.7+.365*1.25,.9);B.add(w);gb=w;bB.visible=false;pe.forEach(e=>e.visible=false);BP.set(2.3,-1.08,.9);ES=.3});
gsap.to(S,{t:1,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom bottom',scrub:.25,onToggle:s=>{live=s.isActive;if(!live)requestAnimationFrame(()=>{live=true;render();live=false})}}});
gsap.ticker.add(render);
})();
