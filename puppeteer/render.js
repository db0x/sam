const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/render", async (req, res) => {
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
    await page.goto( "http://"+content, { waitUntil: "networkidle0", timeout: 60000 });

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

app.listen(3000, () => console.log("⚙️ puppeteer pdf-render runs"));
