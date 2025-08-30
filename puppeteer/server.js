const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/render*", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Fehlender Parameter: url");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="height:0px; margin:0; padding:0"></div>`,
      footerTemplate: `
    <div style="font-size:10px; width:100%; text-align:center;">
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
      `,
      margin: { top: "0cm", bottom: "1cm" }
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=seite.pdf",
    });

    res.send(pdf);
  } catch (err) {
    console.error("Fehler beim PDF-Rendern:", err);
    res.status(500).send("Fehler beim Rendern");
  } finally {
    await browser.close();
  }
});

app.listen(3000, () => console.log("📄 Puppeteer PDF-Service läuft auf Port 3000"));
