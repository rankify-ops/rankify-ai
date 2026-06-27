// Rankify.ai shared JS
(function(){
  var nav = document.getElementById('nav');
  var floatD = document.querySelector('.float-cta');
  var floatM = document.querySelector('.float-mob');
  var hero = document.querySelector('.hero, .phero');
  if(nav || floatD || floatM){
    var setState = function(){
      var y = window.scrollY;
      if(nav) nav.classList.toggle('scrolled', y > 50);
      var threshold = hero ? hero.offsetTop + hero.offsetHeight - 120 : window.innerHeight * 0.7;
      if(floatD) floatD.classList.toggle('show', y > threshold);
      if(floatM) floatM.classList.toggle('show', y > threshold);
    };
    setState();
    window.addEventListener('scroll', setState, {passive:true});
    window.addEventListener('resize', setState, {passive:true});
  }
  // Mobile drawer
  var tog = document.querySelector('.mob-tog');
  var drawer = document.querySelector('.mdrawer');
  if(tog && drawer){
    var closeDrawer = function(){
      tog.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = '';
    };
    var openDrawer = function(){
      tog.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden';
    };
    tog.addEventListener('click', function(){
      if(drawer.classList.contains('open')) closeDrawer(); else openDrawer();
    });
    var closeBtn = drawer.querySelector('.mdrawer-close');
    if(closeBtn) closeBtn.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function(ev){
      if(ev.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
    drawer.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeDrawer);
    });
  }
  // Fade-in
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('vis'); io.unobserve(x.target); }});
    }, {threshold:0.1, rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.fade').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.fade').forEach(function(el){ el.classList.add('vis'); });
  }
  // Smooth-scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(ev){
      var hash = a.getAttribute('href');
      if(hash.length <= 1) return;
      var t = document.querySelector(hash);
      if(t){ ev.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });
  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
      if(!wasOpen) item.classList.add('open');
    });
  });
  // Quote form (multi-step)
  document.querySelectorAll('.qform').forEach(function(qform){
    var cs=1, fd={};
    var slides = qform.querySelectorAll('.fslide');
    var steps = qform.querySelectorAll('.fstep');
    if(!slides.length) return;
    var maxStep = slides.length - 1;
    var upd = function(){
      slides.forEach(function(s){ s.classList.remove('active'); });
      var slide = qform.querySelector('.fslide[data-s="'+cs+'"]');
      if(slide) slide.classList.add('active');
      steps.forEach(function(s,i){
        s.classList.remove('active','done');
        if(i+1===cs) s.classList.add('active');
        if(i+1<cs) s.classList.add('done');
      });
    };
    qform.querySelectorAll('.ob').forEach(function(b){
      b.addEventListener('click', function(){
        var grp = b.closest('.og');
        grp.querySelectorAll('.ob').forEach(function(x){ x.classList.remove('sel'); });
        b.classList.add('sel');
        var slide = b.closest('.fslide');
        var key = slide.dataset.field || ('Question ' + slide.dataset.s);
        fd[key] = b.dataset.v;
        setTimeout(function(){
          if(cs < maxStep){ cs++; upd(); }
        }, 350);
      });
    });
    var showSuccess = function(){
      cs = maxStep + 1;
      slides.forEach(function(s){ s.classList.remove('active'); });
      var done = qform.querySelector('.fslide[data-s="'+cs+'"]');
      if(done) done.classList.add('active');
      steps.forEach(function(s){ s.classList.remove('active'); s.classList.add('done'); });
    };
    var showError = function(msg){
      var errSlot = qform.querySelector('.qform-error');
      if(!errSlot){
        errSlot = document.createElement('div');
        errSlot.className = 'qform-error';
        errSlot.style.cssText = 'margin-top:12px;padding:12px 14px;background:#fef2f2;border:1px solid #fecaca;border-left:3px solid #dc2626;color:#991b1b;font-size:.85rem;border-radius:8px;line-height:1.5';
        var contactSlide = qform.querySelector('.fslide[data-s="'+maxStep+'"]');
        if(contactSlide) contactSlide.appendChild(errSlot);
      }
      errSlot.innerHTML = msg;
    };
    var submitBtn = function(){ return qform.querySelector('.fn[data-action="submit"]'); };
    var sendQuote = function(cb){
      var inputs = qform.querySelectorAll('.fslide[data-s="'+cs+'"] .finp');
      var required = qform.querySelectorAll('.fslide[data-s="'+cs+'"] .finp:not([data-optional])');
      var missing = [];
      required.forEach(function(i){ if(!i.value.trim()) missing.push(i.placeholder || i.name); });
      if(missing.length){ alert('Please fill: ' + missing.join(', ')); cb(false); return; }
      inputs.forEach(function(i){
        if(i.value.trim()) fd[i.placeholder || i.name || i.id] = i.value.trim();
      });
      var to = 'hello@rankify.ai';
      var userEmail = '';
      Object.keys(fd).forEach(function(k){ if(/email/i.test(k) && !userEmail) userEmail = fd[k]; });
      var hp = qform.querySelector('input[name="_honey"]');
      if(hp && hp.value){ cb(true); return; }
      var userName = '';
      Object.keys(fd).forEach(function(k){ if(/name/i.test(k) && !userName) userName = fd[k]; });
      var firstName = (userName.split(' ')[0] || 'there');
      var subject = 'Rankify Website Enquiry' + (userName ? ' — ' + userName : '');
      var payload = {
        access_key: 'e6f497d6-d756-4bb9-9ece-8250406b5bae',
        cc: 'tflood@rankify.com.au',
        subject: subject,
        replyto: userEmail || '',
        email: userEmail || ''
      };
      Object.keys(fd).forEach(function(k){ payload[k] = fd[k]; });
      payload['Source Page'] = window.location.href;
      var btn = submitBtn();
      var origText = btn ? btn.textContent : '';
      if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; btn.style.opacity = '.7'; }
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return {ok:r.ok, j:j}; }); })
      .then(function(res){
        if(btn){ btn.disabled = false; btn.textContent = origText; btn.style.opacity = ''; }
        if(res.ok && res.j && (res.j.success === true || res.j.success === 'true')){
          cb(true);
        } else {
          showError('Sorry, something went wrong. Please call <a href="tel:0411375484" style="color:#dc2626;font-weight:700">0411 375 484</a> or email <a href="mailto:'+to+'" style="color:#dc2626;font-weight:700">'+to+'</a>.');
          cb(false);
        }
      })
      .catch(function(){
        if(btn){ btn.disabled = false; btn.textContent = origText; btn.style.opacity = ''; }
        showError('Network issue. Please call <a href="tel:0411375484" style="color:#dc2626;font-weight:700">0411 375 484</a>.');
        cb(false);
      });
    };
    qform.querySelectorAll('.fn').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(btn.dataset.action === 'submit'){
          sendQuote(function(success){ if(success) showSuccess(); });
          return;
        }
        if(cs >= maxStep) return;
        var sel = qform.querySelector('.fslide[data-s="'+cs+'"] .ob.sel');
        if(cs < maxStep && !sel) return;
        cs++; upd();
      });
    });
    qform.querySelectorAll('.fb').forEach(function(b){
      b.addEventListener('click', function(){ if(cs<=1) return; cs--; upd(); });
    });
  });
  // ========== PROOF GALLERY ==========
  var caseStudies = [
    {name:'Hiatus Hype',industry:'Fashion · Shopify',metric:'+120% conversion rate',problem:'Outdated Shopify theme with poor mobile experience and low conversion rates. The brand aesthetic wasn\'t translating to the online store.',result:'+120% conversion rate within 60 days of launch, with a 45% increase in average order value.',whatIDid:['Rebuilt the entire Shopify theme from scratch with mobile-first conversion layout','Trust signals above the fold — reviews, shipping guarantee, secure checkout badges','Streamlined checkout flow reducing cart abandonment by 35%'],quote:'The new store completely changed our online business. Customers actually trust us now.',author:'Hiatus Hype'},
    {name:'Geelong Heat Pumps',industry:'Hot Water · Trades',metric:'+340% enquiries',problem:'Basic DIY website that wasn\'t ranking and wasn\'t converting the little traffic it had. No clear call-to-action, no trust signals.',result:'+340% enquiries in the first 90 days. Page 1 rankings for key local search terms.',whatIDid:['Conversion-focused layout — phone number and quote form visible without scrolling','Local SEO structure with service area pages and Google Business integration','Trust signals: real reviews, licensing info, response time guarantee'],quote:'Built our site in 5 days and we saw a massive jump in enquiries within the first week. Game changer.',author:'Mark C., Geelong Heat Pumps'},
    {name:'Hawker Studios',industry:'Creative Agency',metric:'+200% enquiries',problem:'Portfolio site that didn\'t reflect the quality of the work. Not generating inbound leads online.',result:'+200% enquiries. The website now drives consistent project leads without outbound.',whatIDid:['Portfolio-first design showcasing work with immersive project pages','Fast, minimal build that loads instantly and feels premium','Contact flow optimised to reduce friction between browsing and enquiring'],quote:'Finally a site that matches the standard of our work. Leads started coming in immediately.',author:'Hawker Studios'},
    {name:'Tinktek',industry:'Electrical',metric:'Page 1 Google',problem:'Invisible online. Not ranking for any local keywords despite being established for years.',result:'Page 1 Google rankings for primary service keywords. Consistent organic lead flow.',whatIDid:['Full local SEO build — service area pages, schema markup, Google Business','Content strategy targeting the exact searches their customers make','Fast, clean code that Google loves — perfect Core Web Vitals'],quote:'Ranks on page 1 for our main keywords and the leads are quality. Best money I\'ve spent on the business.',author:'Ryan L., Tinktek'},
    {name:'Myoko Skincare',industry:'Beauty · Shopify',metric:'+85% AOV increase',problem:'Generic template store that looked like every other skincare brand. Products weren\'t presented in a way that justified premium pricing.',result:'+85% average order value increase. Customers spending more per transaction thanks to better product presentation and upsell flows.',whatIDid:['Premium product photography layouts that justified the price point','Smart upsell and bundle sections that feel natural, not pushy','Mobile experience built around how people actually browse skincare'],quote:'Our AOV jumped almost immediately. The site finally matches the quality of our products.',author:'Myoko Skincare'},
    {name:'The Enricher',industry:'Wellness · Shopify',metric:'+160% organic traffic',problem:'New brand with no online presence and a competitive wellness market. Needed a store that stood out and converted.',result:'+160% organic traffic within 4 months. Strong repeat purchase rate from day one.',whatIDid:['Clean, premium Shopify build that communicates trust instantly','SEO-first product and collection pages targeting wellness keywords','Email capture flow integrated with Klaviyo for retention'],quote:'The site exceeded every expectation. Customers constantly tell us how professional it looks.',author:'The Enricher'},
    {name:'Prime Group Build',industry:'Construction',metric:'+280% traffic',problem:'No online presence at all. Relying entirely on word of mouth which was drying up.',result:'+280% organic traffic within 6 months. Consistent enquiries from Google search for the first time.',whatIDid:['Project gallery showcasing completed builds with before/after','Service pages targeting specific construction types and locations','Mobile-first — most tradies\' customers search on their phone'],quote:'We went from a dodgy DIY site to something that looks legit. Customers trust us more and the phone hasn\'t stopped.',author:'Jake S., Prime Group Build'}
  ];

  // Duplicate tiles for infinite scroll
  var track = document.querySelector('.gallery-track');
  if (track) {
    var tiles = track.innerHTML;
    track.innerHTML = tiles + tiles;
  }

  // Mobile tap-to-scroll (one at a time)
  var activeTile = null;
  document.querySelectorAll('.gallery-tile').forEach(function(tile){
    tile.addEventListener('click', function(ev){
      if(window.innerWidth > 768) return;
      if(activeTile && activeTile !== tile){
        activeTile.classList.remove('active');
      }
      if(tile.classList.contains('active')){
        openCaseStudy(parseInt(tile.dataset.site));
      } else {
        tile.classList.add('active');
        activeTile = tile;
        ev.stopPropagation();
      }
    });
  });

  // Case study modal
  var modal = document.getElementById('csModal');
  function openCaseStudy(idx){
    var cs = caseStudies[idx];
    if(!cs || !modal) return;
    document.getElementById('csMetric').textContent = cs.metric;
    document.getElementById('csSiteName').textContent = cs.name;
    document.getElementById('csIndustry').textContent = cs.industry;
    document.getElementById('csProblem').textContent = cs.problem;
    document.getElementById('csResult').textContent = cs.result;
    var ul = document.getElementById('csWhatIDid');
    ul.innerHTML = '';
    cs.whatIDid.forEach(function(w){
      var li = document.createElement('li');
      li.textContent = w;
      ul.appendChild(li);
    });
    document.getElementById('csQuote').textContent = '"' + cs.quote + '"';
    document.getElementById('csAuthor').textContent = '— ' + cs.author;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if(modal){
    modal.querySelector('.cs-backdrop').addEventListener('click', closeCsModal);
    modal.querySelector('.cs-close').addEventListener('click', closeCsModal);
    document.addEventListener('keydown', function(ev){
      if(ev.key === 'Escape' && modal.classList.contains('open')) closeCsModal();
    });
  }
  function closeCsModal(){
    if(!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Desktop click opens case study
  document.querySelectorAll('.gallery-tile').forEach(function(tile){
    tile.addEventListener('click', function(){
      if(window.innerWidth <= 768) return;
      openCaseStudy(parseInt(tile.dataset.site));
    });
  });
})();
