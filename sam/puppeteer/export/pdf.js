import puppeteer from "puppeteer";
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { log } from "./log.js";

async function findMarkersInPdf(pdf, headings) {
  const markers = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(" ");
    for (const heading of headings) {
      if (text.includes(`[[${heading.id}]]`)) {
        markers.push({ tag: heading.id, page: i });
      }      
    };
  }    
  return markers;
}

async function pdf(req, res) {
      
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
    
    log(` ▶️  start evaluate content ${content}`);

    await page.goto( "http://sam/?content="+content+"&format=pdf", { waitUntil: "networkidle0", timeout: 60000 });

    const headings = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1[id], h2[id]');
      return Array.from(elements).map(el => ({
        id: el.id
      }));
    });

    log(` 🔧  create PDF preview`);
    
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
    });

    // PDF mit pdf.js laden
    const loadingTask = pdfjsLib.getDocument({ data: pdf });
    const pdfDoc = await loadingTask.promise;

    log(` 💡  pages in pdf total: ${pdfDoc.numPages}`);

    const markers = await findMarkersInPdf(pdfDoc, headings);

    console.log(markers);

    log(` 🔧  find markers in content`);

    await page.evaluate((markers) => {
      markers.forEach(marker => {
        const el = document.getElementById('page_' + marker.tag);
        if (el) {
          el.textContent = marker.page;
        }
      });
    }, markers);    

    log(` 🔧  create PDF final`);

    const exportPdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
    });

    log(` 🏁  return PDF`);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename="+title+".pdf",
    });

    res.send(exportPdf);
 
  } catch (err) {
    console.error("error create pdf:", err);
    res.status(500).send("error create pdf!");
  } finally {
    await browser.close();
  }
}

export {pdf}