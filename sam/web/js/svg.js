import { loadFile } from './file.js';
import { config } from './config.js';

async function resolveSVG(outer) {
    const includeRegex = /!\[[^\]]*]\(([^)]+\.svg)\)/g;

    let match;
    let result = outer;
    const replacements = [];
    while ((match = includeRegex.exec(outer)) !== null) {

        let importPath = match[1];
        let svg = await loadFile(importPath);
        replacements.push({ match: match[0], text: svg });
    }

    for (const r of replacements) {
        result = result.replace(r.match, r.text);
    }

    return result;
}

function makeSVGResponsive(maxWidthPx = 1000, { forcePreserveAspect = false, observe = false } = {}) {
  const parsePx = v => {
    if (v == null) return null;
    v = String(v).trim();
    const m = v.match(/^([0-9]*\.?[0-9]+)(px)?$/);
    return m ? Number(m[1]) : null;
  };

  function getIntrinsicWidth(svg) {
    const attrW = svg.getAttribute('width');
    const wAttr = parsePx(attrW);
    if (wAttr != null) return wAttr;

    const inlineW = parsePx(svg.style.width);
    if (inlineW != null) return inlineW;

    if (svg.hasAttribute('viewBox')) {
      const vbParts = svg.getAttribute('viewBox').trim().split(/\s+/);
      if (vbParts.length === 4) {
        const vbw = Number(vbParts[2]);
        if (!isNaN(vbw) && vbw > 0) return vbw;
      }
    }

    try {
      const bbox = svg.getBBox();
      if (bbox && bbox.width) return bbox.width;
    } catch (e) {
      // ignore
    }

    try {
      const cs = getComputedStyle(svg).width;
      const csW = parsePx(cs);
      if (csW != null) return csW;
    } catch (e) {}

    return null;
  }

  function process(svg) {
    if (!(svg instanceof SVGElement)) return;
    const intrinsic = getIntrinsicWidth(svg);
    svg.style.removeProperty('color-scheme');
    if (intrinsic == null) return;         
    if (intrinsic <= maxWidthPx) return;   

    const wAttr = svg.getAttribute('width');
    if (wAttr != null && parsePx(wAttr) != null) svg.removeAttribute('width');
    const hAttr = svg.getAttribute('height');
    if (hAttr != null && parsePx(hAttr) != null) svg.removeAttribute('height');

    if (parsePx(svg.style.width) != null) svg.style.removeProperty('width');
    if (parsePx(svg.style.height) != null) svg.style.removeProperty('height');

    if (!svg.hasAttribute('viewBox')) {
      try {
        const bbox = svg.getBBox();
        if (bbox && bbox.width && bbox.height) {
          svg.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
        }
      } catch (e) {
      }
    }

    if (forcePreserveAspect) {
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    svg.style.maxWidth = maxWidthPx + 'px';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';
  }

  document.querySelectorAll('svg').forEach(process);

  if (observe) {
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          if (n.tagName && n.tagName.toLowerCase() === 'svg') process(n);
          if (n.querySelectorAll) n.querySelectorAll('svg').forEach(process);
        }
      }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    return mo;
  }

  return null;
}

export {resolveSVG, makeSVGResponsive}