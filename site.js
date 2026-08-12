
/* данные: CH — в самой странице, LIB — в lib.js */

/* ================= сборка статьи ================= */
const art=document.getElementById("art");
if(art&&typeof CH!=="undefined"){
art.innerHTML=((typeof LEAD!=="undefined"&&LEAD)?`<div class="blk lead">${LEAD}</div>`:"")+CH.map((c,i)=>
 (c.a||[]).map(x=>`<a id="${x}"></a>`).join("")+
 `<h2 id="s${i}" data-n="${i}"><em>${c.t}</em></h2><div class="blk">${c.h}`+
 ((c.r&&c.r.length)?`<div class="rel"><b>Связано с разделом</b><div class="chips">${c.r.map(x=>`<a href="${x[1]}">${x[0]}</a>`).join("")}</div></div>`:"")+
 `</div>`
).join("");

/* оглавление */
const heads=[...art.querySelectorAll("h2,h3")];
heads.forEach((h,i)=>{if(!h.id)h.id="h"+i});
document.getElementById("tocBody").innerHTML=heads.map((h,i)=>{
  const two=h.tagName==="H2";
  return `<div class="tocrow ${two?"":"d3"}" data-to="${h.id}">
    ${two?`<span class="num">${String(+h.dataset.n+1).padStart(2,"0")}</span>`:""}
    <b>${h.textContent}</b>${two?`<span class="p" data-p="${h.id}"></span>`:""}</div>`;
}).join("");

}
/* ================= меню ================= */
const $=i=>document.getElementById(i);
let tab=Object.keys(LIB)[0];
$("tabs").innerHTML=Object.keys(LIB).map(k=>`<button data-tab="${k}" class="${k===tab?"on":""}">${k}</button>`).join("");

function renderMenu(q){
  q=(q||"").trim().toLowerCase();
  const box=$("menuList");
  const mk=s=>{const i=s.toLowerCase().indexOf(q);return q&&i>=0?s.slice(0,i)+"<u>"+s.slice(i,i+q.length)+"</u>"+s.slice(i+q.length):s};
  if(!q){
    const L=LIB[tab]||[];
    box.innerHTML=L.length
      ? L.map(([n,m,h])=>`<a class="row" href="${BASE}${h}"><b>${n}</b><i>${m}</i></a>`).join("")
      : `<div class="empty">Пусто.</div>`;
    return;
  }
  let h="";
  // 1) статьи по названию
  const arts=[];
  for(const [g,items] of Object.entries(LIB))
    for(const [n,m,href,al] of items){
      const byName=n.toLowerCase().includes(q);
      const hit=byName?null:(al||[]).find(a=>a.toLowerCase().includes(q));
      if(byName||hit) arts.push([g,n,m,href,hit]);
    }
  // ранжирование: точное совпадение -> начинается с -> содержит -> только вариант имени
  const rank=(n,hit)=>{const l=n.toLowerCase();
    if(hit)return 4; if(l===q)return 0; if(l.startsWith(q))return 1;
    return /(^|[\s(«"'-])/.test(l.charAt(Math.max(0,l.indexOf(q)-1))||" ")?2:3};
  arts.sort((a,b)=>rank(a[1],a[4])-rank(b[1],b[4])||a[1].length-b[1].length);
  if(arts.length){
    h+=`<div class="grp">Статьи${arts.length>300?` — показаны 300 из ${arts.length}`:""}</div>`;
    h+=arts.slice(0,300).map(([g,n,m,href,hit])=>`<a class="row" href="${BASE}${href}"><b>${mk(n)}</b>
      <i>${g.toLowerCase()} · ${m}</i>${hit?`<span class="sn">вариант имени: ${mk(hit)}</span>`:""}</a>`).join("");
  }
  // 2) разделы, где упомянуто
  const inCh=[];
  (typeof CH==="undefined"?[]:CH).forEach((c,i)=>{
    const plain=(c.t+" "+c.h+" "+(c.r||[]).map(x=>x[0]).join(" ")).replace(/<[^>]+>/g," ");
    if(plain.toLowerCase().includes(q)){
      const p=c.h.replace(/<[^>]+>/g," ").replace(/\s+/g," ");
      const k=p.toLowerCase().indexOf(q);
      inCh.push([i,c.t,k<0?p.slice(0,90):p.slice(Math.max(0,k-42),k+72)]);
    }
  });
  if(inCh.length){
    h+=`<div class="grp">Упоминается в разделах</div>`;
    h+=inCh.map(([i,t,sn])=>`<button class="row" data-jump="s${i}"><b>${mk(t)}</b>
      <i>${DOCNAME} · раздел ${String(i+1).padStart(2,"0")}</i><span class="sn">…${mk(sn)}…</span></button>`).join("");
  }
  box.innerHTML=h||`<div class="hint">Ничего не нашлось.</div>`;
}
renderMenu();

let menuOpen=false;
function toggleMenu(f){
  menuOpen=f===undefined?!menuOpen:f;
  $("menu").classList.toggle("on",menuOpen);
  document.body.classList.toggle("on-menu",menuOpen);
  document.body.style.overflow=menuOpen?"hidden":"";
  if(menuOpen) setTimeout(()=>$("gq").focus(),240); else {$("gq").value="";renderMenu()}
}
$("bMenu").onclick=()=>toggleMenu();
let gt;$("gq").addEventListener("input",e=>{clearTimeout(gt);gt=setTimeout(()=>renderMenu(e.target.value),140)});
$("tabs").addEventListener("click",e=>{
  const b=e.target.closest("[data-tab]");if(!b)return;
  tab=b.dataset.tab;
  [...$("tabs").children].forEach(x=>x.classList.toggle("on",x===b));
  $("gq").value="";renderMenu();
});
$("menuList").addEventListener("click",e=>{
  const j=e.target.closest("[data-jump]");
  if(j){toggleMenu(false);setTimeout(()=>jump(j.dataset.jump),260)}
});

/* ================= шторки ================= */
let openId=null;
function openSheet(id){openId=id;$(id).classList.add("on");
  /* у поиска скрима нет: подсветку в тексте должно быть видно */
  $("scrim").classList.toggle("on",id!=="shFind");
  if(id==="shFind")setTimeout(()=>$("lq").focus(),260)}
function closeSheet(){if(!openId)return;$(openId).classList.remove("on");$("scrim").classList.remove("on");openId=null}
$("bToc").onclick=()=>openSheet("shToc");
$("lClose").onclick=()=>{closeSheet();$("lq").blur()};
$("bFind").onclick=()=>openSheet("shFind");
$("scrim").onclick=closeSheet;
addEventListener("keydown",e=>{if(e.key==="Escape"){closeSheet();if(menuOpen)toggleMenu(false)}});

document.querySelectorAll("[data-grab]").forEach(g=>{
  const sh=$(g.dataset.grab);let y0=0,dy=0,on=false;
  const st=e=>{on=true;dy=0;y0=(e.touches?e.touches[0]:e).clientY;sh.classList.add("drag")};
  const up=sh.classList.contains("top");
  const mv=e=>{if(!on)return;
    const d=(e.touches?e.touches[0]:e).clientY-y0;
    dy=up?Math.min(0,d):Math.max(0,d);
    sh.style.transform=`translateY(${dy}px)`;if(e.cancelable)e.preventDefault()};
  const en=()=>{if(!on)return;on=false;sh.classList.remove("drag");sh.style.transform="";
    if(Math.abs(dy)>80){closeSheet();if(up)$("lq").blur()}};
  g.addEventListener("touchstart",st,{passive:true});
  g.addEventListener("touchmove",mv,{passive:false});
  g.addEventListener("touchend",en);
  g.addEventListener("mousedown",e=>{st(e);
    const m=ev=>mv(ev),u=()=>{en();removeEventListener("mousemove",m);removeEventListener("mouseup",u)};
    addEventListener("mousemove",m);addEventListener("mouseup",u)});
});

function jump(id){
  const el=document.getElementById(id);if(!el)return;
  /* дальше пары экранов — переходим мгновенно: плавная прокрутка заставляет
     движок разметить все пропущенные разделы и подвешивает страницу */
  const far=Math.abs(el.getBoundingClientRect().top)>innerHeight*2;
  el.scrollIntoView({block:"start",behavior:far?"auto":"smooth"});
}
$("tocBody").addEventListener("click",e=>{
  const r=e.target.closest("[data-to]");if(!r)return;
  closeSheet();setTimeout(()=>jump(r.dataset.to),200);
});

/* ================= рельса ================= */
const rail=$("rail"),line=$("railLine"),thumb=$("thumb"),pct=$("pct");
let anchors=[],RLtop=0,RLh=1,RAILtop=0,MAXH=1,dragging=false;

function measure(){
  const r=line.getBoundingClientRect(),rr=rail.getBoundingClientRect();
  RAILtop=rr.top; RLtop=r.top-rr.top; RLh=Math.max(1,r.height);
  MAXH=Math.max(1,document.documentElement.scrollHeight-innerHeight);
}
function layout(){
  measure();
  rail.querySelectorAll(".mark").forEach(m=>m.remove());
  const frag=document.createDocumentFragment();
  anchors=CH.map((c,i)=>{
    const el=document.getElementById("s"+i);
    const y=el.getBoundingClientRect().top+scrollY-70;
    const f=Math.min(1,Math.max(0,y/MAXH));
    const m=document.createElement("div");
    m.className="mark"; m.style.top=(RLtop+f*RLh)+"px";
    frag.appendChild(m);
    return {i,f,el:m,t:c.t,mk:false};
  });
  rail.appendChild(frag);
  paint();
}
function paint(){
  const f=Math.min(1,Math.max(0,scrollY/MAXH));
  thumb.style.transform="translateY("+(RLtop+f*RLh-19)+"px)";
  let near=null,best=1e9;
  for(const a of anchors){const d=Math.abs(a.f-f);if(d<best){best=d;near=a}}
  for(const a of anchors){
    const on=(a===near&&best<.045);
    if(a.mk!==on){a.mk=on;a.el.classList.toggle("near",on)}
  }
  return {f,near};
}
let ticking=false;
function tick(){
  if(ticking)return; ticking=true;
  requestAnimationFrame(()=>{ticking=false;paint()});
}
function labels(){
  const mid=innerHeight*.5;
  document.querySelectorAll("[data-p]").forEach(sp=>{
    const el=document.getElementById(sp.dataset.p); if(!el)return;
    const t=el.getBoundingClientRect().top<mid?"читаю":"";
    if(sp.textContent!==t) sp.textContent=t;
  });
}
function hidePct(){pct.classList.remove("on");thumb.classList.remove("grab")}

let pctTm,lblTm;
let actTm;
function railAct(){
  rail.classList.add("act");
  clearTimeout(actTm); actTm=setTimeout(()=>rail.classList.remove("act"),900);
}
addEventListener("scroll",()=>{
  tick(); railAct();
  if(!dragging&&pct.classList.contains("on")) hidePct();
  clearTimeout(lblTm); lblTm=setTimeout(labels,220);
},{passive:true});

let rzTm;
addEventListener("resize",()=>{clearTimeout(rzTm);rzTm=setTimeout(layout,150)});
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>setTimeout(layout,30));
addEventListener("load",()=>setTimeout(layout,50));
setTimeout(layout,80);

/* перетаскивание рельсы */
function railTo(cy){
  let f=(cy-RAILtop-RLtop)/RLh; f=Math.min(1,Math.max(0,f));
  let snap=null;
  for(const a of anchors) if(Math.abs(a.f-f)<.035) snap=a;
  if(snap) f=snap.f;
  scrollTo(0,f*MAXH);
  const st=paint();
  pct.style.top=Math.min(innerHeight-70,Math.max(80,cy-24))+"px";
  const lab=snap||st.near;
  pct.innerHTML=Math.round(f*100)+"%"+(lab?"<em>"+lab.t+"</em>":"");
}
let dY0=0,dMoved=false;
const dStart=e=>{
  dragging=true; dMoved=false; dY0=(e.touches?e.touches[0]:e).clientY;
  /* не перехватываем касание сразу: в мессенджере у правого края живёт
     системный жест «назад», а одиночный тап не должен швырять страницу */
};
const dMove=e=>{
  if(!dragging)return;
  const y=(e.touches?e.touches[0]:e).clientY;
  if(!dMoved){
    if(Math.abs(y-dY0)<6)return;
    dMoved=true; pct.classList.add("on"); thumb.classList.add("grab");
  }
  railTo(y);
  if(e.cancelable)e.preventDefault();
};
const dEnd=e=>{ if(!dragging)return;
  if(!dMoved&&e&&e.type!=="touchcancel") railTo(dY0);  /* тап — переход по месту */
  dragging=false; hidePct(); clearTimeout(pctTm); };
rail.addEventListener("touchstart",dStart,{passive:false});
rail.addEventListener("touchmove",dMove,{passive:false});
rail.addEventListener("touchend",dEnd);
rail.addEventListener("touchcancel",dEnd);
addEventListener("touchcancel",dEnd,{passive:true});
addEventListener("blur",dEnd);
document.addEventListener("visibilitychange",()=>{if(document.hidden)dEnd()});
rail.addEventListener("mousedown",e=>{dStart(e);
  const m=ev=>dMove(ev),u=()=>{dEnd();removeEventListener("mousemove",m);removeEventListener("mouseup",u)};
  addEventListener("mousemove",m);addEventListener("mouseup",u)});

/* ================= настройки ================= */
const thIcon=$("thIcon");
function setTheme(light,initial){
  document.body.classList.toggle("light",light);
  thIcon.textContent=light?"☀":"☾";
  try{localStorage.setItem("th2",light?"1":"0")}catch(e){}
  if(!initial) repaint();   /* на старте перекрашивать нечего: ещё ничего не нарисовано */
}
/* content-visibility:auto оставляет уже нарисованные куски статьи в старых цветах:
   стили пересчитаны, а пиксели прежние. Один кадр без пропуска отрисовки — и всё сходится. */
function repaint(){
  document.body.classList.add("repaint");
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.remove("repaint")));
}
let _l=false;
try{ _l=localStorage.getItem("th2")==="1"; }catch(e){}
setTheme(_l, true); setTimeout(layout,60);
$("bTheme").onclick=()=>setTheme(!document.body.classList.contains("light"));

/* ================= поиск внутри статьи ================= */
let hits=[],hi=-1;
function clearMarks(){
  art.querySelectorAll("mark").forEach(m=>{const p=m.parentNode;p.replaceChild(document.createTextNode(m.textContent),m);p.normalize()});
  hits=[];hi=-1;$("lcnt").textContent="";
}
function find(term){
  clearMarks();
  if(!term||term.length<2){$("lhint").textContent="Совпадения подсвечиваются прямо в тексте. Стрелками — к следующему.";return}
  const low=term.toLowerCase(),CAP=400;
  const w=document.createTreeWalker(art,NodeFilter.SHOW_TEXT),tg=[];
  let n;while(n=w.nextNode()){ if(n.nodeValue.toLowerCase().includes(low)) tg.push(n);
    if(tg.length>=CAP) break; }
  const capped=tg.length>=CAP;
  for(const t of tg){
    const parts=t.nodeValue.split(new RegExp("("+term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"));
    const f=document.createDocumentFragment();
    for(const p of parts){
      if(p.toLowerCase()===low){const m=document.createElement("mark");m.textContent=p;f.appendChild(m);hits.push(m)}
      else if(p) f.appendChild(document.createTextNode(p));
    }
    t.parentNode.replaceChild(f,t);
  }
  $("lcnt").textContent=hits.length?`0/${hits.length}`+(capped?"+":""):"нет";
  $("lhint").textContent=hits.length
    ?`Найдено ${hits.length}${capped?" (показаны первые)":""}. Шторку можно смахнуть вниз — подсветка останется.`
    :"Ничего не нашлось.";
  if(hits.length) step(1);
}
function step(d){
  if(!hits.length)return;
  if(hi>=0&&hits[hi])hits[hi].classList.remove("now");
  hi=(hi+d+hits.length)%hits.length;
  hits[hi].classList.add("now");
  const far=Math.abs(hits[hi].getBoundingClientRect().top)>innerHeight*2;
  hits[hi].scrollIntoView({block:"center",behavior:far?"auto":"smooth"});
  $("lcnt").textContent=`${hi+1}/${hits.length}`;
}
let lt;$("lq").addEventListener("input",e=>{clearTimeout(lt);lt=setTimeout(()=>find(e.target.value.trim()),180)});
$("lNext").onclick=()=>step(1);$("lPrev").onclick=()=>step(-1);
$("lq").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();step(e.shiftKey?-1:1)}});

/* переход по якорю из адреса: разделы собираются скриптом, поэтому доводим сами */
function hashGo(){
  const h=location.hash.slice(1); if(!h)return;
  let el=null;
  try{ el=document.getElementById(h)||document.querySelector('[id="'+CSS.escape(h)+'"]'); }catch(e){}
  if(!el)return;
  /* якорь стоит перед заголовком — прокручиваем к самому заголовку, у него есть отступ */
  /* перед заголовком стоит несколько якорей подряд — идём вперёд до самого заголовка:
     у него есть отступ под липкую шапку, у якоря его нет */
  let t=el;
  for(let i=0;i<6&&t.nextElementSibling;i++){
    t=t.nextElementSibling;
    if(/^H[23]$/.test(t.tagName))break;
  }
  (/^H[23]$/.test(t.tagName)?t:el).scrollIntoView({block:"start"});
}
addEventListener("load",()=>setTimeout(hashGo,60));
addEventListener("hashchange",hashGo);
