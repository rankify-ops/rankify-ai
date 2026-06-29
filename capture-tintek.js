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
      if (pos === 'fixed' || pos === 'sticky') {
        el.style.display = 'none';
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
    var dividers = document.querySelectorAll('.divider, .sec-tag');
    for (var i = 0; i < dividers.length; i++) {
      if (dividers[i].textContent.trim().toLowerCase() === 'our process') {
        var rect = dividers[i].getBoundingClientRect();
        window.scrollBy(0, rect.top - 100);
        return;
      }
    }
    window.scrollTo(0, 6380);
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
    // Scroll to "Request a free quote below" / "Quick 60-Second Quote" form block
    // Show heading + form options fully in view with spacing
    var headings = document.querySelectorAll('h3');
    for (var i = 0; i < headings.length; i++) {
      var t = headings[i].textContent.toLowerCase();
      if (t.includes('60-second') || t.includes('60 second')) {
        var rect = headings[i].getBoundingClientRect();
        window.scrollBy(0, rect.top - 260);
        return 'found: ' + headings[i].textContent;
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
    // "Velux — the gold standard" H2 at ~1076, image above at ~802
    // Scroll so image top is at top of viewport with small padding
    var headings = document.querySelectorAll('h2');
    for (var i = 0; i < headings.length; i++) {
      var t = headings[i].textContent.toLowerCase();
      if (t.includes('velux') && t.includes('gold standard')) {
        // Find the image/section just above this heading
        var section = headings[i].closest('section, div');
        var allImgs = document.querySelectorAll('img');
        var bestImg = null;
        var headingTop = headings[i].getBoundingClientRect().top + window.scrollY;
        for (var j = 0; j < allImgs.length; j++) {
          var imgTop = allImgs[j].getBoundingClientRect().top + window.scrollY;
          if (imgTop < headingTop && imgTop > headingTop - 400) {
            bestImg = allImgs[j];
          }
        }
        if (bestImg) {
          var imgRect = bestImg.getBoundingClientRect();
          window.scrollBy(0, imgRect.top - 100);
        } else {
          var rect = headings[i].getBoundingClientRect();
          window.scrollBy(0, rect.top - 60);
        }
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
