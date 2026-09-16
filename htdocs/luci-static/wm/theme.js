/* wm interactions — Apache-2.0. No third-party requests or analytics. */
(function () {
 'use strict';
 var paths={
  home:'m3 10 9-7 9 7 M5 8.5V20h5v-6h4v6h5V8.5',
  grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  activity:'M3 12h4l3-8 4 16 3-8h4',
  settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  layers:'m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5',
  network:'M9 3h6v5H9z M2 16h6v5H2z M16 16h6v5h-6z M12 8v4 M5 16v-4h14v4',
  server:'M4 3h16v7H4z M4 14h16v7H4z M7 6.5h.01 M7 17.5h.01 M16 6.5h1 M16 17.5h1',
  shield:'m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5z M8 12l3 3 5-6',
  box:'m12 2 9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10 M8 4l9 5',
  chart:'M4 3v18h17 M8 16v-5 M13 16V7 M18 16v-3',
  sliders:'M4 6h6 M14 6h6 M4 18h10 M18 18h2 M10 3v6 M14 15v6',
  panel:'M4 6h16 M4 12h6 M4 18h16 M17 9l-3 3 3 3',
  search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0 M14.5 14.5 21 21',
  logout:'M10 4H4v16h6 M8 12h13 M17 8l4 4-4 4',
  chevron:'m9 5 7 7-7 7',
  arrow:'M4 12h16 M14 6l6 6-6 6',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  eyeOff:'m3 3 18 18 M10.6 5.1 12 5c6 0 10 7 10 7a19 19 0 0 1-3 3.8 M6.1 6.1A23 23 0 0 0 2 12s4 7 10 7c1.8 0 3.5-.6 5-1.5 M9.9 9.9a3 3 0 0 0 4.2 4.2',
  clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2',
  cpu:'M6 6h12v12H6z M9 9h6v6H9z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4',
  memory:'M3 6h18v12H3z M7 9v4 M12 9v4 M17 9v4 M6 18v3 M10 18v3 M14 18v3 M18 18v3',
  disk:'M4 3h16l2 12v5H2v-5z M2 15h20 M6 18h.01 M10 18h.01'
 };
 function icons(root) { (root || document).querySelectorAll('[data-nt-icon]:not([data-nt-painted])').forEach(function(el){var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');var p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',paths[el.dataset.ntIcon] || paths.grid);svg.appendChild(p);el.appendChild(svg);el.dataset.ntPainted='1';}); }
 function initShell() {
  icons();
  var toggle=document.querySelector('#nt-menu-toggle'),sidebar=document.querySelector('#nt-sidebar');
  if(!toggle) return;
  var mobile=window.matchMedia('(max-width:900px)');
  function sync() {
   var small=mobile.matches,collapsed=false;
   try{collapsed=!small&&localStorage.getItem('wm.sidebar')==='collapsed';}catch(e){}
   document.body.classList.remove('nt-mobile-open');
   document.body.classList.toggle('nt-sidebar-collapsed',collapsed);
   sidebar.inert=small;toggle.setAttribute('aria-expanded',String(!small&&!collapsed));
   document.dispatchEvent(new CustomEvent('wm-sidebar-change'));
  }
  sync();mobile.addEventListener('change',sync);
  // The saved layout is already applied by the header. Enable motion after its first paint.
  requestAnimationFrame(function(){requestAnimationFrame(function(){document.body.classList.add('nt-shell-ready');});});
  function closeMobile() {document.body.classList.remove('nt-mobile-open');sidebar.inert=mobile.matches;toggle.setAttribute('aria-expanded',String(!mobile.matches && !document.body.classList.contains('nt-sidebar-collapsed')));}
  toggle.addEventListener('click',function(){if(mobile.matches){var open=document.body.classList.toggle('nt-mobile-open');sidebar.inert=!open;toggle.setAttribute('aria-expanded',String(open));if(open)sidebar.querySelector('a')?.focus();}else{var collapsed=document.body.classList.toggle('nt-sidebar-collapsed');toggle.setAttribute('aria-expanded',String(!collapsed));try{localStorage.setItem('wm.sidebar',collapsed?'collapsed':'expanded');}catch(e){}}document.dispatchEvent(new CustomEvent('wm-sidebar-change'));});
  document.querySelector('.nt-backdrop').addEventListener('click',function(){closeMobile();toggle.focus();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape' && document.body.classList.contains('nt-mobile-open')){closeMobile();toggle.focus();}if(e.key==='Tab' && mobile.matches && document.body.classList.contains('nt-mobile-open')){var els=Array.from(sidebar.querySelectorAll('a[href],button')).filter(function(el){return !el.closest('[inert]') && el.getClientRects().length;});if(e.shiftKey && document.activeElement===els[0]){e.preventDefault();els[els.length-1].focus();}else if(!e.shiftKey && document.activeElement===els[els.length-1]){e.preventDefault();els[0].focus();}}});
  var navigationTimer;
  function stopNavigation() {clearTimeout(navigationTimer);document.body.classList.remove('nt-navigating');}
  // LuCI tabs use href="#" and cancel navigation. Check after document handlers run.
  window.addEventListener('click',function(e){
   var a=e.target.closest('a[href]');
   if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button>0||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
   var href=a.getAttribute('href').trim();
   if(!href||href[0]==='#')return;
   var url=new URL(a.href,location.href);
   if(url.origin!==location.origin||url.pathname.indexOf('/cgi-bin/luci/')!==0)return;
   if(url.pathname===location.pathname&&url.search===location.search&&url.href.includes('#'))return;
   stopNavigation();document.body.classList.add('nt-navigating');
   navigationTimer=window.setTimeout(stopNavigation,4000);
  });
  stopNavigation();
  window.addEventListener('pageshow',stopNavigation);
  window.addEventListener('pagehide',stopNavigation);
  window.addEventListener('popstate',stopNavigation);
  window.addEventListener('hashchange',stopNavigation);
  initSearch();
  initIndicators();
 }
 function initIndicators() {
  var root=document.querySelector('#indicators');if(!root)return;
  function update() {
   var poll=root.querySelector('[data-indicator="poll-status"][data-clickable]');if(!poll)return;
   var active=poll.dataset.style!=='inactive',label=active?'自动刷新中，点击暂停':'已暂停，点击恢复刷新';
   poll.setAttribute('role','button');poll.tabIndex=0;
   poll.setAttribute('aria-pressed',String(active));poll.setAttribute('aria-label',label);poll.title=label;
  }
  root.addEventListener('keydown',function(e){
   if(e.target.matches('[data-indicator="poll-status"][data-clickable]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(!e.repeat)e.target.click();}
  });
  new MutationObserver(update).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-style','data-clickable']});update();
 }
 function initPasswallStatus() {
  if(!(document.body.dataset.page||'').startsWith('admin-services-passwall2'))return;
  var root=document.querySelector('#maincontent'),bar=root?.querySelector('.status-bar')||document.querySelector('body>.status-bar');
  if(!root||!bar)return;
  // Move the existing node after the form, preserving PassWall's polling targets.
  root.appendChild(bar);bar.setAttribute('role','region');bar.setAttribute('aria-label','出口 IP 与网站连接状态');
  var names=['百度连接状态','淘宝连接状态','Google 连接状态','YouTube 连接状态'];
  bar.querySelectorAll('.icon-con img').forEach(function(img,i){if(names[i]){img.alt=names[i];img.title=names[i];}});
  bar.querySelector('.flag img')?.setAttribute('alt','');
 }
 function initSearch() {
  var dialog=document.querySelector('#nt-search-dialog'),input=document.querySelector('#nt-search-input'),results=document.querySelector('#nt-search-results');if(!dialog)return;
  var selected=0;
  function paint() {
   var query=input.value.trim().toLocaleLowerCase(),items=(window.wmMenuItems||[]).filter(function(x){return (x.title+' '+x.group).toLocaleLowerCase().includes(query);}).slice(0,24);
   results.textContent='';selected=0;
   if(!items.length){var empty=document.createElement('div');empty.className='nt-search-empty';empty.textContent='没有找到匹配的菜单';results.appendChild(empty);return;}
   items.forEach(function(item,i){
    var a=document.createElement('a');a.href=item.url;a.className='nt-search-result'+(i===0?' is-selected':'');
    var copy=document.createElement('span');copy.className='nt-search-result-copy';
    var title=document.createElement('span');title.className='nt-search-result-title';title.textContent=item.title;copy.appendChild(title);
    if(item.group){var group=document.createElement('small');group.className='nt-search-result-path';group.textContent=item.group.split(' / ').join(' › ');copy.appendChild(group);}
    var arrow=document.createElement('span');arrow.className='nt-search-result-arrow';arrow.dataset.ntIcon='chevron';arrow.setAttribute('aria-hidden','true');
    a.append(copy,arrow);results.appendChild(a);
   });
   icons(results);
  }
  function open(){if(dialog.open)return;paint();dialog.showModal();input.focus();}
  function close(){dialog.close();document.querySelector('#nt-search-open').focus();}
  document.querySelector('#nt-search-open').addEventListener('click',open);document.querySelector('#nt-search-close').addEventListener('click',close);input.addEventListener('input',paint);
  document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(dialog.open)close();else open();}});
  input.addEventListener('keydown',function(e){var links=results.querySelectorAll('a');if(!links.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();selected=(selected+(e.key==='ArrowDown'?1:-1)+links.length)%links.length;links.forEach(function(a,i){a.classList.toggle('is-selected',i===selected);});links[selected].scrollIntoView({block:'nearest'});}else if(e.key==='Enter'){e.preventDefault();links[selected].click();}});
  dialog.addEventListener('click',function(e){if(e.target===dialog){var rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)close();}});
 }
 var metricsStarted=false;
 function initPartexp() {
  if(document.body.dataset.page!=='admin-system-partexp')return;
  var root=document.querySelector('#maincontent');if(!root)return;
  function decorate() {
   var form=root.querySelector('#partexp-form'),log=root.querySelector('#log-view');
   if(!form||!log)return;
   if(!form.querySelector('.nt-part-heading')){var title=document.createElement('h3');title.className='nt-part-heading';title.textContent='扩容设置';form.prepend(title);}
   log.placeholder='暂无操作日志';log.setAttribute('aria-label','操作日志');
   root.querySelector('#log-section .cbi-value-title')?.setAttribute('for','log-view');
   observer.disconnect();
  }
  var observer=new MutationObserver(decorate);observer.observe(root,{childList:true,subtree:true});decorate();
 }
 function initTabs() {
  var root=document.querySelector('#maincontent');if(!root)return;
  var observed=new Set(),queued=false;
  function reveal(menu,link) {
   if(!link||menu.scrollWidth<=menu.clientWidth+1)return;
   var m=menu.getBoundingClientRect(),a=link.getBoundingClientRect();
   if(a.left<m.left+4)menu.scrollLeft-=m.left+4-a.left;
   else if(a.right>m.right-4)menu.scrollLeft+=a.right-m.right+4;
  }
  function update(menu) {
   var scrollable=menu.scrollWidth>menu.clientWidth+1;
   menu.tabIndex=scrollable?0:-1;
   if(scrollable)menu.setAttribute('aria-label','选项卡，可左右滑动');else menu.removeAttribute('aria-label');
   var active=menu.querySelector('li.active>a,li.cbi-tab>a');
   if(menu._wmActiveTab!==active){menu._wmActiveTab=active;reveal(menu,active);}
  }
  var resize=new ResizeObserver(function(entries){entries.forEach(function(entry){update(entry.target);reveal(entry.target,entry.target._wmActiveTab);});});
  function scan() {
   queued=false;
   observed.forEach(function(menu){if(!menu.isConnected){resize.unobserve(menu);observed.delete(menu);}});
   root.querySelectorAll('.tabs,.cbi-tabmenu').forEach(function(menu){
    if(!observed.has(menu)){
     observed.add(menu);resize.observe(menu);
     menu.addEventListener('focusin',function(event){reveal(menu,event.target.closest('a'));});
     menu.addEventListener('keydown',function(event){
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      var links=Array.from(menu.querySelectorAll(':scope>li>a')).filter(function(a){return a.getClientRects().length;}),index=links.indexOf(document.activeElement);
      if(index<0||!links.length)return;event.preventDefault();
      index=event.key==='Home'?0:event.key==='End'?links.length-1:(index+(event.key==='ArrowRight'?1:-1)+links.length)%links.length;
      links[index].focus();
     });
    }
    update(menu);
   });
  }
  new MutationObserver(function(changes){
   if(!queued&&changes.some(function(c){return c.addedNodes.length||(c.type==='attributes'&&c.target.matches('.tabs>li,.cbi-tabmenu>li'));})){queued=true;requestAnimationFrame(scan);}
  }).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  scan();
 }
 function initSaveNotices() {
  var root=document.querySelector('#maincontent');if(!root||!window.L)return;
  L.require('ui').then(function(){
   var savedText=_('Contents have been saved.');
   function decorate(){
    var newest=null;
    Array.from(root.children).forEach(function(msg){
     if(!msg.matches('.alert-message.info,.alert-message.success')||msg.matches('.warning,.error,.danger,.modal'))return;
     var content=msg.firstElementChild,actions=msg.lastElementChild,button=actions&&actions.querySelector(':scope>button');
     if(!content||!button||content.children.length!==1||!content.firstElementChild.matches('p')||content.textContent.trim()!==savedText)return;
     if(newest){if(msg.contains(document.activeElement))newest.querySelector('button').focus({preventScroll:true});msg.remove();return;}
     newest=msg;
     if(msg.classList.contains('nt-save-notice'))return;
     var returnFocus=document.activeElement;
     msg.classList.add('nt-save-notice');msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');msg.setAttribute('aria-atomic','true');
     button.setAttribute('aria-label',button.textContent.trim()||_('Dismiss'));button.title=button.getAttribute('aria-label');
     button.addEventListener('click',function(){
      if(msg.contains(document.activeElement)&&returnFocus&&returnFocus.isConnected&&!msg.contains(returnFocus)&&typeof returnFocus.focus==='function')returnFocus.focus({preventScroll:true});
      // LuCI waits for transitionend, while its base fade uses animationend.
      // A short fallback also removes the notice when reduced motion disables both.
      setTimeout(function(){msg.remove();},180);
     });
    });
   }
   new MutationObserver(decorate).observe(root,{childList:true});decorate();
  }).catch(function(){});
 }
 function initApplyStatus() {
  if(!window.L||!document.querySelector('#maincontent'))return;
  L.require('ui').then(function(){
   var overlay=document.querySelector('#modal_overlay');if(!overlay)return;
   var chinese=/^zh(?:-|_|$)/i.test(document.documentElement.lang);
   function label(zh,en){return chinese?zh:en;}
   var countdown=new RegExp('^'+_('Applying configuration changes… %ds').split('%d').map(function(part){return part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('(\\d+)')+'$');
   function decorate() {
    var modal=overlay.firstElementChild;if(!modal)return;
    if(!modal.classList.contains('alert-message')){
     if(modal.getAttribute('aria-labelledby')==='nt-apply-title')modal.removeAttribute('aria-labelledby');
     if(modal.getAttribute('aria-describedby')==='nt-apply-description')modal.removeAttribute('aria-describedby');
     delete modal.dataset.applyState;return;
    }
    if(modal.classList.contains('nt-apply-status'))return;
    var busy=modal.classList.contains('spinning'),warning=modal.classList.contains('warning');
    var error=modal.classList.contains('error')||modal.classList.contains('danger');
    var text=modal.textContent.trim(),match=busy&&!warning?text.match(countdown):null;
    if(match&&!match[1])match=null;
    var applied=text===_('Configuration changes applied.'),reverted=text===_('Changes have been reverted.');
    var state=error?'error':warning?'warning':busy?'busy':applied||reverted?'success':'info';
    var heading=modal.querySelector(':scope>h4');
    if(!heading||!heading.textContent.trim()){
     if(heading)heading.remove();heading=document.createElement('h4');
     heading.textContent=busy?(warning?label('正在等待回滚','Waiting for rollback'):text===_('Reverting configuration…')?label('正在撤销更改','Reverting changes'):label('正在应用配置','Applying changes')):applied?label('应用完成','Changes applied'):reverted?label('更改已撤销','Changes reverted'):warning||error?label('配置更新未完成','Configuration update incomplete'):label('配置状态','Configuration status');
    }
    heading.id='nt-apply-title';
    var head=document.createElement('div');head.className='nt-apply-head';
    var icon=document.createElement('span');icon.className='nt-apply-icon';icon.setAttribute('aria-hidden','true');
    if(busy)icon.classList.add('nt-apply-loading');
    else{var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');var path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',state==='success'?'m5 12 4 4 10-10':state==='error'?'m7 7 10 10 M17 7 7 17':state==='warning'?'M12 6v8 M12 18h.01':'M12 10v8 M12 6h.01');svg.appendChild(path);icon.appendChild(svg);}
    head.append(icon,heading);
    if(match){
     var timer=document.createElement('div');timer.className='nt-apply-time';
     var time=document.createElement('strong');time.textContent=match[1];var unit=document.createElement('small');unit.textContent=label('秒','s');time.appendChild(unit);
     var caption=document.createElement('span');caption.textContent=label('剩余确认时间','Confirmation timeout');timer.append(time,caption);head.appendChild(timer);
     var message=modal.querySelector(':scope>p');if(message)message.textContent=label('正在等待设备确认更改，请稍候。','Waiting for the device to confirm your changes.');
    }
    var body=document.createElement('div');body.className='nt-apply-body';
    while(modal.firstChild)body.appendChild(modal.firstChild);
    var description=body.querySelector('p');if(description){description.id='nt-apply-description';modal.setAttribute('aria-describedby',description.id);}else modal.removeAttribute('aria-describedby');
    modal.append(head,body);modal.classList.add('nt-apply-status');modal.classList.toggle('nt-apply-compact',state!=='warning'&&state!=='error'&&!body.querySelector('.button-row'));modal.dataset.applyState=state;modal.setAttribute('aria-labelledby',heading.id);
   }
   new MutationObserver(decorate).observe(overlay,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
   decorate();
  }).catch(function(){});
 }
 function initPasswallDropdowns() {
  if(!document.body.dataset.page?.startsWith('admin-services-passwall2'))return;
  function place(panel,display) {
   if(!panel||!display||panel.style.display==='none')return;
   panel.classList.add('nt-node-dropdown');
   var rect=display.getBoundingClientRect(),viewport=window.visualViewport;
   var left=viewport?viewport.offsetLeft:0,top=viewport?viewport.offsetTop:0;
   var width=Math.min(document.documentElement.clientWidth,viewport?viewport.width:innerWidth);
   var height=viewport?viewport.height:innerHeight,edge=12,gap=6;
   var header=document.querySelector('.nt-topbar');
   var upper=Math.max(top+edge,header?header.getBoundingClientRect().bottom+gap:0);
   panel.style.minHeight='0px';
   panel.style.minWidth='0px';
   panel.style.maxWidth=Math.max(1,width-edge*2)+'px';
   panel.style.width=Math.min(Math.max(rect.width,320),Math.max(1,width-edge*2))+'px';
   panel.style.maxHeight=Math.max(1,Math.min(360,height-edge*2))+'px';
   var below=Math.max(0,top+height-edge-rect.bottom-gap),above=Math.max(0,rect.top-upper-gap);
   // Prefer a shorter, scrollable list below the field. Flip only when there
   // is too little room to use it there, rather than trying to fit every node.
   var upwards=below<Math.min(160,panel.offsetHeight)&&above>below;
   panel.style.maxHeight=Math.max(1,Math.min(360,upwards?above:below))+'px';
   var x=Math.max(left+edge,Math.min(rect.left,left+width-edge-panel.offsetWidth));
   var y=upwards?rect.top-gap-panel.offsetHeight:rect.bottom+gap;
   panel.style.left=x+'px';
   panel.style.top=Math.max(upper,Math.min(y,top+height-edge-panel.offsetHeight))+'px';
   panel.style.visibility='';
   panel.dataset.wmPlacement=upwards?'above':'below';
  }
  function install() {
   // PassWall exposes this helper globally; its original open, search, select,
   // close and scroll handlers continue to operate on the same panel and select.
   if(typeof window.lv_repositionPanel==='function'&&window.lv_repositionPanel!==place)window.lv_repositionPanel=place;
  }
  var frame=0;
  function refresh() {
   if(frame)return;
   frame=requestAnimationFrame(function(){
    frame=0;
    document.querySelectorAll('.lv-dropdown-panel.nt-node-dropdown').forEach(function(panel){
     if(panel.style.display!=='none')place(panel,document.getElementById(panel.id.replace(/\.panel$/,'.display')));
    });
   });
  }
  install();document.addEventListener('luci-loaded',install);
  // Legacy CBI widgets can initialize after the theme has loaded.
  document.addEventListener('click',function(event){if(event.target.closest('.lv-dropdown-display'))install();},true);
  if(window.visualViewport){visualViewport.addEventListener('resize',refresh);visualViewport.addEventListener('scroll',refresh);}
 }
 function initScrollRestoration() {
  var root=document.querySelector('#maincontent');
  if(!root)return;
  var key='wm.reload-scroll',saved=null,pending=false,timer=0,deadline=0;
  var path=location.pathname+location.search+location.hash;
  try{saved=JSON.parse(sessionStorage.getItem(key)||'null');}catch(e){}
  var navigation=performance.getEntriesByType('navigation')[0];
  pending=!!(navigation?.type==='reload'&&saved?.path===path&&Number.isFinite(saved.y)&&saved.y>0&&Number.isFinite(saved.x)&&Date.now()-saved.time<300000);
  // Save only viewport coordinates, never form contents. A rapid second reload
  // while the view is still loading must not replace the desired position by 0.
  window.addEventListener('pagehide',function(){
   try{sessionStorage.setItem(key,JSON.stringify({path:path,x:pending?saved.x:scrollX,y:pending?saved.y:scrollY,time:Date.now()}));}catch(e){}
   if(pending)finish(false);
  });
  if(!pending)return;
  document.documentElement.classList.add('nt-reloaded','nt-restoring-scroll');
  var previous=history.scrollRestoration;
  history.scrollRestoration='manual';
  function finish(restore) {
   if(!pending)return;
   pending=false;clearTimeout(timer);clearTimeout(deadline);
   mutations.disconnect();size.disconnect();
   window.removeEventListener('load',schedule);
   document.removeEventListener('luci-loaded',schedule);
   window.removeEventListener('wheel',cancel,true);
   window.removeEventListener('touchstart',cancel,true);
   window.removeEventListener('pointerdown',cancel,true);
   window.removeEventListener('keydown',onKey,true);
   if(restore)window.scrollTo({left:Math.max(0,saved.x),top:Math.max(0,Math.min(saved.y,document.documentElement.scrollHeight-innerHeight)),behavior:'instant'});
   document.documentElement.classList.remove('nt-restoring-scroll');
   history.scrollRestoration=previous;
  }
  function attempt() {
   var view=document.querySelector('#view');
   // LuCI fires luci-loaded before asynchronous views replace their spinner.
   if(document.readyState!=='complete'||(view&&(!view.children.length||view.querySelector(':scope>.spinning'))))return;
   finish(true);
  }
  function schedule(){if(pending){clearTimeout(timer);timer=setTimeout(attempt,120);}}
  function cancel(){finish(false);}
  function onKey(event){if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Tab','Escape'].includes(event.key))cancel();}
  var mutations=new MutationObserver(schedule),size=new ResizeObserver(schedule);
  mutations.observe(root,{childList:true,subtree:true});size.observe(root);
  window.addEventListener('load',schedule);document.addEventListener('luci-loaded',schedule);
  window.addEventListener('wheel',cancel,{capture:true,passive:true});
  window.addEventListener('touchstart',cancel,{capture:true,passive:true});
  window.addEventListener('pointerdown',cancel,true);window.addEventListener('keydown',onKey,true);
  // If a plugin never completes loading, reveal it instead of leaving it hidden.
  deadline=setTimeout(function(){finish(true);},8000);schedule();
 }
 function initTooltips() {
  var active=null,frame=0;
  function close() {
   if(!active)return;
   active.tip.classList.remove('nt-tooltip-open');
   active=null;
  }
  function place() {
   frame=0;
   if(!active)return;
   var tip=active.tip,target=active.target,viewport=window.visualViewport;
   if(!target.isConnected||!target.getClientRects().length){close();return;}
   var left=viewport?viewport.offsetLeft:0,top=viewport?viewport.offsetTop:0;
   var width=Math.min(document.documentElement.clientWidth,viewport?viewport.width:innerWidth);
   var height=viewport?viewport.height:innerHeight,edge=12,gap=8;
   var rect=target.getBoundingClientRect(),right=left+width,bottom=top+height;
   if(rect.bottom<top||rect.top>bottom||rect.right<left||rect.left>right){close();return;}
   tip.style.maxWidth=Math.max(1,Math.min(360,width-edge*2))+'px';
   tip.style.maxHeight=Math.max(1,height-edge*2)+'px';
   var below=Math.max(0,bottom-edge-rect.bottom-gap),above=Math.max(0,rect.top-top-edge-gap);
   var upwards=tip.offsetHeight>below&&above>below;
   tip.style.maxHeight=Math.max(1,upwards?above:below)+'px';
   var x=Math.max(left+edge,Math.min(rect.left,right-edge-tip.offsetWidth));
   var y=upwards?rect.top-gap-tip.offsetHeight:rect.bottom+gap;
   tip.style.left=x+'px';
   tip.style.top=Math.max(top+edge,Math.min(y,bottom-edge-tip.offsetHeight))+'px';
  }
  function schedule(){if(active&&!frame)frame=requestAnimationFrame(place);}
  // Use LuCI's public events, preserving its tooltip text, severity and triggers.
  document.addEventListener('tooltip-open',function(event){
   var tip=event.target,target=event.detail?.target;
   if(tip.parentElement!==document.body||!target)return;
   close();active={tip:tip,target:target};
   if(tip.firstChild?.nodeType===Node.TEXT_NODE)tip.firstChild.data=tip.firstChild.data.replace(/^[▲▼]\s*/, '');
   tip.setAttribute('role','tooltip');
   place();
   if(active)tip.classList.add('nt-tooltip-open');
  });
  document.addEventListener('tooltip-close',close);
  document.addEventListener('keydown',function(event){if(event.key==='Escape')close();});
  document.addEventListener('pointerdown',function(event){if(active&&!active.target.contains(event.target)&&!active.tip.contains(event.target))close();});
  document.addEventListener('scroll',schedule,true);
  window.addEventListener('resize',schedule);
  if(window.visualViewport){visualViewport.addEventListener('resize',schedule);visualViewport.addEventListener('scroll',schedule);}
  // Polling may replace a hovered row without a mouseout event.
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 }
 function initDhcp() {
  if(document.body.dataset.page!=='admin-network-dhcp')return;
  var root=document.querySelector('#view');if(!root)return;
  var queued=false;
  function count(heading,table){
   if(!heading||!table)return;
   var badge=heading.querySelector('.nt-dhcp-count');
   if(!badge){badge=document.createElement('span');badge.className='nt-dhcp-count';heading.appendChild(badge);}
   var value=String(Array.from(table.rows).filter(function(row){return !row.classList.contains('placeholder')&&row.querySelector('td');}).length)+' 条';
   if(badge.textContent!==value)badge.textContent=value;
  }
  function scan(){
   queued=false;
   var host=root.querySelector('#cbi-dhcp-host');
   if(host){
    var heading=host.querySelector(':scope>h3');
    if(!heading){heading=document.createElement('h3');heading.textContent='静态租约';host.prepend(heading);}
    count(heading,host.querySelector('table'));
    var description=host.querySelector(':scope>.cbi-section-descr');
    if(description&&!description.querySelector('.nt-dhcp-help')){
     var firstBreak=description.querySelector('br');
     if(firstBreak){
      var help=document.createElement('details'),summary=document.createElement('summary'),content=document.createElement('div');
      help.className='nt-dhcp-help';summary.textContent='配置说明';
      var node=firstBreak,started=false;
      while(node){var next=node.nextSibling;if(!started&&node.nodeName==='BR')node.remove();else{started=true;content.appendChild(node);}node=next;}
      help.append(summary,content);description.appendChild(help);
     }
    }
   }
   root.querySelectorAll('#lease_status_table,#lease6_status_table').forEach(function(table){
    var field=table.closest('.cbi-value');if(!field)return;
    field.classList.add('nt-dhcp-active');count(field.querySelector(':scope>h4'),table);
    // Both native tables may include an interface column; keep roles language-independent.
    var headers=table.rows[0];if(!headers)return;
    var roles=table.id==='lease_status_table'?['host','address','mac','duid','iaid','time']:['host','address','duid','iaid','time'];
    if(headers.cells.length===roles.length+1)roles.unshift('interface');
    if(headers.cells.length!==roles.length)return;
    Array.from(table.rows).forEach(function(row){
     if(row.classList.contains('placeholder'))return;
     Array.from(row.cells).forEach(function(cell,index){
      if(roles[index])cell.dataset.ntLeaseRole=roles[index];
     });
    });
   });
  }
  new MutationObserver(function(changes){if(!queued&&changes.some(function(change){return change.addedNodes.length;})){queued=true;requestAnimationFrame(scan);}}).observe(root,{childList:true,subtree:true});
  scan();
 }
 function initRealtime() {
  if(!/^admin-status-realtime-(load|bandwidth|connections)$/.test(document.body.dataset.page||''))return;
  var root=document.querySelector('#view');if(!root)return;
  document.body.classList.add('nt-realtime');
  var palette={load01:'#72d6b7',load05:'#8bbae3',load15:'#b3a4e4',rx:'#72d6b7',tx:'#8bbae3',udp:'#72d6b7',tcp:'#8bbae3',other:'#b3a4e4'};
  var painted=new WeakSet();
  function scan(){
   root.querySelectorAll('svg').forEach(function(svg){
    var line=svg.querySelector('polyline'),panel=svg.closest('.cbi-section');
    if(!line||!palette[line.id]||!panel||painted.has(svg))return;
    painted.add(svg);panel.classList.add('nt-realtime-panel');svg.parentElement.classList.add('nt-realtime-chart');
    svg.setAttribute('role','img');
    var heading=root.querySelector('h2');
    svg.setAttribute('aria-label',((heading&&heading.textContent)||'')+(panel.dataset.tabTitle?' · '+panel.dataset.tabTitle:''));
    svg.querySelectorAll('polyline').forEach(function(series){if(palette[series.id])series.style.setProperty('--nt-series',palette[series.id]);});
    // LuCI calculates points against #view, before the card's padding is applied.
    // Fit that original coordinate space without changing samples or polling.
    function fit(){
     var points=line.points;if(!points.numberOfItems)return false;
     var end=points.getItem(points.numberOfItems-1);
     if(!Number.isFinite(end.x)||!Number.isFinite(end.y)||end.x<=0||end.y<=0)return false;
     svg.setAttribute('viewBox','0 0 '+end.x+' '+end.y);
     svg.setAttribute('preserveAspectRatio','none');return true;
    }
    if(!fit()){
     var pointsObserver=new MutationObserver(function(){if(fit())pointsObserver.disconnect();});
     pointsObserver.observe(line,{attributes:true,attributeFilter:['points']});
    }
    panel.querySelectorAll('table').forEach(function(table){
     if(!table.querySelector('td[id$="_cur"]'))return;
     table.classList.add('nt-realtime-stats');table.setAttribute('role','table');
     Array.from(table.rows).forEach(function(row){
      var current=row.querySelector('td[id$="_cur"]');if(!current)return;
      var key=current.id.replace(/^lb_/,'').replace(/_(bw_)?cur$/,'').replace(/^otr$/,'other');
      row.style.setProperty('--nt-series',palette[key]||palette.load01);
     });
    });
   });
  }
  new MutationObserver(function(changes){
   if(changes.some(function(change){return Array.from(change.addedNodes).some(function(node){return node.nodeType===1&&(node.matches('svg')||node.querySelector('svg'));});}))scan();
  }).observe(root,{childList:true,subtree:true});
  scan();
 }
 function initTables() {
  if(!document.querySelector('#maincontent'))return;
  var resize=new ResizeObserver(function(entries){entries.forEach(function(entry){var el=entry.target,wrap=el.classList.contains('nt-table-scroll')?el:el.parentElement;if(!wrap?.classList.contains('nt-table-scroll'))return;var scrollable=wrap.scrollWidth>wrap.clientWidth+1;wrap.tabIndex=scrollable?0:-1;if(scrollable){wrap.setAttribute('role','region');wrap.setAttribute('aria-label','表格，可左右滚动');}else{wrap.removeAttribute('role');wrap.removeAttribute('aria-label');}});});
  var queued=false,observed=new Set();
  function scan(){
   queued=false;
   observed.forEach(function(el){if(!el.isConnected){resize.unobserve(el);observed.delete(el);}});
   document.querySelectorAll('#maincontent table,#maincontent .table,#modal_overlay table,#modal_overlay .table').forEach(function(table){
    if(table.parentElement.closest('table,.table,.cbi-dropdown'))return;
    var wrap=table.parentElement;
    if(!wrap.classList.contains('nt-table-scroll')){
     wrap=document.createElement('div');wrap.className='nt-table-scroll';table.parentElement.insertBefore(wrap,table);wrap.appendChild(table);
     resize.observe(wrap);resize.observe(table);observed.add(wrap);observed.add(table);
    }
    var row=table.querySelector('tr,.tr');
    var columns=row?Array.from(row.children).filter(function(cell){return cell.matches('th,td,.th,.td');}).reduce(function(count,cell){return count+(cell.colSpan||1);},0):0;
    var isConfig=table.classList.contains('cbi-section-table');
    var rows=Array.from(table.querySelectorAll('tr,.tr')).filter(function(r){return r.closest('table,.table')===table;});
    var emptyConfig=isConfig&&rows.some(function(r){return r.classList.contains('placeholder');})&&rows.every(function(r){return r.matches('.placeholder,.cbi-section-table-titles,.cbi-section-table-descr');});
    wrap.classList.toggle('nt-table-wide',columns>=5&&!emptyConfig);
    wrap.classList.toggle('nt-config-table',isConfig);
    wrap.classList.toggle('nt-empty-config',emptyConfig);
    // Native legacy empty rows lack colspan and use an absolutely positioned cell.
    // Keep real table cells in normal flow so borders, height and scrolling line up.
    if(table.tagName==='TABLE'&&columns){
     table.querySelectorAll('tr.placeholder').forEach(function(empty){
      if(empty.closest('table')!==table)return;
      if(empty.children.length===1&&empty.firstElementChild.tagName==='TD')empty.firstElementChild.colSpan=columns;
     });
    }
    table.querySelectorAll('.cbi-section-table-descr').forEach(function(description){
     if(description.closest('table,.table')!==table)return;
     var empty=!description.textContent.trim()&&!description.querySelector('input:not([type=hidden]),select,button,img,svg,[title],[data-tooltip]');
     description.classList.toggle('nt-empty-description',empty);
    });
   });
  }
  new MutationObserver(function(changes){if(!queued&&changes.some(function(change){return change.addedNodes.length;})){queued=true;requestAnimationFrame(scan);}}).observe(document.body,{childList:true,subtree:true});
  scan();
 }
 function initMetrics() {
  if(metricsStarted || !document.body.classList.contains('nt-overview') || !window.L)return;metricsStarted=true;
  var container=document.querySelector('#nt-metrics');container.hidden=false;
  var specs=[['运行时间','clock','up','本次启动后持续运行'],['系统负载','cpu','load','1 分钟平均负载 · 实时采样'],['内存使用','memory','ram','读取中…'],['可用存储','disk','storage','读取中…']];
  specs.forEach(function(s){var card=document.createElement('article');card.className='nt-metric';card.innerHTML='<div class="nt-metric-head"><span></span><span class="nt-metric-icon" data-nt-icon="'+s[1]+'"></span></div><div class="nt-metric-value" id="nt-value-'+s[2]+'">—</div><div class="nt-metric-note" id="nt-note-'+s[2]+'"></div>'+(s[2]==='load'?'<svg class="nt-sparkline" viewBox="0 0 180 23" preserveAspectRatio="none" aria-label="实际采样的系统负载趋势"><polyline points=""/></svg>':'<div class="nt-meter"><span id="nt-bar-'+s[2]+'"></span></div>');card.querySelector('.nt-metric-head>span').textContent=s[0];card.querySelector('.nt-metric-note').textContent=s[3];container.appendChild(card);});icons(container);
  var samples=[];
  function val(id,value,unit){var el=document.querySelector('#nt-value-'+id),key=value+'|'+(unit||'');if(el.dataset.value===key)return;var previous=el.dataset.value;el.dataset.value=key;var number=document.createElement('span');number.className='nt-metric-number';number.textContent=value;el.replaceChildren(number);if(unit){var s=document.createElement('small');s.textContent=unit;el.appendChild(s);}if(previous&&el.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)el.animate([{opacity:.45,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});}
  function bar(id,pct){document.querySelector('#nt-bar-'+id).style.width=Math.min(100,Math.max(0,pct))+'%';}
  L.require('rpc').then(function(rpc){return Promise.all([rpc.declare({object:'system',method:'info',expect:{'':{}}}),L.require('poll')]);}).then(function(api){var info=api[0],poll=api[1];function update(){if(document.hidden)return Promise.resolve();return info().then(function(data){if(!Number.isFinite(data.uptime) || !data.memory)throw new Error('Missing system data');var days=Math.floor(data.uptime/86400),hours=Math.floor(data.uptime/3600)%24,minutes=Math.floor(data.uptime/60)%60;val('up',days?days+' 天 '+hours:hours+' 小时 '+minutes,days?'小时':'分钟');bar('up',(data.uptime%86400)/864);
    var load=(data.load?.[0]||0)/65536;val('load',load.toFixed(2));samples.push(load);if(samples.length>30)samples.shift();var max=Math.max(.1,...samples);document.querySelector('.nt-sparkline polyline').setAttribute('points',samples.map(function(n,i){return (i*180/Math.max(1,samples.length-1)).toFixed(1)+','+(21-n/max*18).toFixed(1);}).join(' '));
    var mem=data.memory,total=mem.total,available=mem.available??(mem.free+(mem.buffered||0)+(mem.cached||0)),used=Math.max(0,total-available),pct=total?used/total*100:0;val('ram',pct.toFixed(1),'%');bar('ram',pct);document.querySelector('#nt-note-ram').textContent=(used/1073741824).toFixed(2)+' / '+(total/1073741824).toFixed(1)+' GiB';
    if(data.root && data.root.total){var free=data.root.avail??data.root.free;val('storage',(free/1048576).toFixed(1),'GiB');bar('storage',100-free/data.root.total*100);document.querySelector('#nt-note-storage').textContent='已用 '+((1-free/data.root.total)*100).toFixed(1)+'% · 共 '+(data.root.total/1048576).toFixed(1)+' GiB';}
    else{val('storage','—');document.querySelector('#nt-note-storage').textContent='设备未提供存储数据';}
    document.querySelector('#nt-note-load').textContent='1 分钟平均负载 · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});container.classList.remove('nt-stale');
   }).catch(function(){container.classList.add('nt-stale');container.querySelectorAll('.nt-metric-note').forEach(function(el){el.textContent='刷新失败 · 等待重试';});});}update();poll.add(update,10);poll.start();}).catch(function(){container.querySelectorAll('.nt-metric-note').forEach(function(el){el.textContent='暂时无法读取设备数据';});});
 }
 function login() {
  var btn=document.querySelector('#nt-password-toggle'),input=document.querySelector('#luci_password');
  if(btn&&input)btn.addEventListener('click',function(){
   var show=input.type==='password';input.type=show?'text':'password';
   btn.setAttribute('aria-pressed',String(show));
   btn.setAttribute('aria-label',show?(btn.dataset.labelHide||'隐藏密码'):(btn.dataset.labelShow||'显示密码'));
   var path=btn.querySelector('path');if(path)path.setAttribute('d',paths[show?'eyeOff':'eye']);
  });
  var form=document.querySelector('.nt-login-form');
  if(!form)return;
  var fields=Array.from(form.querySelectorAll('input[required]')),focusQueued=false;
  fields.forEach(function(field){
   var hint=document.createElement('span');hint.id=field.id+'-error';hint.className='nt-login-field-error';hint.hidden=true;hint.setAttribute('role','alert');
   (field.closest('.nt-password-wrap')||field).after(hint);
   var describedBy=field.getAttribute('aria-describedby');
   field.setAttribute('aria-describedby',(describedBy?describedBy+' ':'')+hint.id);
   function clear(){field.removeAttribute('aria-invalid');hint.hidden=true;hint.textContent='';}
   function update(){if(field.validity.valid)clear();}
   field.addEventListener('input',update);field.addEventListener('change',update);
   field.addEventListener('invalid',function(event){
    // Keep native required validation and POST handling, but replace the browser's floating bubble.
    event.preventDefault();field.setAttribute('aria-invalid','true');hint.hidden=false;
    hint.textContent=field.validity.valueMissing?(field.id==='luci_password'?'请输入密码':'请输入用户名'):field.validationMessage;
    if(!focusQueued){focusQueued=true;requestAnimationFrame(function(){focusQueued=false;var first=fields.find(function(item){return !item.validity.valid;});if(first)first.focus();});}
   });
   form.addEventListener('submit',clear);
  });
  form.addEventListener('submit',function(){var button=form.querySelector('[type=submit]');button.disabled=true;button.querySelector('span').textContent='登录中…';});
 }
 document.addEventListener('wm-menu-ready',function(){icons();initMetrics();});
 initScrollRestoration();initShell();login();initMetrics();initTooltips();initTables();initTabs();initPartexp();initPasswallStatus();initPasswallDropdowns();initSaveNotices();initApplyStatus();initRealtime();initDhcp();
})();
