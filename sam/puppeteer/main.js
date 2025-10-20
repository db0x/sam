import express from "express";
import { pdf } from "./export/pdf.js";
import { zip } from "./export/zip.js";
import { log } from "./export/log.js";

export const app = express();

app.get("/pdf", async (req, res) => {
  await pdf(req, res);
});

app.get("/zip", async (req, res) => {
  await zip(req, res);
});

app.listen(3000, () => log(" ⚙️  puppeteer pdf-render/zip-export is up"));
