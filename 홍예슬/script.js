'use strict';
var storyIntro=document.querySelector('#story-intro');
var storyScenes=Array.from(document.querySelectorAll('.story-scene'));
var storyDots=Array.from(document.querySelectorAll('.story-progress i'));
var storyIndex=0;
function showStoryScene(nextIndex){
 if(nextIndex<0)return;
 if(nextIndex>=storyScenes.length){closeStory();return;}
 storyScenes.forEach(function(scene,index){scene.classList.remove('active','leaving');if(index<nextIndex)scene.classList.add('leaving');});
 storyIndex=nextIndex;
 storyScenes[storyIndex].classList.add('active');
 storyDots.forEach(function(dot,index){dot.classList.toggle('done',index<=storyIndex);});
 document.querySelector('#story-prev').style.visibility=storyIndex===0?'hidden':'visible';
 document.querySelector('#story-next').innerHTML=storyIndex===storyScenes.length-1?'City Debugger 시작 <span>→</span>':'탭하여 계속 <span>→</span>';
}
function closeStory(){storyIntro.classList.add('closed');document.body.classList.remove('story-open');setTimeout(function(){storyIntro.hidden=true;},750);}
document.body.classList.add('story-open');
document.querySelector('#story-next').addEventListener('click',function(){showStoryScene(storyIndex+1);});
document.querySelector('#story-prev').addEventListener('click',function(){showStoryScene(storyIndex-1);});
document.querySelector('#story-skip').addEventListener('click',closeStory);
storyScenes.forEach(function(scene){scene.addEventListener('click',function(event){if(!event.target.closest('button'))showStoryScene(storyIndex+1);});});
document.addEventListener('keydown',function(event){if(storyIntro.hidden)return;if(event.key==='ArrowRight'||event.key==='Enter'||event.key===' '){event.preventDefault();showStoryScene(storyIndex+1);}if(event.key==='ArrowLeft'){event.preventDefault();showStoryScene(storyIndex-1);}if(event.key==='Escape')closeStory();});
showStoryScene(0);
var STORAGE_KEY='cityDebuggerData_v2';
var defaults={
 compatibility:[
  {id:'c1',icon:'♿',name:'Wheelchair',score:95,desc:'주요 동선의 단차·경사로 호환성'},
  {id:'c2',icon:'👶',name:'Stroller',score:91,desc:'유모차 연속 이동 경로 지원'},
  {id:'c3',icon:'🚲',name:'Bicycle',score:83,desc:'자전거 진입·보관 경로 지원'}],
 bugs:[],
 simPatches:{}
};
function copy(value){return JSON.parse(JSON.stringify(value));}
function load(){try{var saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!saved)return copy(defaults);return {compatibility:(saved.compatibility||[]).filter(function(item){return item.id!=='c4'&&item.id!=='c5';}),bugs:saved.bugs||[],simPatches:saved.simPatches||{}};}catch(error){return copy(defaults);}}
var data=load();
function $(selector){return document.querySelector(selector);}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
function makeId(prefix){return prefix+Date.now()+Math.random().toString(16).slice(2);}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
function required(values,message){var valid=values.every(function(value){return String(value).trim()!=='';});if(!valid)alert(message||'모든 입력값을 입력해주세요.');return valid;}

// ── CITY README.md / Changelog ─────────────────────────────────────
var README_PATCH_LOG=[
 {version:'v1.3.0',date:'2026-07-15',title:'신도림A구역 엘리베이터 패치',severity:'BLOCKER',resolved:2,changes:['신도림A역 B출구 엘리베이터 신규 설치','A구역 복지관 정문 경사로 보수'],bugIds:['B01','B03']},
 {version:'v1.2.3',date:'2026-06-28',title:'녹천B구역 접근로 개선',severity:'CRITICAL',resolved:3,changes:['녹천B역 3번 출구 수직 리프트 설치','B구역 주민센터 화장실 문 폭 확장 (60cm → 90cm)','B구역 약국 앞 이동식 경사판 지급'],bugIds:['B07','B09','B10']},
 {version:'v1.2.0',date:'2026-05-10',title:'한솔C구역 전통시장 진입로 개선',severity:'MAJOR',resolved:2,changes:['C구역 재래시장 입구 고정형 경사로 설치','C구역 지하상가 연결부 단차 제거'],bugIds:['B11','B13']},
 {version:'v1.1.0',date:'2026-03-22',title:'미성E구역 신축 접근성 기준 강화',severity:'MAJOR',resolved:1,changes:['E구역 신축 건물 접근성 설계 기준 적용 의무화','단지 내 소공원 경사로 추가'],bugIds:['B21']},
 {version:'v1.0.0',date:'2026-01-01',title:'City Debugger 서비스 시작',severity:'MINOR',resolved:0,changes:['시민 버그 제보 시스템 구축','규칙 기반 심각도 분류 엔진 v1.0 배포 (AI 판단 배제)','25개 초기 버그 데이터 수집 완료','BLOCKER 여정 그래프 탐색 엔진 가동'],bugIds:[]}
];
var README_SEED_COUNTS={BLOCKER:2,CRITICAL:8,MAJOR:9,MINOR:6};
var SEVERITY_BAR_COLOR={BLOCKER:'var(--purple)',CRITICAL:'var(--red)',MAJOR:'var(--orange)',MINOR:'var(--blue)'};

function readmeBugCounts(){
 var counts={BLOCKER:README_SEED_COUNTS.BLOCKER,CRITICAL:README_SEED_COUNTS.CRITICAL,MAJOR:README_SEED_COUNTS.MAJOR,MINOR:README_SEED_COUNTS.MINOR};
 getAllPatchBugs().forEach(function(bug){if(!data.simPatches[bug.id]&&counts[bug.severity]!==undefined)counts[bug.severity]++;});
 return counts;
}

function renderReadme(){
 var counts=readmeBugCounts();
 var totalBugs=counts.BLOCKER+counts.CRITICAL+counts.MAJOR+counts.MINOR;
 var barMax=Math.max(counts.BLOCKER,counts.CRITICAL,counts.MAJOR,counts.MINOR,1);
 var fullChangelog=getFullChangelog();
 var totalResolved=fullChangelog.reduce(function(s,p){return s+p.resolved;},0);
 var simResolved=Object.keys(data.simPatches).length;

 var html='';
 html+='<p class="md-h1"># City Debugger</p>';
 html+='<p class="md-quote">&gt; 도시는 아직 개발 중이다. 우리 모두가 도시의 개발자다.</p>';

 html+='<p class="md-h2">## Overview</p>';
 html+='<p class="md-body">A civic bug tracker for urban accessibility issues.<br>교통약자를 <span class="md-code">피해자</span>가 아닌 <span class="md-code">버그를 발견하는 디버거</span>로 재정의합니다.</p>';

 html+='<p class="md-h2">## Version</p>';
 html+='<p class="md-kv"><b>version</b>: <span>1.3.0</span></p>';
 html+='<p class="md-kv"><b>build</b>: <span>2026.07.18</span></p>';
 html+='<p class="md-kv"><b>status</b>: <span class="status-dot">● ACTIVE DEVELOPMENT</span></p>';
 html+='<p class="md-kv"><b>patches</b>: <span>'+totalResolved+' bugs resolved</span>'+(simResolved>0?' <small style="color:var(--green)">(+'+simResolved+' simulation)</small>':'')+'</p>';

 html+='<p class="md-h2">## Known Bugs</p>';
 ['BLOCKER','CRITICAL','MAJOR','MINOR'].forEach(function(sev){
  var n=counts[sev],pct=Math.round(n/barMax*100);
  html+='<div class="bug-bar-row"><span class="lbl" style="color:'+SEVERITY_BAR_COLOR[sev]+'">'+sev+'</span><div class="bar"><i style="width:'+pct+'%;background:'+SEVERITY_BAR_COLOR[sev]+'"></i></div><span class="num">'+n+'</span></div>';
 });
 html+='<p style="color:#5b6885;font-size:11px;margin-top:6px">Total: '+totalBugs+' open issues</p>';

 html+='<p class="md-h2">## TODO</p>';
 html+='<div class="md-todo">';
 html+='<p class="done">- [x] 신도림A역 엘리베이터 설치 (v1.3.0)</p>';
 html+='<p class="done">- [x] 녹천B구역 접근로 개선 (v1.2.3)</p>';
 html+='<p class="pending">- [ ] 대림역 환승통로 엘리베이터 <span class="md-code">BLOCKER</span></p>';
 html+='<p class="pending">- [ ] 영등포역 접근로 개선 <span class="md-code">CRITICAL</span></p>';
 html+='<p class="pending">- [ ] 하늘F구역 전통시장 경사로 <span class="md-code">CRITICAL</span></p>';
 html+='</div>';

 html+='<p class="md-h2">## Contributors</p>';
 html+='<div class="md-contrib">';
 html+='<p><b>@citizens</b> — '+totalBugs+' bug reports filed</p>';
 html+='<p><b>@severity_engine</b> — rule-based classifier, no AI bias</p>';
 html+='<p><b>@graph_tracer</b> — BFS/DFS route analyzer</p>';
 html+='</div>';

 html+='<p class="md-h2">## License</p>';
 html+='<p style="color:#5b6885;font-size:11px">Public Domain — 도시는 모두의 것입니다.</p>';

 html+='<div class="md-footer"><p>$ git log --oneline | head -3</p>';
 fullChangelog.slice(0,3).forEach(function(p){
  html+='<p><span class="ver">'+p.version.slice(1).replace(/\./g,'')+'</span> '+escapeHTML(p.title)+'</p>';
 });
 html+='</div>';

 $('#readme-content').innerHTML=html;
}

var changelogExpanded='v1.3.0';
function renderChangelog(){
 $('#changelog-timeline').innerHTML='<div class="cl-line"></div>'+getFullChangelog().map(function(log,idx){
  var isOpen=changelogExpanded===log.version,isLatest=idx===0;
  var body=isOpen?'<div class="cl-body">'+log.changes.map(function(c){return '<p class="cl-change">'+escapeHTML(c)+'</p>';}).join('')+
   (log.resolved>0?'<p class="cl-resolved">📋 관련 제보 '+log.resolved+'건 해결'+(log.bugIds.length?' ('+log.bugIds.map(function(id){return '#'+id;}).join(', ')+')':'')+'</p>':'')+
   '</div>':'';
  return '<div class="cl-item"><span class="cl-dot'+(isLatest?' latest':'')+'"><i></i></span>'+
   '<button type="button" class="cl-head" data-changelog="'+log.version+'">'+
   '<span class="cl-arrow">'+(isOpen?'▲':'▼')+'</span>'+
   '<div class="cl-top"><span class="cl-ver">['+log.version+']</span><span class="cl-date">'+log.date+'</span>'+
   (isLatest?'<span class="cl-latest-badge">LATEST</span>':'')+
   '<span class="badge '+log.severity.toLowerCase()+'">'+log.severity+'</span></div>'+
   '<p class="cl-title">'+escapeHTML(log.title)+'</p>'+
   '</button>'+body+'</div>';
 }).join('');
}
$('#changelog-timeline').addEventListener('click',function(event){
 var btn=event.target.closest('[data-changelog]');
 if(!btn)return;
 changelogExpanded=changelogExpanded===btn.dataset.changelog?null:btn.dataset.changelog;
 renderChangelog();
});
function renderCompatibility(){
 $('#compat-list').innerHTML=data.compatibility.map(function(item){
  return '<article class="compat-card"><button class="delete" data-delete="compatibility" data-id="'+item.id+'" aria-label="'+escapeHTML(item.name)+' 삭제">삭제</button><span class="icon">'+escapeHTML(item.icon)+'</span><h3>'+escapeHTML(item.name)+'<strong>'+item.score+'%</strong></h3><p>'+escapeHTML(item.desc)+'</p><div class="bar" role="img" aria-label="'+escapeHTML(item.name)+' 호환성 '+item.score+' 퍼센트"><i style="width:'+item.score+'%"></i></div></article>';
 }).join('');
}
function renderHeatmap(){
 var groups={};
 data.bugs.forEach(function(bug){
  if(!groups[bug.location])groups[bug.location]={place:bug.location,count:0,types:{}};
  groups[bug.location].count++;
  groups[bug.location].types[bug.type]=(groups[bug.location].types[bug.type]||0)+1;
 });
 var list=Object.values(groups).sort(function(a,b){return b.count-a.count;});
 var max=Math.max.apply(null,[1].concat(list.map(function(g){return g.count;})));
 $('#heat-list').innerHTML=list.map(function(g){
  var topType=Object.keys(g.types).sort(function(a,b){return g.types[b]-g.types[a];})[0];
  return '<article class="heat-item"><div class="heat-head"><b>'+escapeHTML(g.place)+'</b><strong>'+g.count+'건 제보</strong></div><p>주요 유형: '+escapeHTML(topType)+'</p><div class="bar" role="img" aria-label="'+g.count+'건 제보"><i style="width:'+Math.round(g.count/max*100)+'%"></i></div></article>';
 }).join('')||'<p class="help">아직 제보된 버그가 없어 히트맵 데이터가 없습니다. 아래 버그 제보에서 첫 버그를 등록해보세요.</p>';
}
function renderBugs(){
 $('#issue-count').textContent=data.bugs.length+' ISSUES';
 $('#bug-list').innerHTML=data.bugs.map(function(bug){
  return '<article class="panel log-card '+bug.severity+'"><div class="log-head"><span class="badge '+bug.severity.toLowerCase()+'">'+bug.severity+'</span><h3>'+escapeHTML(bug.location)+'</h3><time>'+escapeHTML(bug.date)+'</time></div><p class="log-meta"><span>'+escapeHTML(bug.line)+'</span><span>'+escapeHTML(bug.type)+'</span><span>재현 '+(bug.reproductions||0)+'회</span></p><p>'+escapeHTML(bug.detail)+'</p><p class="reason"><b>AI 판단 근거:</b> '+escapeHTML(bug.reason)+'</p><div class="log-actions"><button data-reproduce="'+bug.id+'">나도 겪었어요 · +1</button><button class="delete" data-delete="bugs" data-id="'+bug.id+'">삭제</button></div></article>';
 }).join('')||'<div class="panel empty"><p>아직 제보된 버그가 없습니다.<br>첫 번째 도시 버그를 기록해주세요.</p></div>';
 renderReadme();
 renderHeatmap();
}
function renderAll(){renderReadme();renderChangelog();renderCompatibility();renderHeatmap();renderBugs();renderPatch();}

document.querySelectorAll('[data-toggle]').forEach(function(button){button.addEventListener('click',function(){var form=$('#'+button.dataset.toggle);form.hidden=!form.hidden;});});
$('#compat-form').addEventListener('submit',function(event){event.preventDefault();var icon=$('#compat-icon').value.trim(),name=$('#compat-name').value.trim(),score=$('#compat-score').value,desc=$('#compat-desc').value.trim();if(!required([icon,name,score,desc],'호환성 항목의 모든 값을 입력해주세요.'))return;if(Number(score)<0||Number(score)>100){alert('점수는 0부터 100 사이로 입력해주세요.');return;}data.compatibility.push({id:makeId('c'),icon:icon,name:name,score:Number(score),desc:desc});save();renderCompatibility();event.target.reset();event.target.hidden=true;});
document.body.addEventListener('click',function(event){
 var remove=event.target.closest('[data-delete]');
 if(remove){if(!confirm('이 항목을 삭제할까요?'))return;data[remove.dataset.delete]=data[remove.dataset.delete].filter(function(item){return item.id!==remove.dataset.id;});save();renderAll();return;}
 var reproduce=event.target.closest('[data-reproduce]');
 if(reproduce){var bug=data.bugs.find(function(item){return item.id===reproduce.dataset.reproduce;});if(bug){bug.reproductions=(bug.reproductions||0)+1;save();renderBugs();}}
});

var STATIONS={
 A:{id:'A',name:'신도림역',line:1,hasElevator:true,x:60,y:80},
 B:{id:'B',name:'구로역',line:1,hasElevator:true,x:175,y:80},
 C1:{id:'C1',name:'대림역',line:1,hasElevator:true,x:290,y:80,isTransfer:true},
 D:{id:'D',name:'영등포역',line:1,hasElevator:false,x:405,y:80},
 E:{id:'E',name:'여의도역',line:1,hasElevator:true,x:520,y:80},
 F:{id:'F',name:'합정역',line:2,hasElevator:true,x:60,y:210},
 G:{id:'G',name:'홍대입구역',line:2,hasElevator:true,x:175,y:210},
 C2:{id:'C2',name:'대림역',line:2,hasElevator:true,x:290,y:210,isTransfer:true},
 H:{id:'H',name:'노들역',line:2,hasElevator:true,x:405,y:210}
};
var EDGES=[
 {id:'e1',from:'A',to:'B',line:1},
 {id:'e2',from:'B',to:'C1',line:1},
 {id:'e3',from:'C1',to:'D',line:1},
 {id:'e4',from:'D',to:'E',line:1},
 {id:'e5',from:'F',to:'G',line:2},
 {id:'e6',from:'G',to:'C2',line:2},
 {id:'e7',from:'C2',to:'H',line:2},
 {id:'t1',from:'C1',to:'C2',line:'transfer',isTransfer:true}
];
var LINE_COLOR={1:'#3b82f6',2:'#22c55e',transfer:'#6b7280'};
var LINE_LABEL={1:'1호선',2:'2호선'};
var LINE_LABEL_COLOR={'1호선':LINE_COLOR[1],'2호선':LINE_COLOR[2]};
var stationLines={};
Object.values(STATIONS).forEach(function(s){
 if(!stationLines[s.name])stationLines[s.name]=[];
 var label=LINE_LABEL[s.line];
 if(stationLines[s.name].indexOf(label)===-1)stationLines[s.name].push(label);
});
var risks=['엘리베이터 또는 리프트 이용 불가','출입문·개찰구 이용이 어려움','역무원이나 경비원을 찾을 수 없음','환승 통로가 막혀 있음','사람이 너무 많아 이동이 어려움','휠체어·유모차 이동 경로를 모르겠음'];
var selection={station:'',line:'',risk:''};
function renderStationMap(){
 var edgesSVG=EDGES.map(function(edge){
  var s=STATIONS[edge.from],e=STATIONS[edge.to];
  var stroke=edge.isTransfer?LINE_COLOR.transfer:LINE_COLOR[edge.line];
  return '<line x1="'+s.x+'" y1="'+s.y+'" x2="'+e.x+'" y2="'+e.y+'" stroke="'+stroke+'" stroke-width="'+(edge.isTransfer?2:3)+'" stroke-dasharray="'+(edge.isTransfer?'6 4':'none')+'" stroke-linecap="round"/>'+
   (edge.isTransfer?'<text x="'+((s.x+e.x)/2)+'" y="'+((s.y+e.y)/2-8)+'" font-size="12" text-anchor="middle">⚡</text>':'');
 }).join('');
 var nodesSVG=Object.values(STATIONS).map(function(s){
  var active=selection.station===s.name;
  var fill=active?'#28447b':'#11192c',stroke=active?'#5adfff':LINE_COLOR[s.line],sw=active?4:2;
  var icon=s.hasElevator?s.id.replace('C1','C').replace('C2','C'):'❌';
  var labelY=s.y<150?s.y-26:s.y+34,transferLabelY=s.y<150?s.y-14:s.y+45;
  return '<g class="station-node" data-station-name="'+s.name+'" tabindex="0" role="button" aria-label="'+s.name+'">'+
   '<circle cx="'+s.x+'" cy="'+s.y+'" r="20" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<text x="'+s.x+'" y="'+(s.y+5)+'" text-anchor="middle" font-size="12" font-family="monospace" font-weight="bold" fill="#d1fae5">'+icon+'</text>'+
   '<text x="'+s.x+'" y="'+labelY+'" text-anchor="middle" font-size="10" font-family="monospace" fill="'+(active?'#5adfff':'#9ca3af')+'">'+s.name+'</text>'+
   (s.isTransfer?'<text x="'+s.x+'" y="'+transferLabelY+'" text-anchor="middle" font-size="9" fill="#a78bfa">환승</text>':'')+
   '</g>';
 }).join('');
 $('#station-map').innerHTML='<svg viewBox="0 0 580 300" class="subway-svg">'+
  '<text x="12" y="70" font-size="11" font-family="monospace" fill="'+LINE_COLOR[1]+'">1호선</text>'+
  '<text x="12" y="200" font-size="11" font-family="monospace" fill="'+LINE_COLOR[2]+'">2호선</text>'+
  edgesSVG+nodesSVG+'</svg>';
}
renderStationMap();
$('#risk-list').innerHTML=risks.map(function(risk,index){return '<button class="risk" type="button" data-risk="'+risk+'">'+String(index+1).padStart(2,'0')+' · '+risk+'</button>';}).join('');
function updateStep(){var count=[selection.station,selection.line,selection.risk].filter(Boolean).length;$('#step').textContent='STEP '+Math.min(count+1,3)+' / 3';}
function selectStation(name){
 selection.station=name;selection.line='';
 renderStationMap();
 $('#station-help').textContent='현재 위치: '+selection.station;
 $('#line-list').innerHTML=stationLines[selection.station].map(function(line){var c=LINE_LABEL_COLOR[line];return '<button type="button" class="line-chip" data-line="'+line+'" style="border-color:'+c+'66;color:'+c+'"><i class="line-dot" style="background:'+c+'"></i>'+line+'</button>';}).join('');
 updateStep();recommend();
}
$('#station-map').addEventListener('click',function(event){var node=event.target.closest('[data-station-name]');if(!node)return;selectStation(node.dataset.stationName);});
$('#station-map').addEventListener('keydown',function(event){if(event.key!=='Enter'&&event.key!==' ')return;var node=event.target.closest('[data-station-name]');if(!node)return;event.preventDefault();selectStation(node.dataset.stationName);});
$('#line-list').addEventListener('click',function(event){var button=event.target.closest('[data-line]');if(!button)return;selection.line=button.dataset.line;$('#line-list').querySelectorAll('button').forEach(function(item){item.classList.toggle('active',item===button);});updateStep();recommend();});
$('#risk-list').addEventListener('click',function(event){var button=event.target.closest('[data-risk]');if(!button)return;selection.risk=button.dataset.risk;$('#risk-list').querySelectorAll('button').forEach(function(item){item.classList.toggle('active',item===button);});updateStep();recommend();});
var routes={
 '신도림역':{'1호선':'구로역 방향 저상 통로와 엘리베이터 동선 이용'},
 '구로역':{'1호선':'신도림역 또는 대림역 방향 엘리베이터 동선 확인'},
 '대림역':{'1호선':'2호선 환승 통로가 막힌 경우 지상 출구를 통한 우회 이용','2호선':'1호선 환승 통로 대신 지상 경유 우회 경로 이용'},
 '영등포역':{'1호선':'역 자체 엘리베이터가 없어 여의도역 또는 대림역에서 대체 경로 이용'},
 '여의도역':{'1호선':'인근 저상 출입구 또는 대림역 방향 우회'},
 '합정역':{'2호선':'홍대입구역 방향 엘리베이터 동선 이용'},
 '홍대입구역':{'2호선':'합정역 또는 대림역 방향 대체 동선 이용'},
 '노들역':{'2호선':'대림역 방향 엘리베이터 동선 이용'}};
function recommend(){
 if(!selection.station||!selection.line||!selection.risk)return;
 var critical=/이용 불가|막혀/.test(selection.risk),major=/사람이 너무|개찰구/.test(selection.risk),severity=critical?'CRITICAL':major?'MAJOR':'MINOR';
 var first=selection.risk.indexOf('엘리베이터')>-1?'운행 상태 안내판과 가까운 대체 엘리베이터 위치':selection.risk.indexOf('역무원')>-1?'비상 호출 버튼과 안내 전화 위치':selection.risk.indexOf('사람')>-1?'혼잡이 적은 출구와 다음 열차 운행 간격':'접근 가능한 연속 이동 경로와 안내 표지';
 $('#recommendation').innerHTML='<div class="ai-title"><span>AI</span><div><small>규칙 매칭 완료</small><h3>AI 해결 추천</h3></div></div><div class="result-meta"><div><small>선택 역</small><b>'+selection.station+'</b></div><div><small>호선</small><b>'+selection.line+'</b></div><div><small>심각도</small><span class="badge '+severity.toLowerCase()+'">'+severity+'</span></div></div><div class="result-block"><h4>먼저 확인할 정보</h4><p>'+first+'를 먼저 확인하세요.</p></div><div class="result-block"><h4>추천 대체 경로</h4><p>'+routes[selection.station][selection.line]+'을 권장합니다.</p></div><div class="result-block"><h4>행동 순서</h4><ol><li>통행을 방해하지 않는 가까운 안전 대기 지점으로 이동합니다.</li><li>다른 엘리베이터·경사로·넓은 개찰구를 확인합니다.</li><li>같은 역에서 어렵다면 제안된 대체 호선을 이용합니다.</li><li>호출 버튼이나 안내 전화로 현재 위치를 알립니다.</li></ol></div><div class="result-block safety"><h4>안전 주의사항</h4><p>계단이나 에스컬레이터에서 무리하게 이동하거나 이동 보조기기를 혼자 들어 올리지 마세요.</p></div>';
}

var severityRules={
 '계단만 존재함':['CRITICAL','휠체어, 유모차, 캐리어 이용자가 독립적으로 이동할 수 없는 구조입니다.'],
 '엘리베이터 고장':['CRITICAL','휠체어, 유모차, 캐리어 이용자의 수직 이동이 차단되는 상황입니다.'],
 '개찰구가 좁음':['MAJOR','일부 사용자가 통과하기 어렵고 혼잡 시 위험이 커질 수 있습니다.'],
 '혼잡으로 이동 어려움':['MAJOR','일부 사용자가 통과하기 어렵고 혼잡 시 위험이 커질 수 있습니다.'],
 '짧은 계단 2~3개 존재':['MINOR','완전한 이동 차단은 아니지만 특정 사용자에게 불편과 위험을 만듭니다.'],
 '안내 표지판 부족':['MINOR','완전한 이동 차단은 아니지만 특정 사용자에게 불편과 위험을 만듭니다.']};
$('#bug-form').addEventListener('submit',function(event){
 event.preventDefault();var location=$('#bug-location').value.trim(),line=$('#bug-line').value,type=$('#bug-type').value,detail=$('#bug-detail').value.trim();
 if(!required([location,line,type,detail],'버그 리포트의 모든 값을 입력해주세요.'))return;
 var rule=severityRules[type],date=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 data.bugs.unshift({id:makeId('b'),location:location,line:line,type:type,detail:detail,severity:rule[0],reason:rule[1],date:date,reproductions:0});
 save();renderBugs();renderPatch();event.target.reset();$('#logs').scrollIntoView({behavior:'smooth'});alert(rule[0]+' 심각도로 버그가 등록되었습니다.');
});

// ── 패치 제안 ─────────────────────────────────────────────────────────
var PATCH_PLANS={
 threshold:[
  {id:'th1',title:'이동식 경사판 설치',difficulty:1,cost:'30~50만원',weeks:1,effect:'MINOR → 해결',score:10},
  {id:'th2',title:'고무 경사로 부착',difficulty:1,cost:'5~15만원',weeks:1,effect:'MINOR → 해결',score:8},
  {id:'th3',title:'콘크리트 경사로 시공',difficulty:3,cost:'100~250만원',weeks:3,effect:'MAJOR → 해결',score:25},
  {id:'th4',title:'자동 접이식 램프 시스템',difficulty:4,cost:'300~600만원',weeks:6,effect:'MAJOR → 완전 해결',score:35}],
 stairs:[
  {id:'st1',title:'접이식 휴대용 경사로',difficulty:1,cost:'50~100만원',weeks:1,effect:'MAJOR → 임시 해결',score:15},
  {id:'st2',title:'고정형 경사로 시공',difficulty:3,cost:'150~350만원',weeks:3,effect:'MAJOR → 해결',score:28},
  {id:'st3',title:'수직 리프트 설치',difficulty:4,cost:'500~900만원',weeks:8,effect:'CRITICAL → 해결',score:42},
  {id:'st4',title:'엘리베이터 신규 설치',difficulty:5,cost:'1,500만원~',weeks:24,effect:'CRITICAL → 완전 해결',score:55}],
 elevator:[
  {id:'el1',title:'긴급 수리 (단순 고장)',difficulty:1,cost:'30~80만원',weeks:1,effect:'MAJOR → 해결',score:15},
  {id:'el2',title:'구동 시스템 수리',difficulty:2,cost:'80~250만원',weeks:2,effect:'MAJOR → 해결',score:22},
  {id:'el3',title:'제어반 전면 교체',difficulty:3,cost:'250~600만원',weeks:4,effect:'CRITICAL → 해결',score:35},
  {id:'el4',title:'엘리베이터 전면 교체',difficulty:5,cost:'3,000만원~',weeks:12,effect:'CRITICAL → 완전 해결',score:50}],
 doorWidth:[
  {id:'dw1',title:'도어 스토퍼 최대 개방',difficulty:1,cost:'0~5만원',weeks:1,effect:'MINOR → 해결',score:8},
  {id:'dw2',title:'문짝 교체 (폭 확장)',difficulty:2,cost:'50~120만원',weeks:2,effect:'MAJOR → 해결',score:22},
  {id:'dw3',title:'자동 슬라이딩 도어 교체',difficulty:3,cost:'200~450만원',weeks:3,effect:'CRITICAL → 해결',score:35},
  {id:'dw4',title:'벽체 개구부 확장 공사',difficulty:5,cost:'500~1,200만원',weeks:6,effect:'CRITICAL → 완전 해결',score:48}],
 crowd:[
  {id:'cw1',title:'혼잡 시간대 안전요원 배치',difficulty:1,cost:'20~40만원',weeks:1,effect:'MAJOR → 임시 해결',score:12},
  {id:'cw2',title:'바닥 유도선·동선 분리 표지 설치',difficulty:2,cost:'60~120만원',weeks:2,effect:'MAJOR → 해결',score:22},
  {id:'cw3',title:'실시간 혼잡도 안내 시스템 구축',difficulty:3,cost:'200~350만원',weeks:4,effect:'MAJOR → 해결',score:30},
  {id:'cw4',title:'병목 구간 통로 확장 공사',difficulty:5,cost:'500~900만원',weeks:10,effect:'MAJOR → 완전 해결',score:45}],
 signage:[
  {id:'sg1',title:'임시 안내판 부착',difficulty:1,cost:'5~15만원',weeks:1,effect:'MINOR → 해결',score:8},
  {id:'sg2',title:'점자블록·촉지도 설치',difficulty:2,cost:'50~100만원',weeks:2,effect:'MINOR → 완전 해결',score:16},
  {id:'sg3',title:'음성 안내 시스템 연동',difficulty:3,cost:'150~300만원',weeks:3,effect:'MINOR → 완전 해결',score:24},
  {id:'sg4',title:'통합 디지털 사이니지 구축',difficulty:4,cost:'400~700만원',weeks:5,effect:'MINOR → 완전 해결',score:32}]
};
var DIFFICULTY_LABEL=['','★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★'];
var PATCH_TYPE_LABEL={threshold:'턱·단차',stairs:'계단',elevator:'엘리베이터 고장',doorWidth:'문폭 부족',crowd:'혼잡',signage:'안내 표지판 부족'};
var SEVERITY_EMOJI={MINOR:'🟡',MAJOR:'🟠',CRITICAL:'🔴',BLOCKER:'🚫'};
var SEVERITY_DESC={MINOR:'불편하지만 우회 가능',MAJOR:'우회 가능하나 큰 불편',CRITICAL:'진입 불가, 우회 비용 큼',BLOCKER:'여정 전체 완주 불가'};
var PATCH_SEED_BUGS=[
 {id:'psb1',location:'신도림역 B출구',type:'elevator',severity:'CRITICAL',reportedAt:'2026-07-10'},
 {id:'psb2',location:'홍대입구역 2번 출구 계단',type:'stairs',severity:'MAJOR',reportedAt:'2026-07-11'},
 {id:'psb3',location:'영등포구청 정문 입구',type:'threshold',severity:'MINOR',reportedAt:'2026-07-12'},
 {id:'psb4',location:'구로역 화장실 입구',type:'doorWidth',severity:'MAJOR',reportedAt:'2026-07-13'},
 {id:'psb5',location:'대림역 1·2호선 환승 계단',type:'stairs',severity:'CRITICAL',reportedAt:'2026-07-14'},
 {id:'psb6',location:'여의도역 1번 출구 단차',type:'threshold',severity:'MAJOR',reportedAt:'2026-07-15'}
];
var USER_TYPE_MAP={
 '계단만 존재함':'stairs',
 '짧은 계단 2~3개 존재':'stairs',
 '엘리베이터 고장':'elevator',
 '개찰구가 좁음':'doorWidth',
 '혼잡으로 이동 어려움':'crowd',
 '안내 표지판 부족':'signage'
};
var currentPatchBugId=null;
var patchShowAfter=false;

function getAllPatchBugs(){
 var userBugs=data.bugs.filter(function(b){return USER_TYPE_MAP[b.type];}).map(function(b){
  return {id:b.id,location:b.location,type:USER_TYPE_MAP[b.type],severity:b.severity,reportedAt:b.date};
 });
 return PATCH_SEED_BUGS.concat(userBugs);
}

// ── 패치 ↔ Changelog ↔ Known Bugs 연동 ─────────────────────────────
function parseVersion(v){return v.replace(/^v/,'').split('.').map(Number);}
function versionToStr(arr){return 'v'+arr.join('.');}
function getLatestVersion(){
 var versions=README_PATCH_LOG.map(function(p){return p.version;});
 Object.keys(data.simPatches).forEach(function(id){if(data.simPatches[id].version)versions.push(data.simPatches[id].version);});
 return versions.map(parseVersion).reduce(function(max,v){
  if(!max)return v;
  if(v[0]!==max[0])return v[0]>max[0]?v:max;
  if(v[1]!==max[1])return v[1]>max[1]?v:max;
  return v[2]>max[2]?v:max;
 },null);
}
function nextVersion(){var v=getLatestVersion();v[2]++;return versionToStr(v);}
function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function buildPatchMeta(bug,plan,planId,score){
 var related=getAllPatchBugs().filter(function(b){return b.location===bug.location&&b.type===bug.type;});
 var typeLabel=PATCH_TYPE_LABEL[bug.type]||bug.type;
 return {
  planId:planId,score:score,
  version:nextVersion(),
  date:isoDate(new Date()),
  title:bug.location+' '+typeLabel+' → '+(plan?plan.title:'패치')+' 완료',
  severity:bug.severity,
  resolved:related.length,
  bugIds:related.map(function(b){return b.id;})
 };
}
function ensureSimPatchMeta(){
 var migrated=false;
 Object.keys(data.simPatches).forEach(function(bugId){
  var p=data.simPatches[bugId];
  if(p.version)return;
  var bug=getAllPatchBugs().filter(function(b){return b.id===bugId;})[0];
  if(!bug){delete data.simPatches[bugId];migrated=true;return;}
  var plan=(PATCH_PLANS[bug.type]||[]).filter(function(pl){return pl.id===p.planId;})[0];
  data.simPatches[bugId]=buildPatchMeta(bug,plan,p.planId,p.score);
  migrated=true;
 });
 if(migrated)save();
}
function getFullChangelog(){
 ensureSimPatchMeta();
 var dynamic=Object.keys(data.simPatches).map(function(bugId){
  var p=data.simPatches[bugId];
  return {version:p.version,date:p.date,title:p.title,severity:p.severity,resolved:p.resolved,changes:[p.title],bugIds:p.bugIds};
 });
 return README_PATCH_LOG.concat(dynamic).sort(function(a,b){
  var va=parseVersion(a.version),vb=parseVersion(b.version);
  if(va[0]!==vb[0])return vb[0]-va[0];
  if(va[1]!==vb[1])return vb[1]-va[1];
  return vb[2]-va[2];
 });
}

function animateCount(el,to){
 var from=parseInt(el.textContent)||0;
 if(from===to){el.textContent=to;return;}
 var start=Date.now(),dur=700;
 function tick(){var p=Math.min((Date.now()-start)/dur,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(tick);}
 requestAnimationFrame(tick);
}

function renderPatchSummary(){
 var bugs=getAllPatchBugs();
 var applied=Object.keys(data.simPatches).length;
 var score=Object.keys(data.simPatches).reduce(function(s,k){return s+data.simPatches[k].score;},0);
 animateCount($('#patch-total'),bugs.length);
 animateCount($('#patch-applied'),applied);
 animateCount($('#patch-score'),score);
}

function renderPatchBugList(){
 var bugs=getAllPatchBugs();
 var sev={BLOCKER:4,CRITICAL:3,MAJOR:2,MINOR:1};
 bugs.sort(function(a,b){return (sev[b.severity]||0)-(sev[a.severity]||0);});
 $('#patch-bug-list').innerHTML=bugs.map(function(bug){
  var p=data.simPatches[bug.id];
  return '<button class="patch-bug-item'+(p?' is-patched':'')+'" type="button" data-patch-bug="'+bug.id+'">'+
   '<span class="patch-sev-dot">'+escapeHTML(SEVERITY_EMOJI[bug.severity]||'')+'</span>'+
   '<span class="patch-bug-info"><b>'+escapeHTML(bug.location)+'</b><small>'+escapeHTML(PATCH_TYPE_LABEL[bug.type]||bug.type)+' · '+escapeHTML(bug.reportedAt)+'</small></span>'+
   (p?'<span class="patch-done-tag">✓ 패치됨</span>':'')+
   '<span class="badge '+bug.severity.toLowerCase()+'">'+bug.severity+'</span>'+
   '</button>';
 }).join('')||'<p class="help">버그가 없습니다.</p>';
}

function buildSVG(type,after,planId){
 var W=280,H=155;
 var o='<svg viewBox="0 0 '+W+' '+H+'" class="patch-svg">',c='</svg>';

 if(type==='threshold'){
  var gl=H-28,gr=H-58,rx=W/2-70,wx=W/2-4;
  var base='<rect x="'+wx+'" y="20" width="8" height="'+(H-40)+'" fill="#4b5563"/>'+
   '<rect x="'+(W/2+4)+'" y="'+gr+'" width="'+(W/2-4)+'" height="'+(H-gr)+'" fill="#374151"/>'+
   '<rect x="0" y="'+gl+'" width="'+(W/2-4)+'" height="'+(H-gl)+'" fill="#374151"/>'+
   '<text x="'+(W/2+18)+'" y="'+Math.round((gl+gr)/2+4)+'" font-size="9" fill="#6b7280" font-family="monospace">30cm</text>';
  var inner='';
  if(after){
   if(planId==='th4'){
    inner='<polygon points="'+rx+','+gl+' '+W/2+','+gr+' '+W/2+','+gl+'" fill="#14532d" stroke="#4ade80" stroke-width="2"/>'+
     '<circle cx="'+W/2+'" cy="'+gl+'" r="5" fill="#4ade80"/>'+
     '<circle cx="'+rx+'" cy="'+gl+'" r="4" fill="#166534"/>'+
     '<text x="'+(rx+18)+'" y="'+(gl-18)+'" font-size="13" text-anchor="middle">⚙️</text>'+
     '<text x="'+(W/2-38)+'" y="'+(gl-10)+'" font-size="18" text-anchor="middle">♿</text>'+
     '<text x="'+(W/2-16)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">자동 접이식 램프 ✓</text>';
   } else if(planId==='th3'){
    inner='<polygon points="'+rx+','+gl+' '+W/2+','+gr+' '+W/2+','+gl+'" fill="#374151" stroke="#4ade80" stroke-width="2.5"/>'+
     '<line x1="'+rx+'" y1="'+gl+'" x2="'+W/2+'" y2="'+(gr+14)+'" stroke="#4ade80" stroke-width="0.7" opacity="0.4"/>'+
     '<line x1="'+(rx+22)+'" y1="'+gl+'" x2="'+W/2+'" y2="'+(gr+28)+'" stroke="#4ade80" stroke-width="0.7" opacity="0.4"/>'+
     '<line x1="'+(rx+44)+'" y1="'+gl+'" x2="'+W/2+'" y2="'+(gr+42)+'" stroke="#4ade80" stroke-width="0.7" opacity="0.4"/>'+
     '<text x="'+(W/2-38)+'" y="'+(gl-10)+'" font-size="18" text-anchor="middle">♿</text>'+
     '<text x="'+(W/2-14)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">콘크리트 경사로 ✓</text>';
   } else if(planId==='th1'){
    inner='<polygon points="'+(rx+10)+','+gl+' '+W/2+','+(gr+8)+' '+W/2+','+gl+'" fill="#1c2e1c" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="5 3"/>'+
     '<text x="'+(rx+30)+'" y="'+(gl-12)+'" font-size="9" fill="#86efac" font-family="monospace">이동식</text>'+
     '<text x="'+(W/2-38)+'" y="'+(gl-10)+'" font-size="18" text-anchor="middle">♿</text>'+
     '<text x="'+(W/2-16)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">이동식 경사판 설치 ✓</text>';
   } else {
    inner='<polygon points="'+rx+','+gl+' '+W/2+','+gr+' '+W/2+','+gl+'" fill="#14532d" stroke="#4ade80" stroke-width="2"/>'+
     '<text x="'+(W/2-38)+'" y="'+(gl-10)+'" font-size="18" text-anchor="middle">♿</text>'+
     '<text x="'+(W/2-20)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">경사로 설치 — 진입 가능 ✓</text>';
   }
  } else {
   inner='<rect x="'+(W/2-8)+'" y="'+gr+'" width="4" height="'+(gl-gr)+'" fill="#991b1b" stroke="#ef4444" stroke-width="1"/>'+
    '<text x="'+(W/2-50)+'" y="'+(gl-10)+'" font-size="18" text-anchor="middle">♿</text>'+
    '<line x1="'+(W/2-18)+'" y1="'+(gl-38)+'" x2="'+(W/2-12)+'" y2="'+(gl-5)+'" stroke="#ef4444" stroke-width="2.5"/>'+
    '<text x="'+(W/2-18)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#f87171">단차 30cm — 경사로 없음 ✗</text>';
  }
  return o+base+inner+c;
 }

 if(type==='stairs'){
  var sn=4,sw=46,sh=22,bx=18,by=H-28,tw=184,th=88;
  var gnd='<rect x="0" y="'+by+'" width="'+W+'" height="'+(H-by)+'" fill="#374151"/>';
  if(after&&planId==='st3'){
   var lx=bx+52,lw=72,lh=th+8,ly=by-(th+8);
   return o+gnd+
    '<rect x="'+lx+'" y="'+ly+'" width="7" height="'+lh+'" fill="#1f2937" stroke="#4ade80" stroke-width="1.5"/>'+
    '<rect x="'+(lx+lw-7)+'" y="'+ly+'" width="7" height="'+lh+'" fill="#1f2937" stroke="#4ade80" stroke-width="1.5"/>'+
    '<rect x="'+lx+'" y="'+(by-38)+'" width="'+lw+'" height="10" fill="#14532d" stroke="#4ade80" stroke-width="2"/>'+
    '<text x="'+(lx+lw/2)+'" y="'+(by-44)+'" text-anchor="middle" font-size="22">♿</text>'+
    '<text x="'+(lx+lw+12)+'" y="'+(by-th/2)+'" text-anchor="middle" font-size="16" fill="#4ade80">↑</text>'+
    '<line x1="'+lx+'" y1="'+ly+'" x2="'+(lx+7)+'" y2="'+ly+'" stroke="#4ade80" stroke-width="1" opacity="0.5"/>'+
    '<line x1="'+lx+'" y1="'+(ly+Math.round(lh/4))+'" x2="'+(lx+7)+'" y2="'+(ly+Math.round(lh/4))+'" stroke="#4ade80" stroke-width="1" opacity="0.5"/>'+
    '<line x1="'+lx+'" y1="'+(ly+Math.round(lh/2))+'" x2="'+(lx+7)+'" y2="'+(ly+Math.round(lh/2))+'" stroke="#4ade80" stroke-width="1" opacity="0.5"/>'+
    '<line x1="'+lx+'" y1="'+(ly+Math.round(lh*3/4))+'" x2="'+(lx+7)+'" y2="'+(ly+Math.round(lh*3/4))+'" stroke="#4ade80" stroke-width="1" opacity="0.5"/>'+
    '<text x="'+W/2+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">수직 리프트 설치 ✓</text>'+c;
  }
  if(after&&planId==='st4'){
   var ex4=bx+30,ew4=90,eh4=th+12,ey4=by-(th+12),emx4=ex4+45;
   return o+gnd+
    '<rect x="'+ex4+'" y="'+ey4+'" width="'+ew4+'" height="'+eh4+'" rx="3" fill="#111827" stroke="#4ade80" stroke-width="2"/>'+
    '<rect x="'+(ex4+4)+'" y="'+(ey4+4)+'" width="'+(ew4/2-6)+'" height="'+(eh4-8)+'" fill="#14532d" stroke="#4ade80" stroke-width="1"/>'+
    '<rect x="'+(emx4+2)+'" y="'+(ey4+4)+'" width="'+(ew4/2-6)+'" height="'+(eh4-8)+'" fill="#14532d" stroke="#4ade80" stroke-width="1"/>'+
    '<text x="'+emx4+'" y="'+(ey4+Math.round(eh4/2)+8)+'" text-anchor="middle" font-size="24">♿</text>'+
    '<rect x="'+(ex4+ew4-24)+'" y="'+(ey4-8)+'" width="28" height="14" rx="3" fill="#15803d"/>'+
    '<text x="'+(ex4+ew4-10)+'" y="'+(ey4+2)+'" text-anchor="middle" font-size="8" fill="white" font-family="monospace">NEW</text>'+
    '<rect x="'+(ex4+ew4+5)+'" y="'+(ey4+20)+'" width="16" height="30" rx="2" fill="#1f2937" stroke="#374151"/>'+
    '<circle cx="'+(ex4+ew4+13)+'" cy="'+(ey4+30)+'" r="3" fill="#4ade80"/>'+
    '<circle cx="'+(ex4+ew4+13)+'" cy="'+(ey4+42)+'" r="3" fill="#4ade80"/>'+
    '<text x="'+W/2+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">엘리베이터 신규 설치 ✓</text>'+c;
  }
  if(after){
   var rl=planId==='st1'?'접이식 휴대용 경사로 ✓':'고정형 경사로 (1:12) ✓';
   return o+gnd+
    '<polygon points="'+bx+','+by+' '+(bx+tw)+','+by+' '+(bx+tw)+','+(by-th)+'" fill="#14532d"/>'+
    '<line x1="'+bx+'" y1="'+by+'" x2="'+(bx+tw)+'" y2="'+(by-th)+'" stroke="#4ade80" stroke-width="3"/>'+
    (planId==='st1'?'<text x="'+(bx+tw+10)+'" y="'+(by-12)+'" font-size="9" fill="#86efac" font-family="monospace">접이식</text>':'')+
    '<text x="'+W/2+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">'+rl+'</text>'+c;
  }
  var sc='';
  for(var si=0;si<sn;si++){
   sc+='<rect x="'+(bx+si*sw)+'" y="'+(by-(si+1)*sh)+'" width="'+((sn-si)*sw)+'" height="'+sh+'" fill="hsl(220,12%,'+(18+si*5)+'%)" stroke="#4b5563" stroke-width="1"/>';
  }
  return o+sc+gnd+
   '<text x="'+(bx+tw/2)+'" y="'+(by-th-8)+'" text-anchor="middle" font-size="10" fill="#f87171" font-family="monospace">4칸</text>'+
   '<text x="'+W/2+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#f87171">계단 4칸 — 휠체어 통행 불가 ✗</text>'+c;
 }

 if(type==='elevator'){
  var ex=70,ey=18,ew=140,eh=110,mx=140;
  var rm2={el1:{icon:'🔧',label:'긴급 수리 완료',sub:'소부품 교체'},el2:{icon:'⚙️',label:'구동 시스템 수리',sub:'모터·케이블'},el3:{icon:'🖥️',label:'제어반 전면 교체',sub:'최신 시스템'},el4:{icon:'🆕',label:'엘리베이터 신규 교체',sub:'기준 충족 설비'}};
  var rm=rm2[planId]||{icon:'✓',label:'수리 완료',sub:''};
  var sc2=after?'#4ade80':'#ef4444';
  var base2='<rect x="'+ex+'" y="'+ey+'" width="'+ew+'" height="'+eh+'" rx="3" fill="#111827" stroke="'+sc2+'" stroke-width="2"/>'+
   '<line x1="'+mx+'" y1="'+ey+'" x2="'+mx+'" y2="'+(ey+eh)+'" stroke="'+sc2+'" stroke-width="1.5" stroke-dasharray="5 3"/>';
  var inner2='';
  if(after){
   inner2='<rect x="'+ex+'" y="'+ey+'" width="24" height="'+eh+'" fill="#14532d" stroke="#4ade80" stroke-width="1"/>'+
    '<rect x="'+(ex+ew-24)+'" y="'+ey+'" width="24" height="'+eh+'" fill="#14532d" stroke="#4ade80" stroke-width="1"/>'+
    '<text x="'+mx+'" y="'+(ey+Math.round(eh/2)-12)+'" text-anchor="middle" font-size="20">'+rm.icon+'</text>'+
    '<text x="'+mx+'" y="'+(ey+Math.round(eh/2)+8)+'" text-anchor="middle" font-size="24">♿</text>'+
    '<text x="'+mx+'" y="'+(ey+Math.round(eh/2)+24)+'" text-anchor="middle" font-size="8" fill="#86efac" font-family="monospace">'+rm.sub+'</text>'+
    '<circle cx="'+(ex+ew+14)+'" cy="'+(ey+20)+'" r="5" fill="#4ade80"/>'+
    '<text x="'+(ex+ew+14)+'" y="'+(ey+38)+'" text-anchor="middle" font-size="8" fill="#4ade80">운행</text>'+
    '<rect x="'+(ex+ew+6)+'" y="'+(ey+48)+'" width="18" height="34" rx="2" fill="#1f2937" stroke="#374151"/>'+
    '<circle cx="'+(ex+ew+15)+'" cy="'+(ey+58)+'" r="4" fill="#4ade80"/>'+
    '<circle cx="'+(ex+ew+15)+'" cy="'+(ey+72)+'" r="4" fill="#4ade80"/>'+
    '<text x="'+W/2+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#4ade80">'+rm.label+' ✓</text>';
  } else {
   inner2='<rect x="'+(ex+2)+'" y="'+(ey+2)+'" width="'+(ew/2-3)+'" height="'+(eh-4)+'" fill="#1f1f2e" stroke="#991b1b" stroke-width="1"/>'+
    '<rect x="'+(mx+1)+'" y="'+(ey+2)+'" width="'+(ew/2-3)+'" height="'+(eh-4)+'" fill="#1f1f2e" stroke="#991b1b" stroke-width="1"/>'+
    '<text x="'+mx+'" y="'+(ey+Math.round(eh/2)-6)+'" text-anchor="middle" font-size="28" fill="#ef4444">✖</text>'+
    '<text x="'+mx+'" y="'+(ey+Math.round(eh/2)+18)+'" text-anchor="middle" font-size="10" fill="#f87171">운행 중단</text>'+
    '<circle cx="'+(ex+ew+14)+'" cy="'+(ey+20)+'" r="5" fill="#ef4444"/>'+
    '<text x="'+(ex+ew+14)+'" y="'+(ey+38)+'" text-anchor="middle" font-size="8" fill="#f87171">고장</text>'+
    '<rect x="'+(ex+ew+6)+'" y="'+(ey+48)+'" width="18" height="34" rx="2" fill="#1f2937" stroke="#374151"/>'+
    '<circle cx="'+(ex+ew+15)+'" cy="'+(ey+58)+'" r="4" fill="#374151"/>'+
    '<circle cx="'+(ex+ew+15)+'" cy="'+(ey+72)+'" r="4" fill="#374151"/>'+
    '<text x="'+W/2+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#f87171">엘리베이터 고장 — 이용 불가 ✗</text>';
  }
  return o+base2+inner2+c;
 }

 if(type==='doorWidth'){
  var wh=115,wy=20;
  var nar={left:95,w:90},wid={left:76,w:128},wdr={left:60,w:160};
  var dd,nl2;
  if(after){
   if(planId==='dw4'){dd=wdr;nl2='벽체 개구부 확장 — 통과 가능 ✓';}
   else if(planId==='dw3'){dd=wid;nl2='슬라이딩 도어 — 통과 가능 ✓';}
   else if(planId==='dw2'){dd=wid;nl2='문짝 교체 (폭 확장) — 통과 가능 ✓';}
   else{dd=wid;nl2='도어 최대 개방 — 통과 가능 ✓';}
  } else{dd=nar;nl2='문 폭 부족 — 통과 불가 ✗';}
  var fc3=after?'#4ade80':'#ef4444';
  var wf=(after&&planId==='dw4')?'#2d1f0a':'#374151';
  var dl=after?(planId==='dw4'?'← 90cm+ →':'← 80cm →'):'← 60cm →';
  var ddc='<rect x="0" y="'+wy+'" width="'+dd.left+'" height="'+wh+'" fill="'+wf+'"/>'+
   '<rect x="'+(dd.left+dd.w)+'" y="'+wy+'" width="'+(W-dd.left-dd.w)+'" height="'+wh+'" fill="'+wf+'"/>';
  if(after&&planId==='dw4'){
   ddc+='<rect x="0" y="'+wy+'" width="'+dd.left+'" height="'+wh+'" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>'+
    '<rect x="'+(dd.left+dd.w)+'" y="'+wy+'" width="'+(W-dd.left-dd.w)+'" height="'+wh+'" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>'+
    '<text x="'+Math.round(dd.left/2)+'" y="'+(wy+Math.round(wh/2))+'" text-anchor="middle" font-size="14" fill="#f59e0b">🔨</text>';
  }
  ddc+='<rect x="'+(dd.left-3)+'" y="'+(wy-3)+'" width="'+(dd.w+6)+'" height="'+(wh+3)+'" rx="2" fill="none" stroke="'+fc3+'" stroke-width="2.5"/>';
  if(after&&planId==='dw3'){
   var sw3=Math.round(dd.w*0.35);
   ddc+='<rect x="'+dd.left+'" y="'+wy+'" width="'+sw3+'" height="'+wh+'" fill="#1a2e1a" stroke="#4ade80" stroke-width="1"/>'+
    '<rect x="'+(dd.left+dd.w-sw3)+'" y="'+wy+'" width="'+sw3+'" height="'+wh+'" fill="#1a2e1a" stroke="#4ade80" stroke-width="1"/>'+
    '<text x="'+(dd.left+Math.round(dd.w*0.18))+'" y="'+(wy+Math.round(wh/2))+'" text-anchor="middle" font-size="9" fill="#4ade80">◀</text>'+
    '<text x="'+(dd.left+Math.round(dd.w*0.82))+'" y="'+(wy+Math.round(wh/2))+'" text-anchor="middle" font-size="9" fill="#4ade80">▶</text>';
  }
  ddc+=
   '<line x1="'+dd.left+'" y1="'+(wy+wh+12)+'" x2="'+(dd.left+dd.w)+'" y2="'+(wy+wh+12)+'" stroke="'+fc3+'" stroke-width="1.5"/>'+
   '<line x1="'+dd.left+'" y1="'+(wy+wh+7)+'" x2="'+dd.left+'" y2="'+(wy+wh+17)+'" stroke="'+fc3+'" stroke-width="1.5"/>'+
   '<line x1="'+(dd.left+dd.w)+'" y1="'+(wy+wh+7)+'" x2="'+(dd.left+dd.w)+'" y2="'+(wy+wh+17)+'" stroke="'+fc3+'" stroke-width="1.5"/>'+
   '<text x="'+(dd.left+Math.round(dd.w/2))+'" y="'+(wy+wh+26)+'" text-anchor="middle" font-size="10" fill="'+fc3+'" font-family="monospace">'+dl+'</text>'+
   '<text x="'+(dd.left+Math.round(dd.w/2))+'" y="'+(wy+Math.round(wh/2)+10)+'" text-anchor="middle" font-size="'+(after?26:20)+'" fill="'+fc3+'">♿</text>';
  if(!after){
   ddc+='<line x1="'+(dd.left+6)+'" y1="'+(wy+12)+'" x2="'+(dd.left+dd.w-6)+'" y2="'+(wy+wh-12)+'" stroke="#ef4444" stroke-width="2.5"/>'+
    '<line x1="'+(dd.left+dd.w-6)+'" y1="'+(wy+12)+'" x2="'+(dd.left+6)+'" y2="'+(wy+wh-12)+'" stroke="#ef4444" stroke-width="2.5"/>';
  }
  ddc+='<text x="'+W/2+'" y="'+(H-4)+'" text-anchor="middle" font-size="10" fill="'+fc3+'">'+nl2+'</text>';
  return o+ddc+c;
 }
 return o+'<text x="140" y="77" text-anchor="middle" fill="#6b7280" font-size="12">시각화 없음</text>'+c;
}

function renderPatchDetail(bug){
 var p=data.simPatches[bug.id];
 var plans=PATCH_PLANS[bug.type]||[];
 var plansHtml=plans.map(function(plan){
  var isApplied=p&&p.planId===plan.id;
  var anyApplied=!!p;
  var btnHtml='';
  if(isApplied){
   btnHtml='<div class="patch-plan-actions">'+
    '<span class="patch-applied-tag">✓ 적용됨</span>'+
    '<button class="patch-cancel-btn" type="button" data-cancel-bug="'+bug.id+'">취소</button>'+
    '</div>';
  } else if(anyApplied){
   btnHtml='<span class="patch-not-chosen">— 미선택</span>';
  } else{
   btnHtml='<button class="patch-apply-btn" type="button" data-apply-bug="'+bug.id+'" data-apply-plan="'+plan.id+'" data-apply-score="'+plan.score+'">적용 시뮬레이션</button>';
  }
  return '<div class="patch-plan-card'+(isApplied?' is-applied':'')+'">'+
   '<div class="patch-plan-head">'+
   '<div><b>'+escapeHTML(plan.title)+'</b>'+
   '<div class="patch-plan-meta">'+
   '<span>난이도 '+DIFFICULTY_LABEL[plan.difficulty]+'</span>'+
   '<span>💰 '+escapeHTML(plan.cost)+'</span>'+
   '<span>🗓️ 약 '+plan.weeks+'주</span>'+
   '<span class="patch-effect">'+escapeHTML(plan.effect)+'</span>'+
   '</div></div>'+
   btnHtml+
   '</div></div>';
 }).join('');
 var appliedPlanId=p?p.planId:null;
 var svgPlanId=patchShowAfter?(appliedPlanId||''):'';
 var svgHtml=buildSVG(bug.type,patchShowAfter,svgPlanId);
 $('#patch-detail-inner').innerHTML=
  '<div class="patch-detail-header panel">'+
  '<div class="patch-detail-sev">'+
  '<span class="badge '+bug.severity.toLowerCase()+'">'+bug.severity+'</span>'+
  '<div><b class="patch-sev-label">'+escapeHTML(SEVERITY_EMOJI[bug.severity]||'')+' '+bug.severity+'</b>'+
  '<small>// '+escapeHTML(SEVERITY_DESC[bug.severity]||'')+'</small></div>'+
  '</div>'+
  '<p class="patch-detail-loc">'+escapeHTML(bug.location)+'</p>'+
  '<p class="patch-detail-type">'+escapeHTML(PATCH_TYPE_LABEL[bug.type]||bug.type)+' · '+escapeHTML(bug.reportedAt)+'</p>'+
  '</div>'+
  '<div class="patch-plans-section">'+
  '<p class="patch-section-label">개선 옵션</p>'+
  plansHtml+
  '</div>'+
  '<div class="patch-svg-section">'+
  '<div class="patch-svg-header">'+
  '<p class="patch-section-label">개선 시각화</p>'+
  '<div class="svg-toggle">'+
  '<button class="svg-toggle-btn'+(patchShowAfter?'':' active')+'" type="button" data-svg-toggle="before">적용 전</button>'+
  '<button class="svg-toggle-btn'+(patchShowAfter?' active':'')+'" type="button" data-svg-toggle="after">적용 후</button>'+
  '</div></div>'+
  '<div class="svg-wrap">'+svgHtml+'</div>'+
  '</div>';
}

function showPatchDetail(bugId){
 var bug=getAllPatchBugs().filter(function(b){return b.id===bugId;})[0];
 if(!bug)return;
 currentPatchBugId=bugId;
 patchShowAfter=!!data.simPatches[bugId];
 $('#patch-list-view').hidden=true;
 $('#patch-detail-view').hidden=false;
 renderPatchDetail(bug);
 renderPatchSummary();
}

function showPatchList(){
 currentPatchBugId=null;
 patchShowAfter=false;
 $('#patch-list-view').hidden=false;
 $('#patch-detail-view').hidden=true;
}

function renderPatch(){
 renderPatchSummary();
 if(!currentPatchBugId){renderPatchBugList();}
}

document.body.addEventListener('click',function(event){
 var bugBtn=event.target.closest('[data-patch-bug]');
 if(bugBtn){showPatchDetail(bugBtn.dataset.patchBug);return;}
 if(event.target.closest('#patch-back')){showPatchList();renderPatchBugList();return;}
 var applyBtn=event.target.closest('[data-apply-bug]');
 if(applyBtn){
  var bid=applyBtn.dataset.applyBug,pid=applyBtn.dataset.applyPlan,score=parseInt(applyBtn.dataset.applyScore)||0;
  if(!data.simPatches[bid]){
   var bug=getAllPatchBugs().filter(function(b){return b.id===bid;})[0];
   var plan=(PATCH_PLANS[bug.type]||[]).filter(function(p){return p.id===pid;})[0];
   data.simPatches[bid]=buildPatchMeta(bug,plan,pid,score);
   patchShowAfter=true;
   save();
   var b2=getAllPatchBugs().filter(function(b){return b.id===bid;})[0];
   if(b2)renderPatchDetail(b2);
   renderPatchSummary();
   renderReadme();
   renderChangelog();
  }
  return;
 }
 var cancelBtn=event.target.closest('[data-cancel-bug]');
 if(cancelBtn){
  delete data.simPatches[cancelBtn.dataset.cancelBug];
  patchShowAfter=false;
  save();
  var b3=getAllPatchBugs().filter(function(b){return b.id===cancelBtn.dataset.cancelBug;})[0];
  if(b3)renderPatchDetail(b3);
  renderPatchSummary();
  renderReadme();
  renderChangelog();
  return;
 }
 var svgTgl=event.target.closest('[data-svg-toggle]');
 if(svgTgl&&currentPatchBugId){
  patchShowAfter=svgTgl.dataset.svgToggle==='after';
  var b4=getAllPatchBugs().filter(function(b){return b.id===currentPatchBugId;})[0];
  if(b4)renderPatchDetail(b4);
  return;
 }
});

renderAll();
