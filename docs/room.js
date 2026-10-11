// Original procedural 3D sample room. Native WebGL; no CDN, trackers, or runtime dependencies.
const unit=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
function lookAt(eye,target){const z=unit(eye.map((x,i)=>x-target[i])),x=unit(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
function multiply(a,b){const out=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++)out[c*4+r]=[0,1,2,3].reduce((s,k)=>s+a[k*4+r]*b[c*4+k],0);return out;}
const rgb=hex=>hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255);
export function createRoom(canvas){
 const gl=canvas.getContext('webgl',{antialias:true,alpha:false});if(!gl)throw new Error('WebGL unavailable');
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Room shader unavailable');return s;};
 const program=gl.createProgram();
 gl.attachShader(program,compile(gl.VERTEX_SHADER,`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uCamera;varying vec3 color;void main(){float light=.65+.28*max(dot(normalize(aNormal),normalize(vec3(-.6,1.0,.7))),0.0);color=aColor*light;gl_Position=uCamera*vec4(aPosition,1.0);}`));
 gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`precision mediump float;varying vec3 color;void main(){gl_FragColor=vec4(color,1.0);}`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Room renderer unavailable');gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 for(const [i,name] of ['aPosition','aNormal','aColor'].entries()){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,36,i*12);}
 const cameraUniform=gl.getUniformLocation(program,'uCamera');gl.enable(gl.DEPTH_TEST);gl.clearColor(.91,.934,.874,1);
 let vertices=[],count=0,angle=.78,zoom=1,drag=null,lastState={tasks:[],owned:[],source:'sample'};
 function vertex(p,n,c,center,rotation=0){const co=Math.cos(rotation),si=Math.sin(rotation);vertices.push(center[0]+p[0]*co+p[2]*si,center[1]+p[1],center[2]-p[0]*si+p[2]*co,n[0]*co+n[2]*si,n[1],-n[0]*si+n[2]*co,...c);}
 function box(center,size,color,r=.035,rotation=0){const h=size.map(v=>v/2),c=rgb(color),radius=Math.min(r,...h.map(v=>v*.8)),inner=h.map(v=>v-radius);
  for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const a=(axis+1)%3,b=(axis+2)%3;
   const vals=i=>[-h[i],-inner[i],inner[i],h[i]];
   const point=(u,v)=>{const p=[0,0,0];p[axis]=sign*h[axis];p[a]=u;p[b]=v;const q=p.map((x,i)=>Math.max(-inner[i],Math.min(inner[i],x)));const n=unit(p.map((x,i)=>x-q[i]));return {p:q.map((x,i)=>x+n[i]*radius),n};};
   const us=vals(a),vs=vals(b);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const q=[point(us[i],vs[j]),point(us[i+1],vs[j]),point(us[i+1],vs[j+1]),point(us[i],vs[j+1])];for(const index of [0,1,2,0,2,3])vertex(q[index].p,q[index].n,c,center,rotation);}
  }
 }
 function ellipsoid(center,size,color){const c=rgb(color),rows=9,cols=16;const point=(i,j)=>{const a=Math.PI*i/rows,b=Math.PI*2*j/cols;const p=[Math.sin(a)*Math.cos(b)*size[0],Math.cos(a)*size[1],Math.sin(a)*Math.sin(b)*size[2]];return {p,n:unit(p.map((x,k)=>x/(size[k]*size[k])))};};for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const q=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];for(const k of [0,1,2,0,2,3])vertex(q[k].p,q[k].n,c,center);}}
 function cylinder(center,radius,height,color,topRadius=radius){const c=rgb(color);for(let i=0;i<20;i++){const a=i*Math.PI/10,b=(i+1)*Math.PI/10;const p=[[Math.cos(a)*radius,-height/2,Math.sin(a)*radius],[Math.cos(b)*radius,-height/2,Math.sin(b)*radius],[Math.cos(b)*topRadius,height/2,Math.sin(b)*topRadius],[Math.cos(a)*topRadius,height/2,Math.sin(a)*topRadius]];for(const k of [0,1,2,0,2,3])vertex(p[k],unit([p[k][0],(radius-topRadius)*radius/height,p[k][2]]),c,center);for(const y of [-1,1]){const r=y===1?topRadius:radius;for(const q of [[0,y*height/2,0],[Math.cos(a)*r,y*height/2,Math.sin(a)*r],[Math.cos(b)*r,y*height/2,Math.sin(b)*r]])vertex(q,[0,y,0],c,center);}}}
 const pot=(x,y,z,scale=1)=>{cylinder([x,y+.18*scale,z],.18*scale,.35*scale,'c38e65',.24*scale);cylinder([x,y+.36*scale,z],.21*scale,.025*scale,'756649');for(let i=0;i<5;i++){const a=i*2.4;ellipsoid([x+Math.cos(a)*.17*scale,y+.58*scale+(i%2)*.11*scale,z+Math.sin(a)*.17*scale],[.2*scale,.22*scale,.14*scale],i%2?'8caa69':'718e56');}};
 function build(state){lastState=state;vertices=[];const done=id=>state.source==='sample'&&state.tasks.some(t=>t.id===id&&t.done);const all=state.tasks.length>0&&state.tasks.every(t=>t.done);
  box([0,-.12,0],[6.15,.30,4.75],'c2ad88',.10);box([0,.05,0],[6,.08,4.6],'dac4a0',.025);
  for(let z=-2;z<2.3;z+=.46)box([0,.099,z],[5.91,.008,.012],'c3ae8f',.001);
  box([0,1.60,-2.32],[6.10,3.16,.13],'dbe0c5');box([-3.02,1.60,0],[.13,3.16,4.68],'c7d3b5');
  box([0,.22,-2.21],[5.96,.20,.08],'e9e9d1');box([-2.93,.22,0],[.08,.20,4.52],'e1e6cd');
  // Framed window with a little sky and distant hills.
  box([.1,2.02,-2.22],[1.79,1.63,.09],'f5eed6');box([.1,2.02,-2.155],[1.53,1.37,.055],'b6d6d0');
  ellipsoid([.30,1.46,-2.10],[.54,.30,.035],'9cb7a1');ellipsoid([-.37,1.39,-2.09],[.51,.29,.035],'afc4a1');
  box([.1,2.02,-2.03],[.07,1.45,.085],'f9efdb');box([.1,2.02,-2.03],[1.61,.07,.085],'f9efdb');box([.1,1.28,-2.08],[1.97,.10,.30],'f4e8ce');
  box([-1.9,2.02,-2.16],[.64,.82,.09],'ac875e');box([-1.9,2.02,-2.10],[.51,.69,.04],'eae2ca');ellipsoid([-1.9,2.10,-2.055],[.16,.18,.02],'b1bd8b');box([-1.9,1.86,-2.02],[.04,.25,.04],'9a9a6b');
  // Soft sage sofa.
  for(const x of [-1.87,-.23])for(const z of [-1.23,-.40])box([x,.27,z],[.13,.30,.13],'947459');
  box([-1.05,.53,-.87],[2.17,.47,1.11],'829477',.10);box([-1.05,1.04,-1.34],[2.15,1.03,.28],'8e9f81',.13);
  for(const x of [-2.03,-.07])box([x,.81,-.85],[.28,.71,1.15],'93a284',.11);
  for(const x of [-1.53,-.56])box([x,.82,-.80],[.91,.23,.84],'adba96',.095);
  box([-1.72,1.19,-1.09],[.48,.48,.18],'e7c9a3',.10,.14);box([-.48,1.14,-1.08],[.51,.40,.19],'cdd1ad',.09,-.08);
  // Rug, table, chair, cabinet.
  box([.06,.13,.68],[3.68,.065,2.18],state.owned.includes('rug')?'dca68c':'c6caa5',.06);
  for(const z of [-.27,1.64])box([.06,.17,z],[3.45,.008,.045],state.owned.includes('rug')?'f0d3b6':'e2dfbc',.004);
  for(const x of [-.55,.58])for(const z of [.24,.89])box([x,.35,z],[.10,.42,.10],'a88762',.025);
  box([.02,.60,.58],[1.65,.17,1.11],'bd9d73',.09);
  box([2.13,.53,.70],[1.0,.22,.94],'bb9067',.075);box([2.13,1.0,.27],[1.0,1.04,.19],'c4a477',.08);
  box([2.13,.71,.76],[.91,.20,.82],'e0c9a0',.08);for(const x of [1.78,2.46])for(const z of [.42,1.0])box([x,.33,z],[.095,.50,.10],'a9875e');
  box([2.01,.62,-1.70],[1.35,1.05,.67],'c2a479');box([2.01,1.19,-1.7],[1.48,.11,.78],'d5b487');
  for(const x of [1.66,2.34]){box([x,.68,-1.345],[.59,.84,.04],'b5966d');ellipsoid([x+.12,.70,-1.31],[.035,.035,.03],'786c50');}
  pot(2.07,1.25,-1.7,.75);pot(-2.51,.13,1.21,1.22);
  // A simple toy bin.
  box([-1.99,.38,1.71],[.8,.51,.57],'d1ad79',.07);box([-1.99,.65,1.71],[.84,.07,.62],'bf9c68');box([-1.99,.692,1.71],[.67,.014,.46],'9b845e',.025);
  if(!done('cups')&&!all){cylinder([-.34,.82,.57],.12,.29,'e7e5cd');ellipsoid([-.34,.97,.57],[.09,.014,.09],'aa987b');cylinder([.42,.78,.38],.10,.20,'bdc0a0');}
  if(!done('clothes')&&!all){ellipsoid([2.14,.87,.76],[.34,.09,.26],'b5a3b9');box([2.36,.81,.79],[.27,.12,.45],'b7a5ba',.05);ellipsoid([2.07,.94,.64],[.25,.07,.22],'dbc4b9');}
  if(!done('toys')&&!all){box([-.66,.26,1.58],[.25,.22,.24],'d29c71',.03,.3);box([.12,.23,1.89],[.25,.20,.23],'91a6ac',.03,-.2);ellipsoid([1.06,.29,1.58],[.18,.18,.18],'c8b66f');}
  if(!done('table')&&!all){for(let i=0;i<6;i++)ellipsoid([-.1+i*.07,.694,.80+(i%2)*.075],[.018,.005,.018],'997b54');}
  if(state.owned.includes('plant'))pot(.62,1.33,-2.0,.5);
  if(state.owned.includes('lamp')){cylinder([1.11,.20,-1.46],.22,.09,'ab9063');cylinder([1.11,1.15,-1.46],.035,1.85,'b79b69');cylinder([1.11,2.13,-1.46],.40,.46,'edda9c',.23);}
  // Original bear companion on the floor.
  ellipsoid([-1.45,.40,1.07],[.21,.28,.18],'c8a07a');ellipsoid([-1.45,.73,1.07],[.27,.25,.22],'cda77f');
  for(const x of [-1.66,-1.24])ellipsoid([x,.93,1.08],[.10,.12,.07],'bb916d');for(const x of [-1.54,-1.36]){ellipsoid([x,.74,1.28],[.022,.029,.016],'45483a');ellipsoid([x,.19,1.17],[.11,.08,.11],'b9946d');}ellipsoid([-1.45,.67,1.30],[.032,.023,.018],'62614b');
  if(all)for(let i=0;i<7;i++){const x=-2.1+i*.68,y=1.6+(i%3)*.37,z=.4;ellipsoid([x,y,z],[.025,.12,.025],'efdfa0');ellipsoid([x,y,z],[.09,.025,.025],'efdfa0');}
  count=vertices.length/9;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);draw();
 }
 function draw(){if(gl.isContextLost())return;const d=Math.min(devicePixelRatio||1,2),w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}gl.viewport(0,0,canvas.width,canvas.height);const aspect=w/h,half=Math.max(4.35,4.05/aspect)/zoom,near=.1,far=50;const projection=[1/(half*aspect),0,0,0,0,1/half,0,0,0,0,-2/(far-near),0,0,-.1,-(far+near)/(far-near),1];const view=lookAt([9*Math.cos(angle),7.8,9*Math.sin(angle)],[0,1.02,0]);gl.uniformMatrix4fv(cameraUniform,false,new Float32Array(multiply(projection,view)));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,count);}
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,angle};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(drag){angle=Math.max(.18,Math.min(1.40,drag.angle-(e.clientX-drag.x)*.006));draw();}});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','+','-','='].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')angle=Math.max(.18,angle-.08);if(e.key==='ArrowRight')angle=Math.min(1.4,angle+.08);if(e.key==='+'||e.key==='=')zoom=Math.min(1.3,zoom+.05);if(e.key==='-')zoom=Math.max(.8,zoom-.05);draw();}});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('room-fallback').hidden=false;});canvas.addEventListener('webglcontextrestored',()=>location.reload());
 const observer=new ResizeObserver(draw);observer.observe(canvas);build(lastState);return {update:build,reset(){angle=.78;zoom=1;draw();}};
}
