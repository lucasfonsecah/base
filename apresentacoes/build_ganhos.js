const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const Fi = require("react-icons/fi");

// ---------------------------------------------------------------- palette
const NAVY = "12203A";
const STROKE = "31507F";
const AMBER = "E9A13B";
const ICE = "D8E4F4";
const MUTED = "93A9C6";
const WHITE = "FFFFFF";

const H = "Cambria";
const B = "Calibri";

async function iconData(Icon, hex, px = 256) {
  let svg = renderToStaticMarkup(React.createElement(Icon, { size: px }));
  svg = svg.replace(/currentColor/g, "#" + hex);
  if (!/\bwidth=/.test(svg)) svg = svg.replace("<svg", `<svg width="${px}" height="${px}"`);
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function backgroundData() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2666" height="1500">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#182E50"/>
        <stop offset="45%" stop-color="#111F38"/>
        <stop offset="100%" stop-color="#070E1A"/>
      </linearGradient>
      <radialGradient id="warm" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E9A13B" stop-opacity="0.34"/>
        <stop offset="45%" stop-color="#E9A13B" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#E9A13B" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="cool" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#4C8BD9" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#4C8BD9" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="2666" height="1500" fill="url(#bg)"/>
    <ellipse cx="2400" cy="120" rx="1150" ry="920" fill="url(#warm)"/>
    <ellipse cx="120" cy="1440" rx="1050" ry="860" fill="url(#cool)"/>
    <g fill="none" stroke="#3C63A0" stroke-opacity="0.16">
      <circle cx="2400" cy="150" r="360" stroke-width="2"/>
      <circle cx="2400" cy="150" r="570" stroke-width="2"/>
      <circle cx="2400" cy="150" r="790" stroke-width="1.5"/>
    </g>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Planejamento";
  pres.title = "Planejamento — os ganhos das novas visões";

  const M = 0.62;
  const W = 13.33 - M * 2; // 12.09

  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: await backgroundData(), x: 0, y: 0, w: 13.33, h: 7.5 });

  /* ---------------------------------------------------------- cabeçalho */
  s.addText("PLANEJAMENTO   ·   WILLYAN", {
    x: M, y: 0.55, w: W, h: 0.26, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 11.5, bold: true, color: AMBER, charSpacing: 2.8,
  });

  s.addText(
    [
      { text: "O dado deixa de ser relatório\n", options: { color: WHITE } },
      { text: "e vira decisão", options: { color: AMBER } },
    ],
    { x: M, y: 0.92, w: 9.5, h: 1.15, isTextBox: true, margin: 0, valign: "top",
      fontFace: H, fontSize: 34, bold: true, lineSpacingMultiple: 1.04 }
  );

  s.addText(
    "Willyan assume o processo e todo o tratamento dos dados. A operação recebe a visão pronta — e age.",
    { x: M, y: 2.24, w: 10.5, h: 0.32, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 14, color: ICE }
  );

  /* -------------------------------------------------------- duas visões */
  const CY = 2.84;
  const CH = 2.92;
  const CGAP = 0.35;
  const CW = (W - CGAP) / 2;

  const cards = [
    {
      icon: Fi.FiActivity,
      tag: "HORA A HORA",
      gain: "Tempo real",
      text: "A operação enxerga o que está acontecendo agora e corrige a rota no mesmo turno.",
      status: "Em desenvolvimento  ·  N5 e N4  ·  05 e 09/out",
      warm: true,
    },
    {
      icon: Fi.FiBarChart2,
      tag: "DASHBOARD D-1",
      gain: "Um só número",
      text: "N4 e N5 na mesma régua: o dia anterior fechado e comparável, sem planilha paralela.",
      status: "N5 entregue em 29/set  ·  mais 2 em 05 e 09/out",
      warm: false,
    },
  ];

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const x = M + i * (CW + CGAP);

    s.addShape(pres.ShapeType.roundRect, {
      x, y: CY, w: CW, h: CH, rectRadius: 0.12,
      fill: { color: WHITE, transparency: c.warm ? 89 : 92 },
      line: { color: c.warm ? AMBER : STROKE, width: c.warm ? 1.5 : 1 },
      shadow: { type: "outer", color: "030913", opacity: 0.4, blur: 16, offset: 4, angle: 90 },
    });

    s.addText(c.tag, {
      x: x + 0.44, y: CY + 0.36, w: CW - 0.88, h: 0.26, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10.5, bold: true, color: c.warm ? AMBER : MUTED, charSpacing: 1.8,
    });

    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.44, y: CY + 0.78, w: 1.0, h: 1.0,
      fill: { color: c.warm ? AMBER : WHITE },
    });
    s.addImage({
      data: await iconData(c.icon, NAVY),
      x: x + 0.44 + 0.27, y: CY + 0.78 + 0.27, w: 0.46, h: 0.46,
    });

    s.addText(c.gain, {
      x: x + 1.66, y: CY + 0.96, w: CW - 2.1, h: 0.64, isTextBox: true, margin: 0, valign: "middle",
      fontFace: H, fontSize: 30, bold: true, color: WHITE,
    });

    s.addText(c.text, {
      x: x + 0.44, y: CY + 1.96, w: CW - 0.88, h: 0.62, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 13.5, color: ICE, lineSpacingMultiple: 1.16,
    });

    s.addText(c.status, {
      x: x + 0.44, y: CY + 2.56, w: CW - 0.88, h: 0.26, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10.5, color: MUTED,
    });
  }

  /* ------------------------------------------------------------- rodapé */
  const FY = 6.06;
  const FH = 0.78;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: FY, w: W, h: FH, rectRadius: 0.1,
    fill: { color: WHITE, transparency: 94 }, line: { color: STROKE, width: 1 },
  });

  const wins = ["Sem extração manual", "Uma única fonte de número", "Alinhado às metas do cliente"];
  const IW = (W - 0.9) / 3;
  for (let i = 0; i < wins.length; i++) {
    const x = M + 0.45 + i * IW;
    s.addShape(pres.ShapeType.ellipse, { x, y: FY + FH / 2 - 0.13, w: 0.26, h: 0.26, fill: { color: AMBER } });
    s.addImage({
      data: await iconData(Fi.FiCheck, NAVY),
      x: x + 0.06, y: FY + FH / 2 - 0.07, w: 0.14, h: 0.14,
    });
    s.addText(wins[i], {
      x: x + 0.4, y: FY, w: IW - 0.55, h: FH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 12.5, color: WHITE,
    });
  }

  s.addNotes(
    "Mensagem central: o Planejamento (Willyan) assume o processo e todo o tratamento dos dados; a operação recebe a visão pronta e foca na ação. " +
      "Hora a Hora: a operação passa a enxergar em tempo real o que está acontecendo e corrige a rota dentro do próprio turno, em vez de descobrir no dia seguinte. " +
      "Dashboard D-1: N4 e N5 passam a ler o dia anterior na mesma régua — um só número, sem planilha paralela. O D-1 da N5 já foi entregue em 29/set; as demais visões saem em 05 e 09/out."
  );

  const out = process.argv[2] || "Planejamento_Ganhos.pptx";
  await pres.writeFile({ fileName: out });
  console.log("gerado:", out);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
