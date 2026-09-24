'use strict';
'require baseclass';
'require ui';
'require session';

return baseclass.extend({
 __init__: function() {
  var menuVersion = '1.13.29';
  if (session.getLocalData('wm.menu.version') !== menuVersion) {
   // LuCI keeps menu data in both the current module and the browser session.
   ui.menu.flushCache();
   ui.menu.menu = null;
  }
  ui.menu.load().then(function(tree) {
   session.setLocalData('wm.menu.version',menuVersion);
   this.render(tree);
  }.bind(this)).catch(function() { document.querySelector('#nt-navigation').textContent = _('Unable to load menu'); });
 },
 render: function(tree) {
  var path = L.env.dispatchpath || [], root = tree.children[path[0] || 'admin'];
  var nav = document.querySelector('#nt-navigation');
  if (!root || !nav) return;
  nav.textContent = '';
  var flyout = null;
  function isCollapsed() { return document.body.classList.contains('nt-sidebar-collapsed'); }
  function syncGroups() {
   nav.querySelectorAll('.nt-nav-group').forEach(function(section) {
    var open = section.classList.contains(isCollapsed() ? 'is-flyout' : 'is-open');
    section.querySelector('.nt-submenu').inert = !open;
    section.querySelector('.nt-nav-group-button').setAttribute('aria-expanded', String(open));
   });
  }
  function closeFlyout(restoreFocus) {
   var previous = flyout;
   if (!previous) return;
   previous.classList.remove('is-flyout');flyout = null;syncGroups();
   if (restoreFocus) previous.querySelector('button').focus();
  }
  function placeFlyout() {
   if (!flyout) return;
   var button = flyout.querySelector('button'), sub = flyout.querySelector('.nt-submenu');
   var rect = button.getBoundingClientRect(), navRect = nav.getBoundingClientRect();
   if (rect.bottom < navRect.top || rect.top > navRect.bottom) { closeFlyout(); return; }
   sub.style.setProperty('--nt-flyout-left', (document.querySelector('#nt-sidebar').getBoundingClientRect().right + 10) + 'px');
   sub.style.setProperty('--nt-flyout-top', Math.max(12, Math.min(rect.top, innerHeight - sub.offsetHeight - 12)) + 'px');
  }
  function openFlyout(section, focusFirst) {
   closeFlyout();flyout = section;section.classList.add('is-flyout');syncGroups();placeFlyout();
   if (focusFirst) section.querySelector('.nt-sub-link')?.focus();
  }
  document.addEventListener('wm-sidebar-change', function() { closeFlyout();syncGroups(); });
  document.addEventListener('pointerdown', function(event) { if (flyout && !flyout.contains(event.target)) closeFlyout(); });
  document.addEventListener('focusin', function(event) { if (flyout && !flyout.contains(event.target)) closeFlyout(); });
  document.addEventListener('keydown', function(event) { if (event.key === 'Escape' && flyout) { event.preventDefault();closeFlyout(true); } });
  window.addEventListener('resize', function() { closeFlyout();syncGroups(); });
  nav.addEventListener('scroll', placeFlyout);
  var home = root.children?.wm?.children?.home;
  var hasHome = home && home.satisfied !== false;
  if (hasHome && path[1] === 'status' && (!path[2] || path[2] === 'overview')) {
   window.location.replace(L.url('admin','wm','home') + window.location.search + window.location.hash);
   return;
  }
  var isHome = hasHome && path[1] === 'wm' && path[2] === 'home';
  var homeTitle = _('Home');
  var searchItems = [], activeTitle = isHome ? homeTitle : '', activeGroup = '';
  var icons = {index:'home',status:'activity',system:'settings',services:'layers',network:'network',vpn:'shield',nas:'server',docker:'box',statistics:'chart',control:'sliders'};
  if (hasHome) {
   var homeUrl = L.url('admin','wm','home');
   nav.appendChild(E('a',{'class':'nt-nav-link'+(isHome?' active':''),'href':homeUrl,'title':homeTitle,'aria-current':isHome?'page':null},[E('span',{'class':'nt-nav-icon','data-nt-icon':'home'}),E('span',{'class':'nt-nav-text'},homeTitle)]));
   searchItems.push({title:homeTitle,group:'',url:homeUrl});
  }
  ui.menu.getChildren(root).forEach(function(group) {
   if (group.name === 'logout' || group.name === 'wm' || (hasHome && group.name === 'index')) return;
   var children = ui.menu.getChildren(group), selected = path[1] === group.name;
   if (hasHome && group.name === 'status') {
    children = children.filter(function(child) { return child.name !== 'overview'; });
    if (!children.length) return;
   }
   var title = _(group.title), icon = icons[group.name] || 'grid';
   if (!children.length) {
    nav.appendChild(E('a',{'class':'nt-nav-link'+(selected?' active':''),'href':L.url('admin',group.name),'title':title},[E('span',{'class':'nt-nav-icon','data-nt-icon':icon}),E('span',{'class':'nt-nav-text'},title)]));
    searchItems.push({title:title, group:'', url:L.url('admin',group.name)});
    if(selected) {activeTitle=title;activeGroup=title;}
    return;
   }
   var section = E('div', {'class':'nt-nav-group'+(selected?' is-open is-current':''),'data-group':group.name});
   var btn = E('button', {'class':'nt-nav-group-button','type':'button','aria-expanded':selected?'true':'false','aria-controls':'nt-sub-'+group.name,'title':title},[E('span',{'class':'nt-nav-icon','data-nt-icon':icon}),E('span',{'class':'nt-nav-text'},title),E('span',{'class':'nt-chevron','data-nt-icon':'chevron'})]);
   var sub = E('div',{'class':'nt-submenu','id':'nt-sub-'+group.name});
   var list = E('div',{'class':'nt-submenu-inner'});
   children.forEach(function(child) {
    var isActive = selected && (path[2] === child.name || (!path[2] && child === children[0]));
    var childTitle = _(child.title), url = L.url('admin',group.name,child.name);
    list.appendChild(E('a',{'class':'nt-sub-link'+(isActive?' active':''),'href':url,'aria-current':isActive?'page':null},[E('span',{'class':'nt-sub-dot','aria-hidden':'true'}),E('span',{'class':'nt-sub-label'},childTitle)]));
    searchItems.push({title:childTitle,group:title,url:url});
    if(isActive) {activeTitle=childTitle;activeGroup=title;}
    ui.menu.getChildren(child).forEach(function(tab) {searchItems.push({title:_(tab.title),group:title+' / '+childTitle,url:L.url('admin',group.name,child.name,tab.name)});});
   });
   sub.appendChild(E('div',{'class':'nt-submenu-title'},title));sub.appendChild(list); section.appendChild(btn); section.appendChild(sub); nav.appendChild(section);
   if(!selected) sub.inert=true;
   btn.addEventListener('click',function() {
    if(isCollapsed()) { if(flyout===section)closeFlyout();else openFlyout(section);return; }
    var opened=section.classList.toggle('is-open'); btn.setAttribute('aria-expanded',String(opened)); sub.inert=!opened;
   });
   btn.addEventListener('keydown',function(event) {
    if(isCollapsed() && (event.key==='ArrowRight'||event.key==='ArrowDown')) { event.preventDefault();openFlyout(section,true); }
   });
   sub.addEventListener('keydown',function(event) {
    if(!isCollapsed() || !['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    var links=Array.from(list.querySelectorAll('a')),index=links.indexOf(document.activeElement);
    if(index<0)return;event.preventDefault();
    index=event.key==='Home'?0:event.key==='End'?links.length-1:(index+(event.key==='ArrowDown'?1:-1)+links.length)%links.length;
    links[index].focus();
   });
  });
  syncGroups();
  var node=root, url='admin';
  for(var i=1;i<3 && node;i++) {node=node.children?.[path[i]]; if(path[i]) url+='/'+path[i];}
  if(node) this.renderTabs(node,url,0);
  var breadcrumbs=[],crumbNode=root;
  if(isHome)breadcrumbs.push({title:homeTitle});
  else for(var depth=1;depth<path.length;depth++) {
   crumbNode=crumbNode?.children?.[path[depth]];
   if(!crumbNode)break;
   if(crumbNode.title)breadcrumbs.push({title:_(crumbNode.title)});
  }
  if(!breadcrumbs.length&&activeTitle)breadcrumbs.push({title:activeTitle});
  var currentPage=document.querySelector('#nt-current-page');
  // The header renders the full trail before the first paint. Keep those nodes
  // in place; this fallback supports headers that do not provide a trail yet.
  if(currentPage&&!currentPage.querySelector('.nt-crumb-trail')&&breadcrumbs.length){
   var trail=document.createElement('ol');trail.className='nt-crumb-trail';
   breadcrumbs.forEach(function(crumb,index){
    var last=index===breadcrumbs.length-1,item=E('li',{'class':last?'nt-crumb-last':'nt-crumb-parent'});
    item.appendChild(E('span',{'aria-current':last?'page':null,'title':crumb.title},crumb.title));trail.appendChild(item);
   });
   currentPage.replaceChildren(trail);
   currentPage.closest('.nt-breadcrumb').setAttribute('aria-label','当前位置：'+breadcrumbs.map(function(c){return c.title;}).join(' › '));
  }
  var isOverview=isHome || (path[1]==='status' && (!path[2] || path[2]==='overview'));
  document.body.classList.toggle('nt-overview',isOverview);
  window.wmMenuItems=searchItems;
  document.dispatchEvent(new CustomEvent('wm-menu-ready',{detail:{overview:isOverview}}));
 },
 renderTabs: function(tree,url,level) {
  var children=ui.menu.getChildren(tree); if(!children.length) return;
  var ul=E('ul',{'class':'tabs'}), current=null;
  children.forEach(function(child) {
   var active=L.env.dispatchpath[3+level]===child.name;
   ul.appendChild(E('li',{'class':'tabmenu-item-'+child.name+(active?' active':'')},E('a',{'href':L.url(url,child.name)},_(child.title))));
   if(active) current=child;
  });
  var container=document.querySelector('#tabmenu');container.appendChild(ul);container.style.display='';
  if(current) this.renderTabs(current,url+'/'+current.name,level+1);
 }
});
