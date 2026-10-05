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

const M = 0.62;
const W = 13.33 - M * 2; // 12.09

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

/* =============================================== SLIDE 1 — OS GANHOS */
async function slideGanhos(pres, bg) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: bg, x: 0, y: 0, w: 13.33, h: 7.5 });

  s.addText("PLANEJAMENTO   ·   WILLYAN", {
    x: M, y: 0.5, w: 7.5, h: 0.26, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 11.5, bold: true, color: AMBER, charSpacing: 2.8,
  });

  {
    const pw = 2.95, ph = 0.46, px = M + W - pw, py = 0.4;
    s.addShape(pres.ShapeType.roundRect, {
      x: px, y: py, w: pw, h: ph, rectRadius: 0.23,
      fill: { color: AMBER, transparency: 86 }, line: { color: AMBER, width: 1 },
    });
    s.addShape(pres.ShapeType.ellipse, { x: px + 0.2, y: py + 0.11, w: 0.24, h: 0.24, fill: { color: AMBER } });
    s.addImage({ data: await iconData(Fi.FiCheck, NAVY), x: px + 0.26, y: py + 0.17, w: 0.12, h: 0.12 });
    s.addText("ACESSOS LIBERADOS", {
      x: px + 0.52, y: py, w: pw - 0.7, h: ph, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 9.5, bold: true, color: AMBER, charSpacing: 1.0,
    });
  }

  s.addText(
    [
      { text: "O dado deixa de ser relatório ", options: { color: WHITE } },
      { text: "e vira decisão", options: { color: AMBER } },
    ],
    { x: M, y: 0.85, w: 11.9, h: 0.62, isTextBox: true, margin: 0, valign: "top",
      fontFace: H, fontSize: 29, bold: true }
  );

  s.addText(
    "Willyan assume o processo, o tratamento dos dados e a construção das visões — agora com a meta dentro do relatório.",
    { x: M, y: 1.5, w: 11.9, h: 0.3, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 13.5, color: ICE }
  );

  const CY = 2.0;
  const CH = 2.56;
  const CGAP = 0.3;
  const CW = (W - 2 * CGAP) / 3;

  const cards = [
    {
      icon: Fi.FiActivity, tag: "HORA A HORA", gain: "Tempo real",
      text: "Acompanhamento contra a meta do dia: aponta onde o ritmo cai e em qual carteira, a tempo de reagir.",
      status: "Em desenvolvimento  ·  05 e 09/out",
    },
    {
      icon: Fi.FiBarChart2, tag: "DASHBOARD D-1", gain: "Um só número",
      text: "Dia anterior fechado com N4 e N5 na mesma régua: comparação direta entre carteiras, sem planilha paralela.",
      status: "N5 entregue em 29/set  ·  mais 2 em out",
    },
    {
      icon: Fi.FiTarget, tag: "METAS E COMPARATIVOS", gain: "Atingimento",
      text: "Mês a mês e contra o mês corrente: mostra a tendência e a distância da meta, não só a foto do dia.",
      status: "Aplicado ao Hora a Hora e ao D-1",
    },
  ];

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const x = M + i * (CW + CGAP);

    s.addShape(pres.ShapeType.roundRect, {
      x, y: CY, w: CW, h: CH, rectRadius: 0.12,
      fill: { color: WHITE, transparency: 91 }, line: { color: STROKE, width: 1 },
      shadow: { type: "outer", color: "030913", opacity: 0.35, blur: 14, offset: 3, angle: 90 },
    });
    s.addText(c.tag, {
      x: x + 0.34, y: CY + 0.26, w: CW - 0.68, h: 0.24, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9.5, bold: true, color: AMBER, charSpacing: 1.5,
    });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.34, y: CY + 0.56, w: 0.72, h: 0.72, fill: { color: AMBER } });
    s.addImage({ data: await iconData(c.icon, NAVY), x: x + 0.54, y: CY + 0.76, w: 0.32, h: 0.32 });
    s.addText(c.gain, {
      x: x + 1.2, y: CY + 0.56, w: CW - 1.52, h: 0.72, isTextBox: true, margin: 0, valign: "middle",
      fontFace: H, fontSize: 20, bold: true, color: WHITE,
    });
    s.addText(c.text, {
      x: x + 0.34, y: CY + 1.38, w: CW - 0.68, h: 0.6, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10.5, color: ICE, lineSpacingMultiple: 1.14,
    });
    s.addText(c.status, {
      x: x + 0.34, y: CY + 2.14, w: CW - 0.68, h: 0.22, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9, color: MUTED,
    });
  }

  const FY = 4.78;
  const FH = 2.18;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: FY, w: W, h: FH, rectRadius: 0.12,
    fill: { color: AMBER, transparency: 88 }, line: { color: AMBER, width: 1.75 },
    shadow: { type: "outer", color: "030913", opacity: 0.4, blur: 18, offset: 4, angle: 90 },
  });
  s.addText("O QUE O WILL ENTREGA POR TRÁS DAS VISÕES", {
    x: M + 0.42, y: FY + 0.26, w: 7.5, h: 0.3, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 11.5, bold: true, color: AMBER, charSpacing: 2.2,
  });

  const frentes = [
    [Fi.FiTool, "Desenvolvimento", "Constrói e evolui as visões junto com a operação"],
    [Fi.FiZap, "Automação", "Elimina o trabalho manual de relatórios e rotinas"],
    [Fi.FiSearch, "Oportunidades", "Lê o processo e aponta onde está o ganho"],
    [Fi.FiPieChart, "Estudos", "Leva análise e recomendação para a reunião"],
  ];
  const BGAP = 0.26;
  const BX = M + 0.42;
  const BW = (W - 0.84 - 3 * BGAP) / 4;
  for (let i = 0; i < frentes.length; i++) {
    const [Icon, label, note] = frentes[i];
    const x = BX + i * (BW + BGAP);
    s.addShape(pres.ShapeType.ellipse, { x, y: FY + 0.74, w: 0.46, h: 0.46, fill: { color: AMBER } });
    s.addImage({ data: await iconData(Icon, NAVY), x: x + 0.125, y: FY + 0.865, w: 0.21, h: 0.21 });
    s.addText(label, {
      x, y: FY + 1.32, w: BW, h: 0.3, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 13, bold: true, color: WHITE,
    });
    s.addText(note, {
      x, y: FY + 1.64, w: BW, h: 0.44, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 10.5, color: ICE, lineSpacingMultiple: 1.1,
    });
  }

  s.addNotes(
    "Mensagem central: o Willyan assume o processo, o tratamento dos dados e a construção das visões. A operação recebe a leitura pronta e decide. " +
      "Hora a Hora: acompanhamento intradiário contra a meta do dia — dá para ver onde o ritmo cai, em qual carteira, e reagir no mesmo turno em vez de descobrir no dia seguinte. " +
      "Dashboard D-1: dia anterior fechado com N4 e N5 na mesma régua, permitindo comparação direta entre carteiras sem planilha paralela. O D-1 da N5 foi entregue em 29/set; as demais saem em 05 e 09/out. " +
      "Metas e comparativos: como os relatórios passam a carregar a meta, ganhamos visão mês a mês e atingimento contra o mês corrente — tendência e distância da meta, não apenas a foto do dia. " +
      "Por trás das visões, o Will atua no desenvolvimento e evolução dos processos, na automação de relatórios e rotinas operacionais, na identificação de oportunidades e nos estudos que levam análise e recomendação para as reuniões. " +
      "Os acessos às ferramentas já estão todos liberados."
  );
}

/* ================================================== SLIDE 2 — PMO */
async function slidePmo(pres, bg) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: bg, x: 0, y: 0, w: 13.33, h: 7.5 });

  s.addText("PMO   ·   MAPEAMENTO DAS ENTREGAS", {
    x: M, y: 0.5, w: 7.5, h: 0.26, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 11.5, bold: true, color: AMBER, charSpacing: 2.8,
  });

  s.addText("Onde cada entrega está", {
    x: M, y: 0.85, w: 8.5, h: 0.62, isTextBox: true, margin: 0, valign: "top",
    fontFace: H, fontSize: 29, bold: true, color: WHITE,
  });

  s.addText("5 entregas mapeadas entre N4 e N5 — 1 concluída e 4 com data definida.", {
    x: M, y: 1.5, w: 8.5, h: 0.3, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 13.5, color: ICE,
  });

  // indicador de progresso
  {
    const pw = 3.25, ph = 1.0, px = M + W - pw, py = 0.5;
    s.addShape(pres.ShapeType.roundRect, {
      x: px, y: py, w: pw, h: ph, rectRadius: 0.1,
      fill: { color: WHITE, transparency: 92 }, line: { color: STROKE, width: 1 },
    });
    s.addText("PROGRESSO", {
      x: px + 0.3, y: py + 0.18, w: pw - 0.6, h: 0.24, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9, bold: true, color: MUTED, charSpacing: 1.4,
    });
    s.addText(
      [
        { text: "1", options: { fontSize: 20, bold: true, color: AMBER, fontFace: H } },
        { text: "  de 5 entregues", options: { fontSize: 12, color: WHITE } },
      ],
      { x: px + 0.3, y: py + 0.38, w: pw - 0.6, h: 0.32, isTextBox: true, margin: 0, valign: "middle", fontFace: B }
    );
    s.addShape(pres.ShapeType.roundRect, {
      x: px + 0.3, y: py + 0.76, w: pw - 0.6, h: 0.1, rectRadius: 0.05,
      fill: { color: WHITE, transparency: 80 }, line: { color: WHITE, width: 0.5, transparency: 70 },
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: px + 0.3, y: py + 0.76, w: (pw - 0.6) * 0.2, h: 0.1, rectRadius: 0.05,
      fill: { color: AMBER },
    });
  }

  /* ------------------------------------------------------------- tabela */
  const cols = [
    { label: "ENTREGA", w: 2.6 },
    { label: "CARTEIRA", w: 1.0 },
    { label: "SUPERVISOR", w: 1.9 },
    { label: "STATUS", w: 1.7 },
    { label: "PRAZO", w: 1.0 },
    { label: "APRESENTAÇÃO", w: 1.62 },
    { label: "OBSERVAÇÃO", w: 2.27 },
  ];
  const cx = [];
  let acc = M;
  cols.forEach((c) => { cx.push(acc); acc += c.w; });

  const HY = 2.0;
  cols.forEach((c, i) => {
    s.addText(c.label, {
      x: cx[i] + (i === 0 ? 0.28 : 0.12), y: HY, w: c.w - 0.2, h: 0.28,
      isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 8.5, bold: true, color: AMBER, charSpacing: 1.0,
    });
  });

  const rows = [
    ["Dashboard D-1", "N5", "Deyvid", "CONCLUÍDO", true, "29/set", "Sim", "Entregue e apresentado"],
    ["Dashboard D-1", "N5", "Andressa", "EM DESENVOLVIMENTO", false, "05/out", "Sim", "Em construção"],
    ["Dashboard D-1", "N4", "Lucas", "EM DESENVOLVIMENTO", false, "09/out", "Sim", "Em construção"],
    ["Hora a Hora", "N5", "Andressa / Deyvid", "EM DESENVOLVIMENTO", false, "05/out", "Não", "Onboarding e conceitos de base"],
    ["Hora a Hora", "N4", "Lucas", "EM DESENVOLVIMENTO", false, "09/out", "Não", "Depende de reunião com o Lucas"],
  ];

  const RY = 2.36;
  const RH = 0.6;
  const RGAP = 0.08;

  rows.forEach((r, i) => {
    const [entrega, carteira, sup, status, done, prazo, apres, obs] = r;
    const y = RY + i * (RH + RGAP);

    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: W, h: RH, rectRadius: 0.07,
      fill: { color: WHITE, transparency: done ? 90 : 94 },
      line: { color: done ? AMBER : STROKE, width: 1, transparency: done ? 0 : 45 },
    });

    s.addText(entrega, {
      x: cx[0] + 0.28, y, w: cols[0].w - 0.4, h: RH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11.5, bold: true, color: WHITE,
    });
    s.addText(carteira, {
      x: cx[1] + 0.12, y, w: cols[1].w - 0.2, h: RH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11, color: ICE,
    });
    s.addText(sup, {
      x: cx[2] + 0.12, y, w: cols[2].w - 0.2, h: RH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11, color: ICE,
    });

    const pillW = 1.5;
    s.addShape(pres.ShapeType.roundRect, {
      x: cx[3] + 0.12, y: y + (RH - 0.26) / 2, w: pillW, h: 0.26, rectRadius: 0.06,
      fill: done ? { color: AMBER } : { color: WHITE, transparency: 88 },
      line: { color: AMBER, width: 0.75, transparency: done ? 0 : 50 },
    });
    s.addText(done ? "CONCLUÍDO" : "EM DEV", {
      x: cx[3] + 0.12, y: y + (RH - 0.26) / 2, w: pillW, h: 0.26,
      isTextBox: true, margin: 0, align: "center", valign: "middle",
      fontFace: B, fontSize: 8, bold: true, color: done ? INK : AMBER, charSpacing: 0.6,
    });

    s.addText(prazo, {
      x: cx[4] + 0.12, y, w: cols[4].w - 0.2, h: RH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11, bold: true, color: WHITE,
    });
    s.addText(apres, {
      x: cx[5] + 0.12, y, w: cols[5].w - 0.2, h: RH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11, color: apres === "Sim" ? ICE : MUTED,
    });
    s.addText(obs, {
      x: cx[6] + 0.12, y, w: cols[6].w - 0.24, h: RH, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.08,
    });
  });

  /* ------------------------------------------------- pontos de atenção */
  const AY = RY + 5 * (RH + RGAP) + 0.16; // 5.88
  const AH = 1.06;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: AY, w: W, h: AH, rectRadius: 0.1,
    fill: { color: WHITE, transparency: 93 }, line: { color: STROKE, width: 1 },
  });
  s.addText("PONTOS DE\nATENÇÃO", {
    x: M + 0.36, y: AY, w: 1.35, h: AH, isTextBox: true, margin: 0, valign: "middle",
    fontFace: B, fontSize: 10, bold: true, color: AMBER, charSpacing: 1.2, lineSpacingMultiple: 1.05,
  });

  const pontos = [
    [Fi.FiBookOpen, "N5  ·  Hora a Hora", "Conceitos de base e onboarding com a Andressa em andamento"],
    [Fi.FiUsers, "N4  ·  Hora a Hora", "Relatório está com a operação; reunião com o Lucas para estruturar os KPIs"],
    [Fi.FiKey, "Acessos", "Todas as ferramentas liberadas"],
  ];
  const PX = M + 1.85;
  const PGAP = 0.24;
  const PW = (W - 1.85 - 2 * PGAP) / 3;
  for (let i = 0; i < pontos.length; i++) {
    const [Icon, label, note] = pontos[i];
    const x = PX + i * (PW + PGAP);
    s.addShape(pres.ShapeType.ellipse, { x, y: AY + 0.22, w: 0.28, h: 0.28, fill: { color: AMBER } });
    s.addImage({ data: await iconData(Icon, NAVY), x: x + 0.07, y: AY + 0.29, w: 0.14, h: 0.14 });
    s.addText(label, {
      x: x + 0.38, y: AY + 0.2, w: PW - 0.4, h: 0.3, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11, bold: true, color: WHITE,
    });
    s.addText(note, {
      x: x + 0.38, y: AY + 0.52, w: PW - 0.4, h: 0.42, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9, color: ICE, lineSpacingMultiple: 1.1,
    });
  }

  s.addNotes(
    "PMO do mapeamento. Cinco entregas entre as carteiras N4 e N5, distribuídas em dois produtos. " +
      "Dashboard D-1: N5 do Deyvid concluído e apresentado em 29/set; N5 da Andressa para 05/out e N4 do Lucas para 09/out, ambos com apresentação prevista. " +
      "Hora a Hora: N5 (Andressa e Deyvid) para 05/out e N4 (Lucas) para 09/out, sem apresentação nesta rodada. " +
      "Pontos de atenção: na N5 seguem os conceitos de base e o onboarding com a Andressa; na N4 o relatório está com a operação e depende de reunião com o Lucas para entender os KPIs e estruturar o desenvolvimento. " +
      "Acessos às ferramentas: todos liberados."
  );
}

async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Planejamento";
  pres.title = "Planejamento — ganhos e PMO";

  const bg = await backgroundData();
  await slideGanhos(pres, bg);
  await slidePmo(pres, bg);

  const out = process.argv[2] || "Planejamento_Ganhos.pptx";
  await pres.writeFile({ fileName: out });
  console.log("gerado:", out);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
