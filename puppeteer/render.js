import express from "express";
import puppeteer from "puppeteer";
import axios from "axios";
import archiver from "archiver";
import path from "path";
import { Readable } from "stream";

const app = express();

app.get("/pdf", async (req, res) => {
  
  const content = req.query.content;
  const title = req.query.title;
  if (!content) return res.status(400).send("miss content");
  if (!title) return res.status(400).send("miss title");
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    await page.goto( "http://sam/?content="+content, { waitUntil: "networkidle0", timeout: 60000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename="+title+".pdf",
    });

    res.send(pdf);
  } catch (err) {
    console.error("error create pdf:", err);
    res.status(500).send("error create pdf!");
  } finally {
    await browser.close();
  }
});

app.get("/zip", async (req, res) => {
  
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

  const html = await page.content();

  // Alle Ressourcen sammeln (img, link, script, ...)
  const resources = await page.evaluate(() => {
    const urls = [];
    document.querySelectorAll("img, link[rel=stylesheet], script[src]").forEach(el => {
      const src = el.src || el.href;
      if (src) urls.push(src);
    });
    return urls;
  });

  await browser.close();

  res.attachment("page.zip");
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  archive.append(html, { name: "index.html" });

  for (const resourceUrl of resources) {
    try {
      const response = await axios.get(resourceUrl, { responseType: "arraybuffer" });
      const filename = path.basename(new URL(resourceUrl).pathname);
      archive.append(response.data, { name: `assets/${filename}` });
    } catch (err) {
      console.warn("Konnte Ressource nicht laden:", resourceUrl, err.message);
    }
  }

  await archive.finalize();
});

app.listen(3000, () => console.log("⚙️ puppeteer pdf-render runs"));
