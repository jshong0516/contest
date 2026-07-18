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
 bugs:[]
};
function copy(value){return JSON.parse(JSON.stringify(value));}
function load(){try{var saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!saved)return copy(defaults);return {readme:Object.assign({},defaults.readme,saved.readme),compatibility:saved.compatibility||[],patches:saved.patches||[],heatmap:saved.heatmap||[],bugs:saved.bugs||[]};}catch(error){return copy(defaults);}}
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
function renderAll(){renderReadme();renderCompatibility();renderPatches();renderHeatmap();renderBugs();}

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
renderAll();
