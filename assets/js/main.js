(function(){
    var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    // mobile menu
    var menuBtn=document.getElementById('menuBtn'), nav=document.getElementById('nav');
    if(menuBtn){
      menuBtn.addEventListener('click',function(){var o=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o?'true':'false');});
      nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');}});
    }

    // scroll reveal
    var items=document.querySelectorAll('.reveal, .stagger, .wipe');
    if(reduce||!('IntersectionObserver'in window)){items.forEach(function(el){el.classList.add('in');});}
    else{
      var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -60px 0px'});
      items.forEach(function(el){io.observe(el);});
    }

    // count-up
    function runCount(el){
      var target=parseFloat(el.dataset.target)||0, dur=1500, start=null;
      function step(ts){if(!start)start=ts;var p=Math.min((ts-start)/dur,1);var e=1-Math.pow(1-p,3);el.textContent=Math.floor(e*target).toLocaleString('en-IN');if(p<1)requestAnimationFrame(step);else el.textContent=target.toLocaleString('en-IN');}
      requestAnimationFrame(step);
    }
    var counters=document.querySelectorAll('.count');
    if(reduce||!('IntersectionObserver'in window)){counters.forEach(function(el){el.textContent=(parseFloat(el.dataset.target)||0).toLocaleString('en-IN');});}
    else{
      var cio=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target);}});},{threshold:0.6});
      counters.forEach(function(el){cio.observe(el);});
    }

    // bus route draw
    var busGrid=document.getElementById('busGrid');
    var paths=document.querySelectorAll('.route-path');
    paths.forEach(function(p){try{var len=Math.ceil(p.getTotalLength());p.style.setProperty('--len',len);p.style.strokeDasharray=len;}catch(e){}});
    if(busGrid){
      if(reduce||!('IntersectionObserver'in window)){busGrid.classList.add('drawn');}
      else{var bio=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){busGrid.classList.add('drawn');bio.unobserve(e.target);}});},{threshold:0.3});bio.observe(busGrid);}
    }

    // scrollspy
    var links=Array.prototype.slice.call(document.querySelectorAll('.nav a')), map={};
    links.forEach(function(l){var id=l.getAttribute('href').slice(1);var s=document.getElementById(id);if(s)map[id]=l;});
    if('IntersectionObserver'in window){
      var spy=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.remove('active');});if(map[e.target.id])map[e.target.id].classList.add('active');}});},{threshold:0.5,rootMargin:'-20% 0px -50% 0px'});
      Object.keys(map).forEach(function(id){spy.observe(document.getElementById(id));});
    }

    // preloader
    var preloader=document.getElementById('preloader');
    function hidePre(){ if(preloader) preloader.classList.add('done'); }
    if(reduce){ hidePre(); }
    else{ window.addEventListener('load',function(){ setTimeout(hidePre,550); }); setTimeout(hidePre,2400); }

    // scroll progress + header condense
    var progress=document.getElementById('progress'), header=document.querySelector('.site-header'), ticking=false;
    function onScroll(){
      var st=window.pageYOffset||document.documentElement.scrollTop||0;
      var h=(document.documentElement.scrollHeight-window.innerHeight);
      if(progress) progress.style.width=(h>0?(st/h*100):0)+'%';
      if(header) header.classList.toggle('scrolled', st>10);
      ticking=false;
    }
    window.addEventListener('scroll',function(){ if(!ticking){ requestAnimationFrame(onScroll); ticking=true; } },{passive:true});
    onScroll();

    // card tilt + spotlight
    if(!reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      document.querySelectorAll('.feat, .lead-card').forEach(function(card){
        card.addEventListener('pointermove',function(e){
          var r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
          card.style.setProperty('--mx',(x*100).toFixed(1)+'%');
          card.style.setProperty('--my',(y*100).toFixed(1)+'%');
          card.style.transform='perspective(820px) rotateX('+((0.5-y)*5).toFixed(2)+'deg) rotateY('+((x-0.5)*5).toFixed(2)+'deg) translateY(-4px)';
        });
        card.addEventListener('pointerleave',function(){ card.style.transform=''; });
      });

      // The "take a look around" card tilts further than the rest — it is the
      // one thing on the page asking to be pressed, so it may lean into it.
      var w3=document.querySelector('.watch3d');
      if(w3){
        w3.addEventListener('pointermove',function(e){
          var r=w3.getBoundingClientRect();
          var x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
          w3.style.transform='rotateX('+((0.5-y)*9).toFixed(2)+'deg) rotateY('+((x-0.5)*11).toFixed(2)+'deg) translateY(-5px)';
        });
        w3.addEventListener('pointerleave',function(){ w3.style.transform=''; });
        w3.addEventListener('pointerdown',function(){ w3.style.transform='rotateX(1deg) scale(.985)'; });
      }
    }

    // buses travelling along the routes
    if(!reduce){
      var markers=Array.prototype.slice.call(document.querySelectorAll('.bus-marker'));
      markers.forEach(function(m){
        var p=document.querySelector('.route-path[data-route="'+m.getAttribute('data-route')+'"]');
        if(p){ m._p=p; try{ m._len=p.getTotalLength(); }catch(e){ m._len=0; } m._off=Math.random()*(m._len||1); }
      });
      var busSpeed=52;
      function busTick(ts){
        for(var i=0;i<markers.length;i++){
          var m=markers[i]; if(!m._p||!m._len) continue;
          var d=((ts/1000*busSpeed)+m._off)%m._len;
          try{
            var pt=m._p.getPointAtLength(d);
            // look a little ahead so the bus faces the way it is going
            var ahead=m._p.getPointAtLength((d+8)%m._len);
            var dir=(ahead.x-pt.x)<-0.08?-1:1;
            if(dir!==m._dir){ m._dir=dir; }
            m.setAttribute('transform','translate('+pt.x.toFixed(1)+','+pt.y.toFixed(1)+') scale('+dir+',1)');
          }catch(e){}
        }
        requestAnimationFrame(busTick);
      }
      if(markers.length) requestAnimationFrame(busTick);
    }

    // hero 3D parallax (cursor depth)
    var heroEl=document.querySelector('.hero');
    if(heroEl && !reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      var hpx=0,hpy=0,hpt=false;
      heroEl.addEventListener('pointermove',function(e){
        var r=heroEl.getBoundingClientRect();
        hpx=(e.clientX-r.left)/r.width-0.5; hpy=(e.clientY-r.top)/r.height-0.5;
        if(!hpt){ requestAnimationFrame(function(){ heroEl.style.setProperty('--px',hpx.toFixed(3)); heroEl.style.setProperty('--py',hpy.toFixed(3)); hpt=false; }); hpt=true; }
      });
      heroEl.addEventListener('pointerleave',function(){ heroEl.style.setProperty('--px',0); heroEl.style.setProperty('--py',0); });
    }

    // admission enquiry form → submits to Netlify Forms (emails the school + saved in the dashboard)
    var form=document.getElementById('enquiryForm'), toast=document.getElementById('toast'), t;
    function showToast(m){ if(!toast) return; toast.textContent=m; toast.classList.add('show'); clearTimeout(t); t=setTimeout(function(){toast.classList.remove('show');},4600); }
    var statusEl=document.getElementById('enqStatus');
    var SCHOOL_MAIL='kadamburschool@gmail.com', SCHOOL_PHONE='0497 283 3639';
    function setStatus(html,kind){
      if(!statusEl) return;
      statusEl.innerHTML=html; statusEl.hidden=false;
      statusEl.className='enq-status '+(kind||'');
    }
    // a ready-to-send email holding everything the parent typed — the safety net
    function mailtoFor(f){
      var v=function(n){ var el=f.querySelector('[name="'+n+'"]'); return el?el.value.trim():''; };
      var body='Admission Enquiry\n\n'+
        'Parent\'s name: '+v('parent_name')+'\n'+
        'Phone: '+v('phone')+'\n'+
        'Email: '+v('email')+'\n'+
        'Class applying for: '+v('class_applying')+'\n\n'+
        'Message:\n'+(v('message')||'—')+'\n';
      return 'mailto:'+SCHOOL_MAIL+'?subject='+encodeURIComponent('Admission Enquiry')+
             '&body='+encodeURIComponent(body);
    }
    if(form){form.addEventListener('submit',function(e){
      e.preventDefault();
      if(form.reportValidity && !form.reportValidity()) return;
      var btn=form.querySelector('button[type=submit]'), label=btn?btn.textContent:'';
      if(btn){ btn.disabled=true; btn.textContent='Sending…'; }
      if(statusEl){ statusEl.hidden=true; }

      var body=new URLSearchParams(new FormData(form)).toString();
      // post back to this same page — Netlify picks the submission up here
      fetch(location.pathname,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body})
        .then(function(r){
          if(!r.ok) throw new Error('http '+r.status);
          showToast('Thank you! Your enquiry has been sent — we’ll be in touch soon.');
          setStatus('✅ Thank you! Your enquiry has been sent to the school. We’ll be in touch soon.','ok');
          form.reset();
        })
        .catch(function(){
          // never lose the enquiry: offer a pre-filled email and the office number
          showToast('Couldn’t send automatically — you can email it instead.');
          setStatus('We couldn’t send that automatically. '+
            '<a href="'+mailtoFor(form)+'">Send it by email instead</a> — everything you typed is already filled in. '+
            'Or call the office on <a href="tel:+914972833639">'+SCHOOL_PHONE+'</a>.','err');
        })
        .finally(function(){ if(btn){ btn.disabled=false; btn.textContent=label; } });
    });}

    /* ---------------------------------------------------------
       A little magic: a sparkle trail that follows the wand
       cursor, and a book that shoots past like a comet now and
       then. Desktop pointers only; off for reduced-motion.
       --------------------------------------------------------- */
    if(!reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      var fx=document.createElement('div'); fx.className='fx-layer'; fx.setAttribute('aria-hidden','true');
      document.body.appendChild(fx);

      /* --- sparkles off the wand tip --- */
      var lx=0, ly=0, lt=0, live=0;
      function spark(x,y){
        if(live>26) return;
        var s=document.createElement('i');
        s.className='mw-spark'+(Math.random()<0.3?' blue':'');
        s.style.left=(x+(Math.random()-0.5)*15)+'px';
        s.style.top =(y+(Math.random()-0.5)*15)+'px';
        s.style.setProperty('--sc',(0.5+Math.random()*0.8).toFixed(2));
        s.style.setProperty('--rot',Math.round(Math.random()*90-45)+'deg');
        fx.appendChild(s); live++;
        setTimeout(function(){ s.remove(); live--; }, 820);
      }
      document.addEventListener('pointermove',function(e){
        if(e.pointerType && e.pointerType!=='mouse') return;
        var now=e.timeStamp||performance.now();
        if(now-lt<36) return;
        var dx=e.clientX-lx, dy=e.clientY-ly;
        if(dx*dx+dy*dy<70) return;
        lx=e.clientX; ly=e.clientY; lt=now;
        spark(e.clientX, e.clientY);
      },{passive:true});

      /* --- the flying book: an open book in 3D, pages flapping like wings --- */
      var BOOK='<div class="book3d">'+
        '<span class="pg pg-left"><span class="cv"></span><span class="lf"></span></span>'+
        '<span class="pg pg-right"><span class="cv"></span><span class="lf"></span></span>'+
        '</div>';
      function flyBook(){
        if(document.hidden) return;
        var b=document.createElement('div'); b.className='mw-book'; b.innerHTML=BOOK;
        var w=innerWidth, h=innerHeight, leftToRight=Math.random()<0.5;
        var y0=(0.10+Math.random()*0.45)*h, y1=y0+(Math.random()*0.22-0.05)*h;
        var x0=leftToRight?-150:w+150, x1=leftToRight?w+150:-150;
        var a=b.animate([
          {transform:'translate('+x0+'px,'+y0+'px)', opacity:0},
          {opacity:1, offset:0.10},
          {opacity:1, offset:0.90},
          {transform:'translate('+x1+'px,'+y1+'px)', opacity:0}
        ], {duration:9000+Math.random()*3500, easing:'linear'});
        fx.appendChild(b);
        a.onfinish=function(){ b.remove(); };
      }
      // a rare treat rather than a regular fixture
      (function schedule(){
        setTimeout(function(){ flyBook(); schedule(); }, 60000+Math.random()*60000);
      })();
      setTimeout(flyBook, 20000);   // the first one only after a while
    }

    /* ---------------------------------------------------------
       Click any photo to see it full size.
       --------------------------------------------------------- */
    (function(){
      var shots=[].slice.call(document.querySelectorAll('.gallery .gal img, .infra-banner img, .about-cutout img'));
      var films=document.querySelectorAll('[data-video]');
      if(!shots.length && !films.length) return;

      var ZOOM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>';
      shots.forEach(function(img,i){
        img.classList.add('zoomable');
        img.setAttribute('tabindex','0');
        img.setAttribute('role','button');
        img.setAttribute('aria-label','View this photo full size');
        img._i=i;
        var host=img.closest('.gal')||img.closest('.infra-banner');
        if(host && !host.querySelector('.gal-zoom')){
          var badge=document.createElement('span'); badge.className='gal-zoom'; badge.innerHTML=ZOOM;
          host.appendChild(badge);
        }
      });

      var lb=document.createElement('div');
      lb.className='lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.hidden=true;
      lb.innerHTML=
        '<button class="lb-btn lb-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
        '<button class="lb-btn lb-prev" type="button" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg></button>'+
        '<button class="lb-btn lb-next" type="button" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg></button>'+
        '<figure><img alt=""><video playsinline controls preload="auto"></video><figcaption></figcaption></figure>';
      document.body.appendChild(lb);

      var lbImg=lb.querySelector('img'), lbVid=lb.querySelector('video'),
          lbCap=lb.querySelector('figcaption'), cur=0, opener=null;
      function captionFor(img){
        var f=img.closest('.gal'); var c=f?f.querySelector('figcaption'):null;
        return (c&&c.textContent.trim()) || img.getAttribute('alt') || '';
      }
      function show(i){
        cur=(i+shots.length)%shots.length;
        var src=shots[cur];
        lbImg.src=src.currentSrc||src.src;
        lbImg.alt=src.getAttribute('alt')||'';
        lbCap.textContent=captionFor(src);
      }
      function open(i){
        opener=document.activeElement;
        lb.classList.remove('is-video'); stopVideo();
        show(i); lb.hidden=false; lb.classList.add('open');
        document.body.style.overflow='hidden';
        lb.querySelector('.lb-close').focus();
      }

      /* ---- the same viewer, showing a short film ----
         It fades up from nothing as it arrives, which is what makes it feel
         like the lab opening rather than a box appearing. */
      function stopVideo(){
        try{ lbVid.pause(); }catch(e){}
        lbVid.removeAttribute('src'); lbVid.load();
        lb.classList.remove('vid-ready');
      }
      function openVideo(src,title){
        opener=document.activeElement;
        lbImg.removeAttribute('src');
        lb.classList.add('is-video');
        lbCap.textContent=title||'';
        lbVid.src=src;
        lb.hidden=false; lb.classList.add('open');
        document.body.style.overflow='hidden';
        lb.querySelector('.lb-close').focus();
        // reveal only once there are real frames to show, so it never
        // fades up into a black rectangle
        var reveal=function(){ lb.classList.add('vid-ready'); };
        lbVid.addEventListener('loadeddata',reveal,{once:true});
        setTimeout(reveal,1200);                 // in case the event is missed
        var p=lbVid.play(); if(p&&p.catch) p.catch(function(){});
      }
      function close(){
        lb.classList.remove('open'); lb.hidden=true;
        stopVideo(); lb.classList.remove('is-video');
        document.body.style.overflow='';
        if(opener&&opener.focus) opener.focus();
      }

      // anything that carries a film: the science card, the campus strip
      document.querySelectorAll('[data-video]').forEach(function(el){
        el.addEventListener('click',function(){
          openVideo(el.getAttribute('data-video'), el.getAttribute('data-title')||'');
        });
      });
      shots.forEach(function(img){
        img.addEventListener('click',function(){ open(img._i); });
        img.addEventListener('keydown',function(e){
          if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(img._i); }
        });
      });
      lb.querySelector('.lb-close').addEventListener('click',close);
      lb.querySelector('.lb-prev').addEventListener('click',function(){ show(cur-1); });
      lb.querySelector('.lb-next').addEventListener('click',function(){ show(cur+1); });
      lb.addEventListener('click',function(e){ if(e.target===lb||e.target.tagName==='FIGURE') close(); });
      document.addEventListener('keydown',function(e){
        if(lb.hidden) return;
        if(e.key==='Escape') { close(); return; }
        if(lb.classList.contains('is-video')) return;   // arrows step through photos, not film
        if(e.key==='ArrowLeft') show(cur-1);
        else if(e.key==='ArrowRight') show(cur+1);
      });
    })();
  })();
