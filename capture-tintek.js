const puppeteer = require('puppeteer');
const sharp = require('C:/Users/tomf_/AppData/Roaming/npm/node_modules/clawdbot/node_modules/sharp');
const fs = require('fs');

function dismissPopup(pg) {
  return pg.keyboard.press('Escape')
    .then(() => new Promise(r => setTimeout(r, 1000)))
    .then(() => pg.evaluate(() => { document.querySelectorAll('.needsclick.klaviyo-close-form, [class*="klaviyo-close"], [class*="popup-close"], .close-btn, [aria-label="Close"]').forEach(b => b.click()); }))
    .then(() => new Promise(r => setTimeout(r, 500)))
    .then(() => pg.keyboard.press('Escape'))
    .then(() => new Promise(r => setTimeout(r, 500)));
}

function removeFloatingElements(pg) {
  return pg.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      var style = window.getComputedStyle(el);
      var pos = style.position;
      if ((pos === 'fixed' || pos === 'sticky') && el.offsetHeight < 120 && el.offsetWidth < 200) {
        var t = (el.textContent || '').toLowerCase();
        var cls = (el.className || '').toString().toLowerCase();
        var html = (el.innerHTML || '').toLowerCase();
        if (t.includes('google') || t.includes('top rated') || t.includes('shop quality') ||
            cls.includes('google') || cls.includes('badge') || cls.includes('trust') ||
            html.includes('google') || html.includes('badge') || html.includes('shopquality')) {
          el.style.display = 'none';
        }
      }
    });
    document.querySelectorAll('iframe').forEach(el => {
      if (el.src && (el.src.includes('google') || el.src.includes('badge') || el.src.includes('shopquality') || el.src.includes('trust'))) {
        el.style.display = 'none';
      }
    });
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  // 1. Home page - top
  console.log('1. Home');
  var pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await pg.goto('https://tintek.com.au/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await dismissPopup(pg);
  await removeFloatingElements(pg);
  await new Promise(r => setTimeout(r, 500));
  await pg.screenshot({ path: 'images/tmp.png', fullPage: false });
  var info = await sharp('images/tmp.png').resize(390).webp({ quality: 90 }).toFile('images/tintek-home.webp');
  console.log('  ' + info.width + 'x' + info.height + ' ' + Math.round(info.size / 1024) + 'KB');
  fs.unlinkSync('images/tmp.png');
  await pg.close();

  // 2. Home - scroll to "From Contact to Completion" / "Our Process"
  console.log('2. Our Process');
  pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await pg.goto('https://tintek.com.au/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await dismissPopup(pg);
  await removeFloatingElements(pg);
  await pg.evaluate(() => {
    var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
    for (var i = 0; i < headings.length; i++) {
      var t = headings[i].textContent.toLowerCase().trim();
      if ((t.includes('our process') || t.includes('contact to completion') || t.includes('from contact')) && headings[i].offsetHeight < 200) {
        var rect = headings[i].getBoundingClientRect();
        window.scrollBy(0, rect.top - 20);
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await pg.screenshot({ path: 'images/tmp.png', fullPage: false });
  info = await sharp('images/tmp.png').resize(390).webp({ quality: 90 }).toFile('images/tintek-process.webp');
  console.log('  ' + info.width + 'x' + info.height + ' ' + Math.round(info.size / 1024) + 'KB');
  fs.unlinkSync('images/tmp.png');
  await pg.close();

  // 3. Home - scroll to quote form, centered in view
  console.log('3. Quote Form');
  pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await pg.goto('https://tintek.com.au/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await dismissPopup(pg);
  await removeFloatingElements(pg);
  await pg.evaluate(() => {
    var forms = document.querySelectorAll('form, [class*="quote"], [class*="form"], [id*="quote"], [id*="form"]');
    for (var i = 0; i < forms.length; i++) {
      var el = forms[i];
      if (el.offsetHeight > 100 && el.offsetHeight < 1000) {
        var rect = el.getBoundingClientRect();
        var scrollY = rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;
        window.scrollTo(0, Math.max(0, scrollY));
        return 'found form: ' + (el.className || el.id || el.tagName);
      }
    }
    // Fallback: search for text
    var all = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (var j = 0; j < all.length; j++) {
      var t = all[j].textContent.toLowerCase();
      if (t.includes('quote') || t.includes('get in touch') || t.includes('contact')) {
        var r2 = all[j].getBoundingClientRect();
        window.scrollBy(0, r2.top - 80);
        return 'found heading: ' + all[j].textContent.substring(0, 40);
      }
    }
    return 'not found';
  });
  await new Promise(r => setTimeout(r, 1500));
  await pg.screenshot({ path: 'images/tmp.png', fullPage: false });
  info = await sharp('images/tmp.png').resize(390).webp({ quality: 90 }).toFile('images/tintek-quote.webp');
  console.log('  ' + info.width + 'x' + info.height + ' ' + Math.round(info.size / 1024) + 'KB');
  fs.unlinkSync('images/tmp.png');
  await pg.close();

  // 4. Velux Skylights page - scroll to "Velux the gold standard" with image above in frame
  console.log('4. Velux Skylights');
  pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await pg.goto('https://tintek.com.au/gold-coast-skylights/velux-skylights/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await dismissPopup(pg);
  await removeFloatingElements(pg);
  await pg.evaluate(() => {
    var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (var i = 0; i < headings.length; i++) {
      var t = headings[i].textContent.toLowerCase();
      if (t.includes('velux') && t.includes('gold standard')) {
        // Find the image above this heading
        var prev = headings[i].previousElementSibling;
        var parent = headings[i].parentElement;
        var targetEl = headings[i];
        // Walk up/back to find an image
        if (prev && prev.tagName === 'IMG') targetEl = prev;
        else if (parent) {
          var imgs = parent.querySelectorAll('img');
          if (imgs.length > 0) {
            for (var j = imgs.length - 1; j >= 0; j--) {
              if (imgs[j].getBoundingClientRect().top < headings[i].getBoundingClientRect().top) {
                targetEl = imgs[j];
                break;
              }
            }
          }
          // Also check previous sibling of parent
          if (targetEl === headings[i] && parent.previousElementSibling) {
            var prevImgs = parent.previousElementSibling.querySelectorAll('img');
            if (prevImgs.length > 0) targetEl = prevImgs[0];
          }
        }
        var rect = targetEl.getBoundingClientRect();
        window.scrollBy(0, rect.top - 10);
        return 'found: ' + headings[i].textContent.substring(0, 50);
      }
    }
    return 'not found';
  });
  await new Promise(r => setTimeout(r, 1500));
  await pg.screenshot({ path: 'images/tmp.png', fullPage: false });
  info = await sharp('images/tmp.png').resize(390).webp({ quality: 90 }).toFile('images/tintek-velux.webp');
  console.log('  ' + info.width + 'x' + info.height + ' ' + Math.round(info.size / 1024) + 'KB');
  fs.unlinkSync('images/tmp.png');
  await pg.close();

  await browser.close();
  console.log('Done');
})();
