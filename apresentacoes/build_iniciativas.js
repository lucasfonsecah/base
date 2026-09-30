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
const INK = "16273F";

const H = "Cambria";
const B = "Calibri";

// ------------------------------------------------------------------ assets
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
        <stop offset="0%" stop-color="#172C4C"/>
        <stop offset="45%" stop-color="#111F38"/>
        <stop offset="100%" stop-color="#080F1C"/>
      </linearGradient>
      <radialGradient id="warm" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E9A13B" stop-opacity="0.32"/>
        <stop offset="45%" stop-color="#E9A13B" stop-opacity="0.09"/>
        <stop offset="100%" stop-color="#E9A13B" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="cool" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#4C8BD9" stop-opacity="0.26"/>
        <stop offset="100%" stop-color="#4C8BD9" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="2666" height="1500" fill="url(#bg)"/>
    <ellipse cx="2430" cy="110" rx="1120" ry="900" fill="url(#warm)"/>
    <ellipse cx="110" cy="1460" rx="1000" ry="820" fill="url(#cool)"/>
    <g fill="none" stroke="#3C63A0" stroke-opacity="0.18">
      <circle cx="2430" cy="140" r="330" stroke-width="2"/>
      <circle cx="2430" cy="140" r="520" stroke-width="2"/>
      <circle cx="2430" cy="140" r="730" stroke-width="1.5"/>
    </g>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// -------------------------------------------------------------------- deck
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Planejamento";
  pres.title = "Planejamento — iniciativas e ganhos";

  const M = 0.52;
  const W = 13.33 - M * 2; // 12.29

  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: await backgroundData(), x: 0, y: 0, w: 13.33, h: 7.5 });

  /* ---------------------------------------------------------- cabeçalho */
  s.addText("PLANEJAMENTO   ·   INICIATIVAS EM CURSO   ·   RUBENS HIPÓLITO", {
    x: M, y: 0.44, w: W, h: 0.26, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 11, bold: true, color: AMBER, charSpacing: 2.6,
  });

  s.addText(
    [
      { text: "Do onboarding à entrega ", options: { color: WHITE } },
      { text: "em uma semana", options: { color: AMBER } },
    ],
    { x: M, y: 0.76, w: 11.8, h: 0.58, isTextBox: true, margin: 0, valign: "top", fontFace: H, fontSize: 28, bold: true }
  );

  s.addText(
    "Apresentado ao cliente na semana passada — em aprendizado do processo e já com 1 entrega concluída e 4 em curso.",
    { x: M, y: 1.35, w: 11.8, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: B, fontSize: 13, color: ICE }
  );

  /* ------------------------------------------------------------- números */
  const TY = 1.82;
  const TH = 0.78;
  const TGAP = 0.22;
  const TW = (W - 3 * TGAP) / 4;

  const tiles = [
    ["5", "ENTREGAS MAPEADAS"],
    ["1", "CONCLUÍDA E APRESENTADA"],
    ["4", "EM DESENVOLVIMENTO"],
    ["2", "CARTEIRAS ATENDIDAS  ·  N4 E N5".replace(" ATENDIDAS", "")],
  ];
  tiles.forEach(([n, label], i) => {
    const x = M + i * (TW + TGAP);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: TY, w: TW, h: TH, rectRadius: 0.09,
      fill: { color: WHITE, transparency: 93 }, line: { color: STROKE, width: 1 },
    });
    s.addText(n, {
      x: x + 0.24, y: TY, w: 0.64, h: TH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: H, fontSize: 25, bold: true, color: AMBER,
    });
    s.addText(label, {
      x: x + 0.86, y: TY, w: TW - 1.08, h: TH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 9.5, bold: true, color: MUTED, charSpacing: 0.9,
    });
  });

  /* ------------------------------------------------- painel das entregas */
  const RY = 2.8;
  const RH = 3.15;
  const LW = 5.25;

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: RY, w: LW, h: RH, rectRadius: 0.1,
    fill: { color: WHITE, transparency: 93 }, line: { color: STROKE, width: 1 },
  });
  s.addShape(pres.ShapeType.ellipse, { x: M + 0.32, y: RY + 0.26, w: 0.42, h: 0.42, fill: { color: AMBER } });
  s.addImage({ data: await iconData(Fi.FiClipboard, NAVY), x: M + 0.32 + 0.11, y: RY + 0.26 + 0.11, w: 0.2, h: 0.2 });
  s.addText("ENTREGAS MAPEADAS", {
    x: M + 0.86, y: RY + 0.34, w: LW - 1.1, h: 0.28, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 10, bold: true, color: MUTED, charSpacing: 0.9,
  });

  const groups = [
    {
      title: "DASHBOARD D-1",
      rows: [
        ["N5  ·  Deyvid", "CONCLUÍDO", "29/set", true],
        ["N5  ·  Andressa", "EM DEV", "05/out", false],
        ["N4  ·  Lucas", "EM DEV", "09/out", false],
      ],
    },
    {
      title: "HORA A HORA",
      rows: [
        ["N5  ·  Andressa / Deyvid", "EM DEV", "05/out", false],
        ["N4  ·  Lucas", "EM DEV", "09/out", false],
      ],
    },
  ];

  let gy = RY + 0.82;
  groups.forEach((g) => {
    s.addText(g.title, {
      x: M + 0.34, y: gy, w: LW - 0.68, h: 0.26, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10.5, bold: true, color: WHITE, charSpacing: 1.1,
    });
    gy += 0.3;
    g.rows.forEach(([who, status, date, done]) => {
      s.addShape(pres.ShapeType.ellipse, {
        x: M + 0.36, y: gy + 0.1, w: 0.12, h: 0.12,
        fill: done ? { color: AMBER } : { color: AMBER, transparency: 62 },
      });
      s.addText(who, {
        x: M + 0.58, y: gy, w: 2.3, h: 0.3, isTextBox: true, margin: 0, valign: "middle",
        fontFace: B, fontSize: 10.5, color: ICE,
      });
      s.addShape(pres.ShapeType.roundRect, {
        x: M + 2.92, y: gy + 0.035, w: 1.05, h: 0.23, rectRadius: 0.05,
        fill: done ? { color: AMBER } : { color: WHITE, transparency: 90 },
        line: { color: AMBER, width: 0.75, transparency: done ? 0 : 55 },
      });
      s.addText(status, {
        x: M + 2.92, y: gy + 0.035, w: 1.05, h: 0.23, isTextBox: true, margin: 0, align: "center", valign: "middle",
        fontFace: B, fontSize: 7.5, bold: true, color: done ? INK : AMBER, charSpacing: 0.5,
      });
      s.addText(date, {
        x: M + 4.08, y: gy, w: 0.83, h: 0.3, isTextBox: true, margin: 0, align: "right", valign: "middle",
        fontFace: B, fontSize: 10.5, bold: true, color: WHITE,
      });
      gy += 0.32;
    });
    gy += 0.12;
  });

  /* ------------------------------------------------------- painel ganhos */
  const GX = M + LW + 0.26;
  const GW = M + W - GX; // 6.78
  const CGAP = 0.22;
  const CW = (GW - CGAP) / 2;
  const CH = (RH - CGAP) / 2;

  const gains = [
    [Fi.FiClock, "Decisão no mesmo dia", "O Hora a Hora dá leitura intradiária: dá para corrigir a rota antes de o dia fechar."],
    [Fi.FiGrid, "Régua única por carteira", "O D-1 padroniza a leitura de N4 e N5 — todos discutem o mesmo número."],
    [Fi.FiUserCheck, "Autonomia do supervisor", "Visão recorrente e pronta, sem depender de extração manual a cada pedido."],
    [Fi.FiTarget, "Visão dirigida à meta", "As visões nascem das metas do cliente: o dado chega como direcionamento."],
  ];

  for (let i = 0; i < gains.length; i++) {
    const [Icon, title, desc] = gains[i];
    const x = GX + (i % 2) * (CW + CGAP);
    const y = RY + Math.floor(i / 2) * (CH + CGAP);

    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: CW, h: CH, rectRadius: 0.1,
      fill: { color: WHITE, transparency: 90 }, line: { color: AMBER, width: 1, transparency: 45 },
    });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.26, y: y + 0.24, w: 0.42, h: 0.42, fill: { color: AMBER } });
    s.addImage({ data: await iconData(Icon, NAVY), x: x + 0.26 + 0.11, y: y + 0.24 + 0.11, w: 0.2, h: 0.2 });
    s.addText(title, {
      x: x + 0.78, y: y + 0.3, w: CW - 0.98, h: 0.32, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11, bold: true, color: WHITE,
    });
    s.addText(desc, {
      x: x + 0.28, y: y + 0.78, w: CW - 0.56, h: 0.6, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10, color: ICE, lineSpacingMultiple: 1.12,
    });
  }

  /* ------------------------------------------------------ para destravar */
  const DY = 6.1;
  const DH = 0.9;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: DY, w: W, h: DH, rectRadius: 0.09,
    fill: { color: WHITE, transparency: 94 }, line: { color: STROKE, width: 1 },
  });
  s.addText("PARA\nDESTRAVAR", {
    x: M + 0.32, y: DY, w: 1.5, h: DH, isTextBox: true, margin: 0, valign: "middle",
    fontFace: B, fontSize: 10, bold: true, color: AMBER, charSpacing: 1.2, lineSpacingMultiple: 1.05,
  });

  const blocks = [
    [Fi.FiBookOpen, "Conceitos de base e onboarding", "N5  ·  Andressa e Deyvid"],
    [Fi.FiUsers, "Reunião com o Lucas — KPIs do N4", "Relatório hoje está com a operação"],
    [Fi.FiKey, "Mapa de acessos às ferramentas", "Levantamento em aberto"],
  ];
  const BX = M + 2.05;
  const BW = (W - 2.05 - 2 * 0.2) / 3;
  for (let i = 0; i < blocks.length; i++) {
    const [Icon, label, note] = blocks[i];
    const x = BX + i * (BW + 0.2);
    s.addImage({ data: await iconData(Icon, AMBER), x, y: DY + 0.24, w: 0.2, h: 0.2 });
    s.addText(label, {
      x: x + 0.3, y: DY + 0.18, w: BW - 0.35, h: 0.28, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 10.5, bold: true, color: WHITE,
    });
    s.addText(note, {
      x: x + 0.3, y: DY + 0.45, w: BW - 0.35, h: 0.26, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 9.5, color: MUTED,
    });
  }

  s.addNotes(
    "Recurso de Planejamento recém-chegado, apresentado ao cliente na semana passada. Está em fase de aprendizado do processo, mas já entrou entregando: " +
      "o Dashboard D-1 da N5 (Deyvid) foi concluído e apresentado em 29/set, e há mais quatro entregas em desenvolvimento com prazos em 05 e 09/out. " +
      "O ganho das iniciativas: o Hora a Hora permite decisão dentro do próprio dia; o D-1 padroniza a régua de leitura entre N4 e N5; o supervisor passa a ter visão pronta e recorrente, sem extração manual; " +
      "e as visões são construídas a partir das metas do cliente, chegando como direcionamento e não como número bruto. " +
      "Para manter o ritmo: fechar conceitos de base e onboarding com Andressa e Deyvid (N5), agendar a reunião com o Lucas para entender os KPIs do N4 e estruturar o desenvolvimento, e concluir o mapa de acessos."
  );

  const out = process.argv[2] || "Planejamento_Iniciativas.pptx";
  await pres.writeFile({ fileName: out });
  console.log("gerado:", out);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
