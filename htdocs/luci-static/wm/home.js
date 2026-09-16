/* wm home layout. Native LuCI sections retain their controls and data updates. */
(function () {
 'use strict';
 var started=false;
 var motion=matchMedia('(prefers-reduced-motion: reduce)');
 function init() {
  if(started||!document.body.classList.contains('nt-overview'))return;
  started=true;
  var view=document.querySelector('#view');
  if(!view)return;
  var leaseFamily=null,leaseDetails=false;
  function placePortTooltip(trigger) {
   var tooltip=trigger.querySelector(':scope > .cbi-tooltip');
   if(!tooltip)return;
   // The tag/traffic control is the anchor, not the surrounding port card.
   var rect=trigger.getBoundingClientRect(),viewport=window.visualViewport;
   var left=viewport?viewport.offsetLeft:0,top=viewport?viewport.offsetTop:0;
   var width=Math.min(document.documentElement.clientWidth,viewport?viewport.width:innerWidth);
   var height=viewport?viewport.height:innerHeight,gap=8,edge=12;
   var header=document.querySelector('.nt-topbar');
   var upper=Math.max(top+edge,header?header.getBoundingClientRect().bottom+gap:0);
   tooltip.style.setProperty('--nt-port-tooltip-shift','0px');
   tooltip.style.setProperty('--nt-port-tooltip-height',Math.max(1,height-edge*2)+'px');
   var below=Math.max(0,top+height-edge-rect.bottom-gap),above=Math.max(0,rect.top-upper-gap);
   var upwards=tooltip.offsetHeight>below&&above>below;
   trigger.classList.toggle('nt-port-tooltip-above',upwards);
   tooltip.style.setProperty('--nt-port-tooltip-height',Math.max(1,upwards?above:below)+'px');
   var box=tooltip.getBoundingClientRect();
   var x=Math.max(left+edge,Math.min(box.left,left+width-edge-box.width));
   tooltip.style.setProperty('--nt-port-tooltip-shift',(x-box.left)+'px');
  }
  function onPortTooltip(event) {
   var trigger=event.target.closest('.nt-port-network-row,.nt-port-traffic');
   if(trigger&&!trigger.contains(event.relatedTarget))placePortTooltip(trigger);
  }
  var tooltipFrame=0;
  function updatePortTooltips() {
   if(tooltipFrame)return;
   tooltipFrame=requestAnimationFrame(function(){
    tooltipFrame=0;
    view.querySelectorAll('.nt-port-network-row:is(:hover,:focus),.nt-port-traffic:is(:hover,:focus)').forEach(placePortTooltip);
   });
  }
  view.addEventListener('pointerover',onPortTooltip);
  view.addEventListener('focusin',onPortTooltip);
  document.addEventListener('scroll',updatePortTooltips,true);
  window.addEventListener('resize',updatePortTooltips);
  if(window.visualViewport){visualViewport.addEventListener('resize',updatePortTooltips);visualViewport.addEventListener('scroll',updatePortTooltips);}
  var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){
   if(entry.isIntersecting){entry.target.classList.remove('nt-home-pending');entry.target.classList.add('nt-home-visible');observer.unobserve(entry.target);}
  });},{threshold:.04});
  var seen=new WeakSet();
  function reveal(el,index) {
   if(seen.has(el))return;seen.add(el);
   if(motion.matches)return;
   el.style.setProperty('--nt-reveal-delay',Math.min(index,3)*65+'ms');
   el.classList.add('nt-home-pending');observer.observe(el);
  }
  motion.addEventListener('change',function(event){if(event.matches){
   document.querySelectorAll('.nt-home-pending').forEach(function(el){el.classList.remove('nt-home-pending');});observer.disconnect();
  }});
  var rules=[['ports',/^(端口状态|Ports)$/i],['system',/^(系统|System)$/i],['cpu',/^CPU$/i],['memory',/^(内存|Memory)$/i],['network',/^(网络|Network)$/i],['storage',/^(存储|Storage)$/i],['dhcp',/^(DHCP 租约|DHCP Leases)$/i],['wireless',/^(无线|Wireless)$/i]];
  function composeDevice(sections) {
   var system=sections.find(function(el){return el.dataset.wmPanel==='system';});
   var resources=sections.filter(function(el){return /^(cpu|memory)$/.test(el.dataset.wmPanel);});
   if(!system||!resources.length)return sections;
   var group=view.querySelector(':scope > .nt-home-device-grid');
   if(!group){group=document.createElement('div');group.className='nt-home-device-grid';view.appendChild(group);}
   var resourceCard=group.querySelector('.nt-home-resources');
   if(!resourceCard){resourceCard=document.createElement('div');resourceCard.className='nt-home-resources';group.appendChild(resourceCard);}
   if(system.parentElement!==group)group.insertBefore(system,resourceCard);
   resources.forEach(function(el){if(el.parentElement!==resourceCard)resourceCard.appendChild(el);});
   return sections.filter(function(el){return !resources.includes(el);}).map(function(el){return el===system?group:el;});
  }
  function resourceReadouts() {
   view.querySelectorAll('[data-wm-panel=cpu] .cbi-progressbar,[data-wm-panel=memory] .cbi-progressbar,[data-wm-panel=network] .cbi-progressbar').forEach(function(bar){
    var title=bar.getAttribute('title')||'';
    if(!title||bar.dataset.wmReading===title)return;
    var section=bar.closest('[data-wm-panel]'),row=bar.closest('tr,.tr');
    var label=row&&row.querySelector('td,.td');
    var reading=bar.parentElement.querySelector('.nt-resource-readout');
    if(!reading){reading=document.createElement('div');reading.className='nt-resource-readout';bar.before(reading);}
    var parts=title.match(/^(.*?)\s*\/\s*(.*?)\s+\(([^()]*)\)$/);
    var value=document.createElement('strong'),detail=document.createElement('span');
    value.textContent=section.dataset.wmPanel==='cpu'?title.split('/')[0].trim():(parts?parts[1]:title);
    if(parts)detail.textContent='/ '+parts[2]+' · '+parts[3];
    reading.replaceChildren(value,detail);
    bar.dataset.wmReading=title;
    bar.classList.add('nt-resource-meter');
    bar.setAttribute('role','progressbar');
    bar.setAttribute('aria-label',({cpu:'CPU',memory:'内存',network:'网络'}[section.dataset.wmPanel])+' '+(label?label.textContent:''));
    bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');
    var percent=parseFloat(bar.firstElementChild?.style.width);
    if(Number.isFinite(percent))bar.setAttribute('aria-valuenow',String(Math.min(100,Math.max(0,percent))));
    bar.setAttribute('aria-valuetext',title);
   });
  }
  function portCards() {
   var section=view.querySelector('[data-wm-panel=ports]');
   if(!section)return;
   var boxes=Array.from(section.querySelectorAll('.ifacebox'));
   boxes.forEach(function(box){
    // Each native poll replaces the cards. Decorate once, keeping its tooltip nodes.
    if(box.classList.contains('nt-port-card'))return;
    var img=box.querySelector(':scope > .ifacebox-body > img');
    var state=img&&img.src.match(/\/port_(?:pse_)?(up|down)\.svg(?:\?|$)/);
    if(!state)return;
    var up=state[1]==='up',head=box.firstElementChild,body=img.parentElement;
    var name=head.textContent.trim();
    box.classList.add('nt-port-card',up?'nt-port-connected':'nt-port-disconnected');
    box.parentElement.classList.add('nt-ports-grid');
    var label=document.createElement('span'),status=document.createElement('span');
    label.className='nt-port-name';label.textContent=name;
    status.className='nt-port-status';status.textContent=up?'已连接':'未连接';
    head.classList.add('nt-port-head');head.replaceChildren(label,status);
    var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','nt-port-glyph');svg.setAttribute('aria-hidden','true');
    var path=document.createElementNS(svg.namespaceURI,'path');
    path.setAttribute('d','M4 4h16v12h-4v4H8v-4H4z M8 4v5 M12 4v5 M16 4v5 M8 13h8');
    svg.appendChild(path);img.remove();
    body.querySelectorAll(':scope > br').forEach(function(br){br.remove();});
    var speed=document.createElement('div'),value=document.createElement('div');
    speed.className='nt-port-speed';value.className='nt-port-speed-value';speed.setAttribute('aria-label','链路速率');
    while(body.firstChild)value.appendChild(body.firstChild);
    var speedNode=value.firstElementChild;
    var parts=up&&value.textContent.trim().match(/^([\d.]+)\s*(\S+)$/);
    if(parts&&speedNode&&speedNode.childElementCount===0){
     var number=document.createElement('strong'),unit=document.createElement('small');
     number.textContent=parts[1];unit.textContent=parts[2];speedNode.replaceChildren(number,unit);
    }
    if(!up)value.textContent='—';
    speed.append(value);body.classList.add('nt-port-link');body.append(svg,speed);
    var networks=box.querySelector(':scope > .ifacebox-head.cbi-tooltip-container');
    if(networks){
     var names=Array.from(networks.querySelectorAll('.ifacebadge')).map(function(badge){
      return Array.from(badge.childNodes).filter(function(n){return n.nodeType===3;}).map(function(n){return n.textContent;}).join('').replace(/:\s*$/,'').trim();
     }).filter(Boolean);
     var tags=document.createElement('span');tags.className='nt-port-networks';
     Array.from(new Set(names)).forEach(function(name){var tag=document.createElement('span');tag.textContent=/^(wan|lan)$/i.test(name)?name.toUpperCase():name;tags.appendChild(tag);});
     if(!names.length){var tag=document.createElement('span');tag.textContent='未分配网络';tags.appendChild(tag);}
     networks.classList.add('nt-port-network-row');networks.prepend(tags);networks.tabIndex=0;
     networks.setAttribute('aria-label',name+'，所属网络：'+(names.join('、')||'未分配'));
     head.insertBefore(networks,status);
    }
    var traffic=box.querySelector(':scope > .ifacebox-body:last-child > .cbi-tooltip-container');
    if(traffic){
     var totals={};
     Array.from(traffic.childNodes).forEach(function(n){if(n.nodeType!==3)return;var m=n.textContent.trim().match(/^([▲▼])\s*(.+)$/);if(m){totals[m[1]]=m[2];}});
     if(totals['▲']&&totals['▼']){
      Array.from(traffic.childNodes).forEach(function(n){if(n.nodeType===3||n.nodeName==='BR')n.remove();});
      var grid=document.createElement('div');grid.className='nt-port-totals';
      [['▲','↑','累计发送'],['▼','↓','累计接收']].forEach(function(spec){
       var item=document.createElement('div'),title=document.createElement('span'),arrow=document.createElement('i'),amount=document.createElement('strong');
       arrow.textContent=spec[1];arrow.setAttribute('aria-hidden','true');title.append(arrow,document.createTextNode(spec[2]));amount.textContent=totals[spec[0]];item.append(title,amount);grid.appendChild(item);
      });
      traffic.prepend(grid);traffic.classList.add('nt-port-traffic');traffic.parentElement.classList.add('nt-port-footer');traffic.tabIndex=0;
      traffic.setAttribute('aria-label',name+'，累计发送 '+totals['▲']+'，累计接收 '+totals['▼']+'，详细统计');
     }
    }
   });
   var title=section.querySelector('.cbi-title h3');
   if(title&&boxes.length){
    var summary=title.querySelector('.nt-ports-summary');
    if(!summary){summary=document.createElement('span');summary.className='nt-ports-summary';title.insertBefore(summary,title.querySelector('.label'));}
    var text=boxes.filter(function(box){return box.classList.contains('nt-port-connected');}).length+' / '+boxes.length+' 已连接';
    if(summary.textContent!==text)summary.textContent=text;
   }
  }
  function networkCards() {
   var section=view.querySelector('[data-wm-panel=network]');
   if(!section)return;
   var content=section.children[1];
   if(!content)return;
   content.classList.add('nt-network-content');
   content.querySelectorAll('.network-status-table > .ifacebox').forEach(function(box){
    if(box.classList.contains('nt-uplink-card'))return;
    var head=box.querySelector(':scope > .ifacebox-head'),body=box.querySelector(':scope > .ifacebox-body');
    if(!head||!body)return;
    box.classList.add('nt-uplink-card');
    head.classList.add('nt-uplink-head');
    var fields=body.querySelector(':scope > span'),device=body.querySelector(':scope > div');
    if(fields)fields.classList.add('nt-uplink-fields');
    if(device)device.classList.add('nt-uplink-device');
   });
   content.querySelectorAll(':scope > table,:scope > .nt-table-scroll > table').forEach(function(table){table.classList.add('nt-network-stats');});
  }
  function driveCards() {
   var sections=Array.from(document.querySelectorAll('#maincontent > .includes > .cbi-section:not(.nt-drive-panel),#maincontent > .includes > .nt-drive-panel > .nt-drive-body > .cbi-section')).filter(function(section){
    var heading=section.querySelector(':scope > h3');return heading&&/^(NVMe SSD|磁盘|Disks?)$/i.test(heading.textContent.trim());
   });
   function restoreSource(section) {
    section.querySelector(':scope > .nt-drive-grid')?.remove();
    section.querySelectorAll('.nt-drive-source').forEach(function(node){node.classList.remove('nt-drive-source');});
    section.classList.remove('nt-drive-section','nt-drive-empty');section._wmDriveSignature=null;
   }
   sections.forEach(function(section){
    var heading=section.querySelector(':scope > h3');
    var table=section.querySelector(':scope > .nt-table-scroll > table,:scope > table');
    if(!table||!table.rows.length){restoreSource(section);return;}
    var text=function(node){return node.textContent.replace(/\s+/g,' ').trim();};
    var headers=Array.from(table.rows[0].cells).map(text);
    if(headers.length<5||!/^(Capacity|容量)$/i.test(headers[4])){restoreSource(section);return;}
    var signature=table.textContent;
    if(section._wmDriveSignature===signature)return;
    var rows=Array.from(table.rows).slice(1),devices=[];
    rows.forEach(function(row,index){
     if(row.cells.length!==headers.length||!text(row.cells[0]))return;
     var cells=Array.from(row.cells).map(text),parts=[];
     for(var i=index+1;i<rows.length&&rows[i].cells.length!==headers.length;i++){
      rows[i].querySelectorAll('table').forEach(function(partsTable){
       Array.from(partsTable.rows).forEach(function(partRow){
        Array.from(partRow.cells).forEach(function(cell){if(!cell.querySelector('table')&&text(cell))parts.push(text(cell));});
       });
      });
     }
     devices.push({name:cells[0],model:cells[1],capacity:cells[4],fields:cells.map(function(value,i){return {label:headers[i],value:value};}).filter(function(field,i){return i>1&&i!==4;}),parts:parts});
    });
    // Unknown row formats keep their native table. Empty tables get a compact empty state.
    if(!devices.length&&rows.some(function(row){return row.cells.length&&text(row);})){restoreSource(section);return;}
    var grid=document.createElement('div');grid.className='nt-drive-grid';
    var labels={'Serial number':'序列号','Firmware':'固件版本','Sector size':'扇区大小','Power state':'电源状态'};
    devices.forEach(function(device){
     var card=document.createElement('article'),head=document.createElement('div'),identity=document.createElement('div'),name=document.createElement('span'),model=document.createElement('strong'),capacity=document.createElement('div'),amount=document.createElement('strong'),caption=document.createElement('span');
     card.className='nt-drive-card';head.className='nt-drive-head';identity.className='nt-drive-identity';name.className='nt-drive-name';name.textContent=device.name;model.textContent=device.model||'—';
     var meta=document.createElement('div');meta.className='nt-drive-meta';meta.appendChild(name);
     if(/^NVMe/i.test(heading.textContent.trim())){var kind=document.createElement('span');kind.className='nt-drive-kind';kind.textContent='NVMe';meta.appendChild(kind);}
     identity.append(meta,model);
     capacity.className='nt-drive-capacity';amount.textContent=device.capacity||'—';caption.textContent='容量';capacity.append(amount,caption);
     var svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');
     svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','nt-drive-icon');svg.setAttribute('aria-hidden','true');path.setAttribute('d','M5 3h14v18H5z M8 7h8v6H8z M8 17h.01 M12 17h.01 M16 17h.01');svg.appendChild(path);
     head.append(svg,identity,capacity);card.appendChild(head);
     var details=document.createElement('dl');details.className='nt-drive-details';
     device.fields.forEach(function(field){var group=document.createElement('div'),label=document.createElement('dt'),value=document.createElement('dd');label.textContent=labels[field.label]||field.label;value.textContent=field.value||'—';group.append(label,value);details.appendChild(group);});
     card.appendChild(details);
     if(device.parts.length&&(device.parts.length!==1||device.parts[0]!==device.capacity)){
      var parts=document.createElement('div'),label=document.createElement('span');parts.className='nt-drive-parts';label.textContent='分区';parts.appendChild(label);
      device.parts.forEach(function(value){var part=document.createElement('span');part.textContent=value;parts.appendChild(part);});card.appendChild(parts);
     }
     grid.appendChild(card);
    });
    if(!devices.length){var empty=document.createElement('p');empty.className='nt-drive-empty-state';empty.textContent='暂无设备';grid.appendChild(empty);}
    var previous=section.querySelector(':scope > .nt-drive-grid');
    if(previous)previous.replaceWith(grid);else section.appendChild(grid);
    section.classList.add('nt-drive-section');section.classList.toggle('nt-drive-empty',!devices.length);
    table.closest('.nt-table-scroll')?.classList.add('nt-drive-source');
    table.classList.add('nt-drive-source');section._wmDriveSignature=signature;
   });
   if(!sections.length)return;
   var panel=document.querySelector('#maincontent > .includes > .nt-drive-panel');
   if(!panel){
    panel=document.createElement('section');panel.className='cbi-section nt-drive-panel';
    var title=document.createElement('h3'),body=document.createElement('div'),empty=document.createElement('p');
    title.textContent='磁盘';body.className='nt-drive-body';empty.className='nt-drive-empty-state';empty.textContent='暂无设备';empty.hidden=true;
    panel.append(title,body,empty);sections[0].before(panel);
   }
   var body=panel.querySelector(':scope > .nt-drive-body');
   sections.forEach(function(section){
    section.classList.add('nt-drive-member');section.classList.remove('nt-home-pending','nt-home-visible');
    if(section.parentElement!==body)body.appendChild(section);
   });
   var hasContent=sections.some(function(section){return !section.classList.contains('nt-drive-empty');});
   panel.querySelector(':scope > .nt-drive-empty-state').hidden=hasContent;
   panel.classList.toggle('nt-drive-panel-empty',!hasContent);
  }
  function applyLeaseView(section) {
   section.classList.toggle('nt-lease-details-on',leaseDetails);
   section.querySelectorAll('.nt-lease-scroll').forEach(function(wrap){wrap.hidden=wrap.dataset.wmFamily!==leaseFamily;});
   section.querySelectorAll('.nt-lease-family-button').forEach(function(button){
    var selected=button.dataset.wmFamily===leaseFamily;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));
   });
   section.querySelector('.nt-lease-details-button')?.setAttribute('aria-pressed',String(leaseDetails));
  }
  function leaseTables() {
   var section=view.querySelector('[data-wm-panel=dhcp]');if(!section)return;
   var tables=Array.from(section.querySelectorAll('#status_leases,#status_leases6'));
   if(!tables.length)return;
   var counts={};
   tables.forEach(function(table){
    var family=table.id==='status_leases6'?'6':'4',rows=Array.from(table.rows),header=rows[0];
    if(!header)return;
    var wrap=table.parentElement;
    if(!wrap.classList.contains('nt-table-scroll')){wrap=document.createElement('div');wrap.className='nt-table-scroll';table.before(wrap);wrap.appendChild(table);}
    wrap.classList.add('nt-lease-scroll');wrap.dataset.wmFamily=family;
    if(wrap.previousElementSibling?.tagName==='H3')wrap.previousElementSibling.classList.add('nt-lease-native-heading');
    table.classList.add('nt-lease-table');
    counts[family]=rows.filter(function(row){return !row.classList.contains('placeholder')&&row.querySelector('td');}).length;
    var columns=Array.from(header.cells).map(function(cell){
     var label=cell.textContent.trim(),role='other';
     if(/^(主机名|Hostname)$/i.test(label))role='host';
     else if(/^IPv[46]/i.test(label))role='address';
     else if(/^MAC/i.test(label))role='mac';
     else if(/^DUID$/i.test(label))role='duid';
     else if(/^(IAID|身份关联标识符)$/i.test(label))role='iaid';
     else if(/^(接口|Interface)$/i.test(label))role='interface';
     else if(/^(剩余时间|Remaining time)$/i.test(label))role='time';
     else if(cell.classList.contains('cbi-section-actions'))role='action';
     return {label:label,role:role};
    });
    rows.forEach(function(row){
     if(row.classList.contains('placeholder'))return;
     Array.from(row.cells).forEach(function(cell,index){
      var column=columns[index];if(!column)return;
      cell.classList.add('nt-lease-'+column.role);cell.dataset.wmLeaseLabel=column.label;
      if(column.role==='host'&&cell.tagName==='TD'&&!cell.dataset.wmHost){
       var name=cell.textContent.trim(),parts=name.match(/^(.*?)\s+(\([^()]+\))$/);
       if(parts){var main=document.createElement('strong'),hint=document.createElement('small');main.textContent=parts[1];hint.textContent=' '+parts[2];cell.replaceChildren(main,hint);}
       if(name==='-'){cell.classList.add('nt-lease-unnamed');cell.setAttribute('aria-label','未提供主机名');}
       cell.dataset.wmHost='1';
      }
     });
    });
   });
   if(leaseFamily===null||counts[leaseFamily]===undefined)leaseFamily=counts['4']?'4':counts['6']?'6':Object.keys(counts)[0];
   var content=section.children[1],toolbar=content.querySelector(':scope > .nt-lease-toolbar');
   if(!toolbar){
    toolbar=document.createElement('div');toolbar.className='nt-lease-toolbar';
    var families=document.createElement('div');families.className='nt-lease-families';families.setAttribute('role','group');families.setAttribute('aria-label','租约协议');
    ['4','6'].forEach(function(family){
     var button=document.createElement('button'),count=document.createElement('span');button.type='button';button.className='nt-lease-family-button';button.dataset.wmFamily=family;button.append(document.createTextNode('IPv'+family),count);families.appendChild(button);
    });
    var details=document.createElement('button');details.type='button';details.className='nt-lease-details-button';details.textContent='详细标识';details.title='显示 DUID 和 IAID';
    toolbar.append(families,details);content.prepend(toolbar);
    toolbar.addEventListener('click',function(event){
     var button=event.target.closest('button');if(!button)return;
     if(button.dataset.wmFamily)leaseFamily=button.dataset.wmFamily;else leaseDetails=!leaseDetails;
     applyLeaseView(section);
    });
   }
   toolbar.querySelectorAll('.nt-lease-family-button').forEach(function(button){
    var count=counts[button.dataset.wmFamily];button.hidden=count===undefined;
    var value=String(count||0);if(button.lastElementChild.textContent!==value)button.lastElementChild.textContent=value;
    button.setAttribute('aria-label','IPv'+button.dataset.wmFamily+'，'+value+' 条租约');
   });
   applyLeaseView(section);
  }
  var queued=false;
  function decorate() {
   queued=false;
   var sections=Array.from(view.querySelectorAll(':scope > .cbi-section,:scope > .nt-home-device-grid > .cbi-section,:scope > .nt-home-device-grid > .nt-home-resources > .cbi-section'));
   sections.forEach(function(section){
    if(!section.dataset.wmPanel){
     var title=section.querySelector('h3'),text=title?Array.from(title.childNodes).filter(function(n){return n.nodeType===3;}).map(function(n){return n.textContent;}).join('').trim():'';
     var rule=rules.find(function(rule){return rule[1].test(text);});section.dataset.wmPanel=rule?rule[0]:'other';
    }
   });
   // LuCI holds references to each include's content node, so moving its section preserves polling and toggles.
   var ordered=sections.slice().sort(function(a,b){function rank(el){var i=rules.findIndex(function(rule){return rule[0]===el.dataset.wmPanel;});return i<0?99:i;}return rank(a)-rank(b);});
   var blocks=composeDevice(ordered);
   var current=Array.from(view.children).filter(function(el){return el.matches('.cbi-section,.nt-home-device-grid');});
   if(blocks.some(function(el,i){return el!==current[i];}))blocks.forEach(function(el){view.appendChild(el);});
   resourceReadouts();
   portCards();
   updatePortTooltips();
   networkCards();
   driveCards();
   leaseTables();
   blocks.forEach(reveal);
   document.querySelectorAll('.includes>.cbi-section').forEach(reveal);
  }
  new MutationObserver(function(changes){if(!queued&&changes.some(function(c){return c.addedNodes.length||c.type==='attributes';})){queued=true;requestAnimationFrame(decorate);}}).observe(document.querySelector('#maincontent'),{childList:true,subtree:true,attributes:true,attributeFilter:['title']});
  decorate();
 }
 document.addEventListener('wm-menu-ready',init);
 init();
})();
