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
 readme:{version:'v1.3',updated:'2 days ago',description:'도시의 이동 환경을 시민과 함께 디버깅하는 오픈소스 프로젝트입니다. 접근성의 실패를 개인의 문제가 아닌 수정 가능한 도시의 버그로 기록합니다.',baseReproduced:41},
 compatibility:[
  {id:'c1',icon:'♿',name:'Wheelchair',score:95,desc:'주요 동선의 단차·경사로 호환성'},
  {id:'c2',icon:'👶',name:'Stroller',score:91,desc:'유모차 연속 이동 경로 지원'},
  {id:'c3',icon:'🚲',name:'Bicycle',score:83,desc:'자전거 진입·보관 경로 지원'},
  {id:'c4',icon:'🧳',name:'Carrier',score:88,desc:'캐리어 이용자의 수직 이동 지원'},
  {id:'c5',icon:'🧓',name:'Senior',score:86,desc:'휴식 지점과 저강도 이동 지원'}],
 patches:[
  {id:'p1',version:'v1.3.0',status:'DEPLOYED',title:'2번 역 환승 통로 경사로 추가',desc:'환승 구간의 연속 이동 경로를 배포했습니다.'},
  {id:'p2',version:'v1.2.4',status:'DEPLOYED',title:'1번 역 넓은 개찰구 위치 안내 개선',desc:'바닥 유도선과 방향 표지를 업데이트했습니다.'},
  {id:'p3',version:'v1.4.0',status:'PENDING',title:'3번 역 엘리베이터 대기 공간 확장 예정',desc:'혼잡 시간대 안전 반경을 확보할 예정입니다.'},
  {id:'p4',version:'v1.4.2',status:'PENDING',title:'1번 역 자전거 대여소 접근 경로 개선 예정',desc:'보행 동선과 자전거 동선을 분리할 예정입니다.'}],
 heatmap:[
  {id:'h1',place:'1번 역',count:18,desc:'개찰구·출구 안내 관련 이슈가 집중됨'},
  {id:'h2',place:'2번 역',count:26,desc:'복잡한 환승 통로에서 재현 빈도가 높음'},
  {id:'h3',place:'3번 역',count:13,desc:'엘리베이터 대기 공간 관련 이슈'},
  {id:'h4',place:'중앙 공원',count:9,desc:'보행로 단차와 우회 안내 부족'}],
 bugs:[],
 simPatches:{}
};
function copy(value){return JSON.parse(JSON.stringify(value));}
function load(){try{var saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!saved)return copy(defaults);return {readme:Object.assign({},defaults.readme,saved.readme),compatibility:saved.compatibility||[],patches:saved.patches||[],heatmap:saved.heatmap||[],bugs:saved.bugs||[],simPatches:saved.simPatches||{}};}catch(error){return copy(defaults);}}
var data=load();
function $(selector){return document.querySelector(selector);}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
function makeId(prefix){return prefix+Date.now()+Math.random().toString(16).slice(2);}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
function required(values,message){var valid=values.every(function(value){return String(value).trim()!=='';});if(!valid)alert(message||'모든 입력값을 입력해주세요.');return valid;}
function reproducedTotal(){return data.readme.baseReproduced+data.bugs.reduce(function(total,bug){return total+(bug.reproductions||0);},0);}

function renderReadme(){
 $('#readme-description').textContent=data.readme.description;
 $('#stat-version').textContent=data.readme.version;
 $('#stat-updated').textContent=data.readme.updated;
 $('#stat-bugs').textContent=12+data.bugs.length;
 $('#stat-reproduced').textContent=reproducedTotal();
}
function renderCompatibility(){
 $('#compat-list').innerHTML=data.compatibility.map(function(item){
  return '<article class="compat-card"><button class="delete" data-delete="compatibility" data-id="'+item.id+'" aria-label="'+escapeHTML(item.name)+' 삭제">삭제</button><span class="icon">'+escapeHTML(item.icon)+'</span><h3>'+escapeHTML(item.name)+'<strong>'+item.score+'%</strong></h3><p>'+escapeHTML(item.desc)+'</p><div class="bar" role="img" aria-label="'+escapeHTML(item.name)+' 호환성 '+item.score+' 퍼센트"><i style="width:'+item.score+'%"></i></div></article>';
 }).join('');
}
function renderPatches(){
 $('#patch-list').innerHTML=data.patches.map(function(item){
  return '<article class="patch-card"><div class="patch-head"><b>'+escapeHTML(item.version)+'</b><span class="badge '+item.status.toLowerCase()+'">'+item.status+'</span><button class="delete" data-delete="patches" data-id="'+item.id+'">삭제</button></div><h3>'+escapeHTML(item.title)+'</h3><p>'+escapeHTML(item.desc)+'</p></article>';
 }).join('')||'<p class="help">등록된 패치가 없습니다.</p>';
}
function renderHeatmap(){
 var max=Math.max.apply(null,[1].concat(data.heatmap.map(function(item){return item.count;})));
 $('#heat-list').innerHTML=data.heatmap.map(function(item){
  return '<article class="heat-item"><div class="heat-head"><b>'+escapeHTML(item.place)+'</b><strong>'+item.count+' bugs</strong><button class="delete" data-delete="heatmap" data-id="'+item.id+'">삭제</button></div><p>'+escapeHTML(item.desc)+'</p><div class="bar" role="img" aria-label="'+item.count+'개 버그"><i style="width:'+Math.round(item.count/max*100)+'%"></i></div></article>';
 }).join('')||'<p class="help">등록된 장소가 없습니다.</p>';
}
function renderBugs(){
 $('#issue-count').textContent=data.bugs.length+' ISSUES';
 $('#bug-list').innerHTML=data.bugs.map(function(bug){
  return '<article class="panel log-card '+bug.severity+'"><div class="log-head"><span class="badge '+bug.severity.toLowerCase()+'">'+bug.severity+'</span><h3>'+escapeHTML(bug.location)+'</h3><time>'+escapeHTML(bug.date)+'</time></div><p class="log-meta"><span>'+escapeHTML(bug.line)+'</span><span>'+escapeHTML(bug.type)+'</span><span>재현 '+(bug.reproductions||0)+'회</span></p><p>'+escapeHTML(bug.detail)+'</p><p class="reason"><b>AI 판단 근거:</b> '+escapeHTML(bug.reason)+'</p><div class="log-actions"><button data-reproduce="'+bug.id+'">나도 겪었어요 · +1</button><button class="delete" data-delete="bugs" data-id="'+bug.id+'">삭제</button></div></article>';
 }).join('')||'<div class="panel empty"><p>아직 제보된 버그가 없습니다.<br>첫 번째 도시 버그를 기록해주세요.</p></div>';
 renderReadme();
}
function renderAll(){renderReadme();renderCompatibility();renderPatches();renderHeatmap();renderBugs();renderPatch();}

document.querySelectorAll('[data-toggle]').forEach(function(button){button.addEventListener('click',function(){var form=$('#'+button.dataset.toggle);form.hidden=!form.hidden;if(button.dataset.toggle==='readme-form'&&!form.hidden){$('#readme-version').value=data.readme.version;$('#readme-updated').value=data.readme.updated;$('#readme-text').value=data.readme.description;}});});
$('#readme-form').addEventListener('submit',function(event){event.preventDefault();var version=$('#readme-version').value.trim(),updated=$('#readme-updated').value.trim(),text=$('#readme-text').value.trim();if(!required([version,updated,text],'README의 모든 값을 입력해주세요.'))return;data.readme.version=version;data.readme.updated=updated;data.readme.description=text;save();renderReadme();event.target.hidden=true;});
$('#compat-form').addEventListener('submit',function(event){event.preventDefault();var icon=$('#compat-icon').value.trim(),name=$('#compat-name').value.trim(),score=$('#compat-score').value,desc=$('#compat-desc').value.trim();if(!required([icon,name,score,desc],'호환성 항목의 모든 값을 입력해주세요.'))return;if(Number(score)<0||Number(score)>100){alert('점수는 0부터 100 사이로 입력해주세요.');return;}data.compatibility.push({id:makeId('c'),icon:icon,name:name,score:Number(score),desc:desc});save();renderCompatibility();event.target.reset();event.target.hidden=true;});
$('#patch-form').addEventListener('submit',function(event){event.preventDefault();var version=$('#patch-version').value.trim(),status=$('#patch-status').value,title=$('#patch-title').value.trim(),desc=$('#patch-desc').value.trim();if(!required([version,title,desc],'패치 노트의 모든 값을 입력해주세요.'))return;data.patches.unshift({id:makeId('p'),version:version,status:status,title:title,desc:desc});save();renderPatches();event.target.reset();event.target.hidden=true;});
$('#heat-form').addEventListener('submit',function(event){event.preventDefault();var place=$('#heat-place').value.trim(),count=$('#heat-count').value,desc=$('#heat-desc').value.trim();if(!required([place,count,desc],'히트맵 항목의 모든 값을 입력해주세요.'))return;data.heatmap.push({id:makeId('h'),place:place,count:Number(count),desc:desc});save();renderHeatmap();event.target.reset();event.target.hidden=true;});
document.body.addEventListener('click',function(event){
 var remove=event.target.closest('[data-delete]');
 if(remove){if(!confirm('이 항목을 삭제할까요?'))return;data[remove.dataset.delete]=data[remove.dataset.delete].filter(function(item){return item.id!==remove.dataset.id;});save();renderAll();return;}
 var reproduce=event.target.closest('[data-reproduce]');
 if(reproduce){var bug=data.bugs.find(function(item){return item.id===reproduce.dataset.reproduce;});if(bug){bug.reproductions=(bug.reproductions||0)+1;save();renderBugs();}}
});

var stations={'1번 역':['1호선','2호선'],'2번 역':['1호선','2호선','3호선'],'3번 역':['1호선','3호선']};
var risks=['엘리베이터 또는 리프트 이용 불가','출입문·개찰구 이용이 어려움','역무원이나 경비원을 찾을 수 없음','환승 통로가 막혀 있음','사람이 너무 많아 이동이 어려움','휠체어·유모차 이동 경로를 모르겠음'];
var selection={station:'',line:'',risk:''};
$('#station-map').innerHTML=Object.keys(stations).map(function(station){return '<button class="station" type="button" data-station="'+station+'" aria-label="'+station+'">'+station.charAt(0)+'</button>';}).join('');
$('#risk-list').innerHTML=risks.map(function(risk,index){return '<button class="risk" type="button" data-risk="'+risk+'">'+String(index+1).padStart(2,'0')+' · '+risk+'</button>';}).join('');
function updateStep(){var count=[selection.station,selection.line,selection.risk].filter(Boolean).length;$('#step').textContent='STEP '+Math.min(count+1,3)+' / 3';}
$('#station-map').addEventListener('click',function(event){var button=event.target.closest('[data-station]');if(!button)return;selection.station=button.dataset.station;selection.line='';document.querySelectorAll('.station').forEach(function(item){item.classList.toggle('active',item===button);});$('#station-help').textContent='현재 위치: '+selection.station;$('#line-list').innerHTML=stations[selection.station].map(function(line){return '<button type="button" data-line="'+line+'">'+line+'</button>';}).join('');updateStep();recommend();});
$('#line-list').addEventListener('click',function(event){var button=event.target.closest('[data-line]');if(!button)return;selection.line=button.dataset.line;$('#line-list').querySelectorAll('button').forEach(function(item){item.classList.toggle('active',item===button);});updateStep();recommend();});
$('#risk-list').addEventListener('click',function(event){var button=event.target.closest('[data-risk]');if(!button)return;selection.risk=button.dataset.risk;$('#risk-list').querySelectorAll('button').forEach(function(item){item.classList.toggle('active',item===button);});updateStep();recommend();});
var routes={
 '1번 역':{'1호선':'2호선 연결 통로를 통해 2번 역 방향으로 우회','2호선':'1호선 환승 구간의 넓은 개찰구 이용'},
 '2번 역':{'1호선':'2호선 경사로 또는 3호선 엘리베이터 동선 이용','2호선':'1호선 경사로를 거쳐 지상 출구로 이동','3호선':'1호선 환승 구간의 대체 엘리베이터 이용'},
 '3번 역':{'1호선':'3호선 연결 엘리베이터를 이용해 우회','3호선':'1호선 완만한 경사로를 통해 반대편 출구 이용'}};
function recommend(){
 if(!selection.station||!selection.line||!selection.risk)return;
 var critical=/이용 불가|막혀/.test(selection.risk),major=/사람이 너무|개찰구/.test(selection.risk),severity=critical?'CRITICAL':major?'MAJOR':'MINOR';
 var first=selection.risk.indexOf('엘리베이터')>-1?'운행 상태 안내판과 가까운 대체 엘리베이터 위치':selection.risk.indexOf('역무원')>-1?'비상 호출 버튼과 안내 전화 위치':selection.risk.indexOf('사람')>-1?'혼잡이 적은 출구와 다음 열차 운행 간격':'접근 가능한 연속 이동 경로와 안내 표지';
 $('#recommendation').innerHTML='<div class="ai-title"><span>AI</span><div><small>RULE MATCH COMPLETE</small><h3>AI 해결 추천</h3></div></div><div class="result-meta"><div><small>선택 역</small><b>'+selection.station+'</b></div><div><small>호선</small><b>'+selection.line+'</b></div><div><small>심각도</small><span class="badge '+severity.toLowerCase()+'">'+severity+'</span></div></div><div class="result-block"><h4>먼저 확인할 정보</h4><p>'+first+'를 먼저 확인하세요.</p></div><div class="result-block"><h4>추천 대체 경로</h4><p>'+routes[selection.station][selection.line]+'을 권장합니다.</p></div><div class="result-block"><h4>행동 순서</h4><ol><li>통행을 방해하지 않는 가까운 안전 대기 지점으로 이동합니다.</li><li>다른 엘리베이터·경사로·넓은 개찰구를 확인합니다.</li><li>같은 역에서 어렵다면 제안된 대체 호선을 이용합니다.</li><li>호출 버튼이나 안내 전화로 현재 위치를 알립니다.</li></ol></div><div class="result-block safety"><h4>안전 주의사항</h4><p>계단이나 에스컬레이터에서 무리하게 이동하거나 이동 보조기기를 혼자 들어 올리지 마세요.</p></div>';
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
 save();renderBugs();event.target.reset();$('#logs').scrollIntoView({behavior:'smooth'});alert(rule[0]+' 심각도로 버그가 등록되었습니다.');
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
  {id:'dw4',title:'벽체 개구부 확장 공사',difficulty:5,cost:'500~1,200만원',weeks:6,effect:'CRITICAL → 완전 해결',score:48}]
};
var DIFFICULTY_LABEL=['','★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★'];
var PATCH_TYPE_LABEL={threshold:'턱·단차',stairs:'계단',elevator:'엘리베이터 고장',doorWidth:'문폭 부족'};
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
 '개찰구가 좁음':'doorWidth'
};
var currentPatchBugId=null;
var patchShowAfter=false;

function getAllPatchBugs(){
 var userBugs=data.bugs.filter(function(b){return USER_TYPE_MAP[b.type];}).map(function(b){
  return {id:b.id,location:b.location,type:USER_TYPE_MAP[b.type],severity:b.severity,reportedAt:b.date};
 });
 return PATCH_SEED_BUGS.concat(userBugs);
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
   data.simPatches[bid]={planId:pid,score:score};
   patchShowAfter=true;
   save();
   var b2=getAllPatchBugs().filter(function(b){return b.id===bid;})[0];
   if(b2)renderPatchDetail(b2);
   renderPatchSummary();
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
