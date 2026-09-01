const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const Fi = require("react-icons/fi");

// ---------------------------------------------------------------- palette
const NAVY = "12203A";
const DEEP = "0A1526";
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
        <stop offset="0%" stop-color="#E9A13B" stop-opacity="0.34"/>
        <stop offset="45%" stop-color="#E9A13B" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#E9A13B" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="cool" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#4C8BD9" stop-opacity="0.26"/>
        <stop offset="100%" stop-color="#4C8BD9" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="2666" height="1500" fill="url(#bg)"/>
    <ellipse cx="2430" cy="120" rx="1120" ry="900" fill="url(#warm)"/>
    <ellipse cx="120" cy="1460" rx="1000" ry="820" fill="url(#cool)"/>
    <g fill="none" stroke="#3C63A0" stroke-opacity="0.20">
      <circle cx="2430" cy="150" r="330" stroke-width="2"/>
      <circle cx="2430" cy="150" r="520" stroke-width="2"/>
      <circle cx="2430" cy="150" r="730" stroke-width="1.5"/>
    </g>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// -------------------------------------------------------------------- deck
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.author = "Planejamento";
  pres.title = "Planejamento assume o dado ponta a ponta";

  const M = 0.52;
  const W = 13.33 - M * 2; // 12.29

  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: await backgroundData(), x: 0, y: 0, w: 13.33, h: 7.5 });

  /* ---------------------------------------------------------- cabeçalho */
  s.addText("NOVO MODELO DE ATUAÇÃO   ·   RUBENS HIPÓLITO   ·   PLANEJAMENTO", {
    x: M, y: 0.44, w: W, h: 0.26, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 11, bold: true, color: AMBER, charSpacing: 2.6,
  });

  s.addText(
    [
      { text: "Planejamento assume o dado ", options: { color: WHITE } },
      { text: "ponta a ponta", options: { color: AMBER } },
    ],
    {
      x: M, y: 0.76, w: 11.6, h: 0.62, isTextBox: true, margin: 0, valign: "top",
      fontFace: H, fontSize: 30, bold: true,
    }
  );

  s.addText(
    "A operação foca no dia a dia — analistas e atividades. O dado ganha um único dono, da origem ao indicador.",
    {
      x: M, y: 1.42, w: 11.6, h: 0.3, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 13.5, color: ICE,
    }
  );

  /* ------------------------------------------------- faixa de propriedade */
  const FGAP = 0.16;
  const FW = (W - 5 * FGAP) / 6; // 1.915
  const col = (i) => M + i * (FW + FGAP);

  const chips = [
    [col(0), 3 * FW + 2 * FGAP, "PLANEJAMENTO", AMBER, true],
    [col(3), FW, "OPERAÇÃO", WHITE, false],
    [col(4), FW, "PLANEJAMENTO", AMBER, true],
    [col(5), FW, "ML", ICE, false],
  ];
  chips.forEach(([x, w, label, color, warm]) => {
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.9, w, h: 0.28, rectRadius: 0.06,
      fill: { color: warm ? AMBER : WHITE, transparency: 88 },
      line: { color: warm ? AMBER : WHITE, width: 0.75, transparency: 55 },
    });
    s.addText(label, {
      x, y: 1.9, w, h: 0.28, isTextBox: true, margin: 0, align: "center", valign: "middle",
      fontFace: B, fontSize: 9, bold: true, color, charSpacing: 1.6,
    });
  });

  /* -------------------------------------------------------------- fluxo */
  const FY = 2.32;
  const FH = 1.94;

  const steps = [
    [Fi.FiInbox, "RECEPÇÃO", "Recebe os arquivos e as bases de origem.", "plan"],
    [Fi.FiFilter, "TRATATIVA", "Aplica as regras e padroniza a informação.", "plan"],
    [Fi.FiSend, "DISTRIBUIÇÃO", "Direciona à operação o que exige ação.", "plan"],
    [Fi.FiUsers, "EXECUÇÃO", "Time atua nas demandas do dia a dia.", "op"],
    [Fi.FiCheckCircle, "CONSOLIDAÇÃO", "Reúne o retorno, valida e fecha a base.", "plan"],
    [Fi.FiTrendingUp, "KPIs", "Base oficial pronta para os indicadores.", "kpi"],
  ];

  // linha condutora, atrás dos cards
  s.addShape(pres.ShapeType.rect, {
    x: col(0) + 0.55, y: FY + 0.54, w: col(5) + 0.55 - (col(0) + 0.55), h: 0.02,
    fill: { color: STROKE },
  });

  for (let i = 0; i < steps.length; i++) {
    const [Icon, title, desc, kind] = steps[i];
    const x = col(i);
    const isOp = kind === "op";
    const isKpi = kind === "kpi";
    const solid = isOp || isKpi;

    s.addShape(pres.ShapeType.roundRect, {
      x, y: FY, w: FW, h: FH, rectRadius: 0.1,
      fill: isOp ? { color: WHITE } : isKpi ? { color: AMBER } : { color: WHITE, transparency: 92 },
      line: { color: solid ? (isOp ? WHITE : AMBER) : STROKE, width: 1 },
      shadow: { type: "outer", color: "030913", opacity: 0.35, blur: 12, offset: 3, angle: 90 },
    });

    const ringFill = solid ? NAVY : AMBER;
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.26, y: FY + 0.25, w: 0.58, h: 0.58, fill: { color: ringFill },
    });
    s.addImage({
      data: await iconData(Icon, solid ? WHITE : NAVY),
      x: x + 0.26 + 0.155, y: FY + 0.25 + 0.155, w: 0.27, h: 0.27,
    });

    s.addText(title, {
      x: x + 0.26, y: FY + 0.97, w: FW - 0.36, h: 0.28, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10.5, bold: true, color: solid ? INK : WHITE, charSpacing: 0,
    });
    s.addText(desc, {
      x: x + 0.26, y: FY + 1.26, w: FW - 0.48, h: 0.6, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9.5, color: solid ? "44587A" : ICE, lineSpacingMultiple: 1.12,
    });
  }

  /* ------------------------------------------------------------- painéis */
  const PY = 4.46;
  const PH = 1.97;
  const PGAP = 0.24;
  const PW = 3.35;
  const P3W = W - 2 * PW - 2 * PGAP;

  async function panel(x, w, Icon, title, highlight) {
    s.addShape(pres.ShapeType.roundRect, {
      x, y: PY, w, h: PH, rectRadius: 0.1,
      fill: { color: WHITE, transparency: highlight ? 88 : 93 },
      line: { color: highlight ? AMBER : STROKE, width: highlight ? 1.25 : 1 },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.3, y: PY + 0.28, w: 0.44, h: 0.44,
      fill: { color: AMBER },
    });
    s.addImage({
      data: await iconData(Icon, NAVY),
      x: x + 0.3 + 0.115, y: PY + 0.28 + 0.115, w: 0.21, h: 0.21,
    });
    s.addText(title, {
      x: x + 0.84, y: PY + 0.38, w: w - 1.0, h: 0.28, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10, bold: true, color: highlight ? AMBER : MUTED, charSpacing: 0.8,
    });
  }

  function bullets(x, w, items) {
    s.addText(
      items.map((t, i) => ({
        text: t,
        options: { bullet: { code: "2022" }, breakLine: i !== items.length - 1 },
      })),
      {
        x: x + 0.34, y: PY + 0.88, w: w - 0.68, h: PH - 1.05, isTextBox: true, margin: 0, valign: "top",
        fontFace: B, fontSize: 11.5, color: ICE, paraSpaceAfter: 9, lineSpacingMultiple: 1.04,
      }
    );
  }

  await panel(M, PW, Fi.FiUsers, "A OPERAÇÃO GANHA", false);
  bullets(M, PW, ["Foco no dia a dia", "Atenção aos analistas", "Qualidade e prazo das entregas"]);

  const P2 = M + PW + PGAP;
  await panel(P2, PW, Fi.FiDatabase, "O PLANEJAMENTO ASSUME", false);
  bullets(P2, PW, ["O dado de ponta a ponta", "Tratativa num só ponto", "Base validada para os KPIs"]);

  const P3 = P2 + PW + PGAP;
  await panel(P3, P3W, Fi.FiCompass, "LEITURA CONSULTIVA  ·  VISÃO MICRO", true);

  const insights = [
    ["Gargalos", "onde o processo trava"],
    ["Oportunidades", "ganhos rápidos no fluxo"],
    ["Aproveitamento", "o que funciona e deve replicar"],
    ["Direcionamento", "decisão sustentada em dado"],
  ];
  insights.forEach(([label, desc], i) => {
    const y = PY + 0.88 + i * 0.27;
    s.addShape(pres.ShapeType.ellipse, { x: P3 + 0.34, y: y + 0.085, w: 0.12, h: 0.12, fill: { color: AMBER } });
    s.addText(
      [
        { text: label + " — ", options: { bold: true, color: WHITE } },
        { text: desc, options: { color: ICE } },
      ],
      { x: P3 + 0.58, y, w: P3W - 0.92, h: 0.28, isTextBox: true, margin: 0, valign: "middle", fontFace: B, fontSize: 10.5 }
    );
  });

  /* -------------------------------------------------------------- rodapé */
  s.addText(
    [
      { text: "13", options: { fontSize: 18, bold: true, color: AMBER, fontFace: H } },
      { text: "  demandas      ", options: { fontSize: 10.5, color: MUTED } },
      { text: "4", options: { fontSize: 18, bold: true, color: AMBER, fontFace: H } },
      { text: "  sob tratativa direta      ", options: { fontSize: 10.5, color: MUTED } },
      { text: "02/09", options: { fontSize: 18, bold: true, color: AMBER, fontFace: H } },
      { text: "  alinhamento presencial", options: { fontSize: 10.5, color: MUTED } },
    ],
    { x: M, y: 6.58, w: 7.55, h: 0.45, isTextBox: true, margin: 0, valign: "middle", fontFace: B }
  );

  s.addText("Operação executa. Planejamento é dono do dado — e do direcionamento.", {
    x: 8.25, y: 6.58, w: W + M - 8.25, h: 0.45, isTextBox: true, margin: 0, valign: "middle", align: "right",
    fontFace: H, fontSize: 12, bold: true, italic: true, color: WHITE,
  });

  s.addNotes(
    "One-pager. A operação sai do trabalho de tratar arquivo e volta o foco para os analistas e o dia a dia. " +
      "O Planejamento passa a recepcionar os arquivos, fazer as tratativas, distribuir para a operação, consolidar, validar e disponibilizar a base oficial para o ML construir os KPIs. " +
      "Por atuar em toda a cadeia, também devolve leitura consultiva: gargalos, oportunidades, o que já funciona bem e recomendações sustentadas em dado — visão micro do processo, não o número bruto."
  );

  const out = process.argv[2] || "Planejamento_OnePager.pptx";
  await pres.writeFile({ fileName: out });
  console.log("gerado:", out);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
