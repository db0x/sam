import archiver from "archiver";
import axios from "axios";
import path from "path";
import puppeteer from "puppeteer";
import * as cheerio from 'cheerio';

async function zip(req, res) {
  const content = req.query.content;
  const title = req.query.title;
  if (!content) return res.status(400).send("miss content");
  if (!title) return res.status(400).send("miss title");
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto( "http://sam/?content="+content, { waitUntil: "networkidle0", timeout: 60000 });

  const plain = await page.content();
  const $ = cheerio.load(plain);
  $('#statusbar').remove();
  $('#menuBtn').remove();
  $('#jssam').remove();
  $('#jsmarked').remove();
  $('#jshighlightjs').remove();

  const html = $.html();

  const resources = await page.evaluate(() => {
    const urls = [];
    document.querySelectorAll("img, link[rel=stylesheet], link[rel=icon]").forEach(el => {
      const src = el.src || el.href;
      
      if (src && src.startsWith('http://sam/')) urls.push(src);
    });
    return urls;
  });

  await browser.close();

  res.attachment(title + ".zip");
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  archive.append(html, { name: "index.html" });

  for (const resourceUrl of resources) {
    try {
      const response = await axios.get(resourceUrl, { responseType: "arraybuffer" });      
      const filename = resourceUrl.replace('http://sam/','');
     
      archive.append(response.data, { name: `${filename}` });
    } catch (err) {
      console.warn("Konnte Ressource nicht laden:", resourceUrl, err.message);
    }
  }

  await archive.finalize();
}

export {zip}