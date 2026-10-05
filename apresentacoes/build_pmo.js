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

let pres;

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

// ------------------------------------------------------------- utilitários
function header(s, eyebrow, title, sub, titleW = 8.6) {
  s.addText(eyebrow, {
    x: M, y: 0.5, w: 8.0, h: 0.26, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 11.5, bold: true, color: AMBER, charSpacing: 2.8,
  });
  s.addText(title, {
    x: M, y: 0.85, w: titleW, h: 0.6, isTextBox: true, margin: 0, valign: "top",
    fontFace: H, fontSize: 28, bold: true, color: WHITE,
  });
  s.addText(sub, {
    x: M, y: 1.48, w: titleW + 0.4, h: 0.3, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 13, color: ICE,
  });
}

function progressPanel(s, done, total, caption) {
  const pw = 3.25, ph = 1.0, px = M + W - pw, py = 0.5;
  s.addShape(pres.ShapeType.roundRect, {
    x: px, y: py, w: pw, h: ph, rectRadius: 0.1,
    fill: { color: WHITE, transparency: 92 }, line: { color: STROKE, width: 1 },
  });
  s.addText(caption, {
    x: px + 0.3, y: py + 0.17, w: pw - 0.6, h: 0.24, isTextBox: true, margin: 0, valign: "top",
    fontFace: B, fontSize: 9, bold: true, color: MUTED, charSpacing: 1.4,
  });
  s.addText(
    [
      { text: String(done), options: { fontSize: 20, bold: true, color: AMBER, fontFace: H } },
      { text: `  de ${total} concluídas`, options: { fontSize: 11.5, color: WHITE } },
    ],
    { x: px + 0.3, y: py + 0.38, w: pw - 0.6, h: 0.32, isTextBox: true, margin: 0, valign: "middle", fontFace: B }
  );
  s.addShape(pres.ShapeType.roundRect, {
    x: px + 0.3, y: py + 0.76, w: pw - 0.6, h: 0.1, rectRadius: 0.05,
    fill: { color: WHITE, transparency: 80 }, line: { color: WHITE, width: 0.5, transparency: 70 },
  });
  if (done > 0) {
    s.addShape(pres.ShapeType.roundRect, {
      x: px + 0.3, y: py + 0.76, w: (pw - 0.6) * (done / total), h: 0.1, rectRadius: 0.05,
      fill: { color: AMBER },
    });
  }
}

// level: 0 concluído · 1 em andamento · 2 pendente
function statusPill(s, x, y, w, text, level) {
  const h = 0.26;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: level === 0 ? { color: AMBER } : { color: WHITE, transparency: level === 1 ? 88 : 93 },
    line: { color: level === 2 ? ICE : AMBER, width: 0.75, transparency: level === 0 ? 0 : 50 },
  });
  s.addText(text, {
    x, y, w, h, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: B, fontSize: 7.5, bold: true, charSpacing: 0.5,
    color: level === 0 ? INK : level === 1 ? AMBER : ICE,
  });
}

function panel(s, x, y, w, h, highlight) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.11,
    fill: { color: highlight ? AMBER : WHITE, transparency: highlight ? 88 : 92 },
    line: { color: highlight ? AMBER : STROKE, width: highlight ? 1.5 : 1 },
  });
}

/* =============================================== SLIDE 1 — OS GANHOS */
async function slideGanhos(bg) {
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

  const CY = 2.0, CH = 2.56, CGAP = 0.3;
  const CW = (W - 2 * CGAP) / 3;
  const cards = [
    {
      icon: Fi.FiActivity, tag: "HORA A HORA", gain: "Tempo real",
      text: "Acompanhamento contra a meta do dia: aponta onde o ritmo cai e em qual carteira, a tempo de reagir.",
      status: "N4 concluído  ·  N5 em desenvolvimento",
    },
    {
      icon: Fi.FiBarChart2, tag: "DASHBOARD D-1", gain: "Um só número",
      text: "Dia anterior fechado com N4 e N5 na mesma régua: comparação direta entre carteiras, sem planilha paralela.",
      status: "27 métricas mapeadas  ·  8 concluídas",
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

  const FY = 4.78, FH = 2.18;
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
  const BGAP = 0.26, BX = M + 0.42;
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
      "Hora a Hora: acompanhamento intradiário contra a meta do dia — dá para ver onde o ritmo cai, em qual carteira, e reagir no mesmo turno. Já concluído na N4; N5 em desenvolvimento. " +
      "Dashboard D-1: dia anterior fechado com N4 e N5 na mesma régua. São 27 métricas mapeadas nos três dashboards, 8 já concluídas. " +
      "Metas e comparativos: com a meta dentro do relatório, ganhamos visão mês a mês e atingimento contra o mês corrente. " +
      "Por trás das visões, o Will atua no desenvolvimento dos processos, na automação de relatórios e rotinas, na identificação de oportunidades e nos estudos que levam análise para as reuniões."
  );
}

/* ====================================== SLIDE 2 — PMO DOS DASHBOARDS */
async function slideDashboards(bg) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: bg, x: 0, y: 0, w: 13.33, h: 7.5 });

  header(
    s,
    "PMO   ·   MAPEAMENTO DOS DASHBOARDS",
    "Métricas por carteira",
    "27 métricas mapeadas nos três dashboards — 8 concluídas e 19 em andamento."
  );
  progressPanel(s, 8, 27, "MÉTRICAS");

  const dashes = [
    {
      nome: "N5 ONBOARDING", per: "Periodicidade a definir", done: 0,
      grupos: [
        ["QUANTITATIVO", [
          ["P.A", "Cliente", false, "10/10"],
          ["Clientes trabalhados", "Deyvid", false, "10/10"],
          ["Clientes finalizados", "Deyvid", false, "10/10"],
          ["SLA", "Deyvid", false, "10/10"],
        ]],
        ["TEMPOS", [
          ["Tempo logado", "Willyan", false, "05/10"],
          ["Tempo pausas", "Willyan", false, "05/10"],
        ]],
        ["ANÁLISES %", [
          ["Clientes / PA", "Willyan", false, "10/10"],
          ["Finalizados / PA", "Willyan", false, "10/10"],
          ["Reagendados", "Willyan", false, "10/10"],
        ]],
      ],
    },
    {
      nome: "N5 PRÓ-ATIVOS", per: "Periodicidade a definir", done: 2,
      grupos: [
        ["QUANTITATIVO", [
          ["P.A", "Cliente", false, "05/10"],
          ["Clientes trabalhados", "Andressa", true, "08/10"],
          ["Clientes finalizados", "Andressa", true, "08/10"],
          ["SLA", "Andressa", false, "08/10"],
        ]],
        ["TEMPOS", [
          ["Tempo logado", "Willyan", false, "05/10"],
          ["Tempo pausas", "Willyan", false, "05/10"],
        ]],
        ["ANÁLISES %", [
          ["Clientes / PA", "Willyan", false, "08/10"],
          ["Finalizados / PA", "Willyan", false, "08/10"],
          ["Reagendados", "Willyan", false, "08/10"],
        ]],
      ],
    },
    {
      nome: "N4", per: "Diária (D-1)", done: 6,
      grupos: [
        ["QUANTITATIVO", [
          ["P.A", "Cliente", false, "05/10"],
          ["Clientes trabalhados", "Deyvid", true, "08/10"],
          ["Clientes finalizados", "Deyvid", true, "08/10"],
          ["SLA", "Deyvid", true, "08/10"],
        ]],
        ["TEMPOS", [
          ["Tempo logado", "Willyan", false, "05/10"],
          ["Tempo pausas", "Willyan", false, "05/10"],
        ]],
        ["ANÁLISES %", [
          ["Clientes / PA", "Willyan", true, "08/10"],
          ["Finalizados / PA", "Willyan", true, "08/10"],
          ["Reagendados", "Willyan", true, "08/10"],
        ]],
      ],
    },
  ];

  const CY = 2.08, CH = 4.1, CGAP = 0.3;
  const CW = (W - 2 * CGAP) / 3;

  dashes.forEach((d, i) => {
    const x = M + i * (CW + CGAP);
    panel(s, x, CY, CW, CH, d.done === 6);

    s.addText(d.nome, {
      x: x + 0.3, y: CY + 0.26, w: CW - 1.3, h: 0.3, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 13, bold: true, color: WHITE, charSpacing: 0.8,
    });
    s.addText(`${d.done}/9`, {
      x: x + CW - 1.0, y: CY + 0.26, w: 0.7, h: 0.3, isTextBox: true, margin: 0, align: "right", valign: "middle",
      fontFace: H, fontSize: 14, bold: true, color: AMBER,
    });
    s.addText(d.per, {
      x: x + 0.3, y: CY + 0.56, w: CW - 0.6, h: 0.22, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9, color: MUTED,
    });

    // barra de progresso do card
    const bw = CW - 0.6;
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3, y: CY + 0.82, w: bw, h: 0.08, rectRadius: 0.04,
      fill: { color: WHITE, transparency: 80 }, line: { color: WHITE, width: 0.5, transparency: 72 },
    });
    if (d.done > 0) {
      s.addShape(pres.ShapeType.roundRect, {
        x: x + 0.3, y: CY + 0.82, w: bw * (d.done / 9), h: 0.08, rectRadius: 0.04, fill: { color: AMBER },
      });
    }

    let gy = CY + 1.06;
    const fx = x + CW - 1.52;   // focal
    const px = x + CW - 0.74;   // prazo

    d.grupos.forEach(([titulo, itens], gi) => {
      s.addText(titulo, {
        x: x + 0.3, y: gy, w: CW - 1.7, h: 0.22, isTextBox: true, margin: 0, valign: "middle",
        fontFace: B, fontSize: 8, bold: true, color: AMBER, charSpacing: 1.3,
      });
      if (gi === 0) {
        s.addText("FOCAL", {
          x: fx, y: gy, w: 0.7, h: 0.22, isTextBox: true, margin: 0, align: "right", valign: "middle",
          fontFace: B, fontSize: 7, bold: true, color: MUTED, charSpacing: 0.8,
        });
        s.addText("PRAZO", {
          x: px, y: gy, w: 0.44, h: 0.22, isTextBox: true, margin: 0, align: "right", valign: "middle",
          fontFace: B, fontSize: 7, bold: true, color: MUTED, charSpacing: 0.8,
        });
      }
      gy += 0.24;
      itens.forEach(([nome, focal, ok, prazo]) => {
        s.addShape(pres.ShapeType.ellipse, {
          x: x + 0.32, y: gy + 0.06, w: 0.11, h: 0.11,
          fill: ok ? { color: AMBER } : { color: AMBER, transparency: 65 },
        });
        s.addText(nome, {
          x: x + 0.52, y: gy, w: CW - 2.1, h: 0.22, isTextBox: true, margin: 0, valign: "middle",
          fontFace: B, fontSize: 10, color: ok ? WHITE : ICE,
        });
        s.addText(focal, {
          x: fx, y: gy, w: 0.7, h: 0.22, isTextBox: true, margin: 0, align: "right", valign: "middle",
          fontFace: B, fontSize: 8.5, color: MUTED,
        });
        s.addText(prazo, {
          x: px, y: gy, w: 0.44, h: 0.22, isTextBox: true, margin: 0, align: "right", valign: "middle",
          fontFace: B, fontSize: 9, bold: !ok, color: ok ? MUTED : AMBER,
        });
        gy += 0.22;
      });
      gy += 0.04;
    });
  });

  // rodapé
  const FY = 6.42;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: FY, w: W, h: 0.6, rectRadius: 0.09,
    fill: { color: WHITE, transparency: 94 }, line: { color: STROKE, width: 1 },
  });
  s.addText(
    [
      { text: "ORIGEM DOS DADOS   ", options: { bold: true, color: AMBER, fontSize: 9, charSpacing: 1.3 } },
      { text: "CRM  ·  Pmóvel  ·  Planilha do supervisor  ·  Dashboard", options: { color: ICE, fontSize: 11 } },
      { text: "          PRAZO EM ÂMBAR   ", options: { bold: true, color: AMBER, fontSize: 9, charSpacing: 1.3 } },
      { text: "métrica ainda em andamento", options: { color: ICE, fontSize: 11 } },
    ],
    { x: M + 0.4, y: FY, w: W - 0.8, h: 0.6, isTextBox: true, margin: 0, valign: "middle", fontFace: B }
  );

  s.addNotes(
    "PMO dos dashboards: 27 métricas mapeadas entre N5 Onboarding, N5 Pró-Ativos e N4, divididas em quantitativo, tempos e análises percentuais. " +
      "O N4 está mais maduro, com 6 de 9 métricas concluídas e periodicidade diária D-1 já definida. O N5 Pró-Ativos tem 2 de 9 e o N5 Onboarding ainda não tem métrica concluída. " +
      "Os tempos (logado e pausas) vêm do Pmóvel e estão com o Willyan nas três carteiras, com prazo em 05/10. " +
      "O P.A depende do cliente nas três carteiras. Os prazos restantes se concentram em 08 e 10/10."
  );
}

/* ====================================== SLIDE 3 — PMO DOS PROCESSOS */
async function slideProcessos(bg) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: bg, x: 0, y: 0, w: 13.33, h: 7.5 });

  header(
    s,
    "PMO   ·   PROCESSOS RECORRENTES",
    "Quem opera cada rotina",
    "4 rotinas em 3 carteiras — 4 concluídas, 4 em andamento e 4 pendentes de acesso externo."
  );
  progressPanel(s, 4, 12, "ROTINAS");

  const LW = 3.5;
  const CGAP = 0.2;
  const CW = (W - LW - 2 * CGAP) / 3;
  const colX = [M + LW, M + LW + CW + CGAP, M + LW + 2 * (CW + CGAP)];
  const carteiras = ["N5 PRÓ-ATIVOS", "N5 ONBOARDING", "N4"];

  const HY = 2.1;
  carteiras.forEach((c, i) => {
    s.addText(c, {
      x: colX[i], y: HY, w: CW, h: 0.3, isTextBox: true, margin: 0, align: "center", valign: "middle",
      fontFace: B, fontSize: 10, bold: true, color: AMBER, charSpacing: 1.4,
    });
  });

  // 0 concluído · 1 em andamento · 2 pendente
  const linhas = [
    ["Preenchimento dos dados para\napresentação de resultados", "Semanal  ·  N5 quartas, N4 terças",
      [["Juliana", 2], ["Juliana", 2], ["Juliana", 2]]],
    ["Desenvolvimento do HXH operacional", "Diário",
      [["Deyvid", 1], ["Andressa", 1], ["Lucas", 0]]],
    ["Envio do HXH operacional", "Diário",
      [["Deyvid", 1], ["Andressa", 1], ["Lucas", 0]]],
    ["Análise dos dados e insights", "Diário",
      [["Deyvid", 2], ["Andressa", 2], ["Lucas", 0]]],
  ];

  const RY = 2.5, RH = 0.86, RGAP = 0.12;
  linhas.forEach((l, i) => {
    const [nome, per, celulas] = l;
    const y = RY + i * (RH + RGAP);

    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: W, h: RH, rectRadius: 0.08,
      fill: { color: WHITE, transparency: 94 }, line: { color: STROKE, width: 1, transparency: 45 },
    });

    s.addText(nome.replace("\n", " "), {
      x: M + 0.3, y: y + 0.1, w: LW - 0.5, h: 0.44, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11.5, bold: true, color: WHITE,
    });
    s.addText(per, {
      x: M + 0.3, y: y + 0.56, w: LW - 0.5, h: 0.22, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 9, color: MUTED,
    });

    celulas.forEach(([focal, level], j) => {
      const label = level === 0 ? "CONCLUÍDO" : level === 1 ? "EM ANDAMENTO" : "PENDENTE ACESSO";
      const pw = 1.65;
      statusPill(s, colX[j] + (CW - pw) / 2, y + 0.18, pw, label, level);
      s.addText(focal, {
        x: colX[j], y: y + 0.5, w: CW, h: 0.26, isTextBox: true, margin: 0, align: "center", valign: "middle",
        fontFace: B, fontSize: 10, color: ICE,
      });
    });
  });

  const FY = RY + 4 * (RH + RGAP) + 0.12;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: FY, w: W, h: 0.92, rectRadius: 0.09,
    fill: { color: AMBER, transparency: 89 }, line: { color: AMBER, width: 1.4 },
  });
  s.addShape(pres.ShapeType.ellipse, { x: M + 0.4, y: FY + 0.32, w: 0.28, h: 0.28, fill: { color: AMBER } });
  s.addImage({ data: await iconData(Fi.FiAlertCircle, NAVY), x: M + 0.47, y: FY + 0.39, w: 0.14, h: 0.14 });
  s.addText(
    [
      { text: "O acesso externo é o que destrava 4 das 12 rotinas.  ", options: { bold: true, color: WHITE } },
      { text: "O preenchimento para a apresentação semanal e a análise de insights das duas carteiras N5 dependem do acesso aos KPI's Meli.", options: { color: ICE } },
    ],
    { x: M + 0.8, y: FY, w: W - 1.2, h: 0.92, isTextBox: true, margin: 0, valign: "middle", fontFace: B, fontSize: 11.5 }
  );

  s.addNotes(
    "PMO dos processos recorrentes: quatro rotinas replicadas nas três carteiras, todas com origem nos KPI's Meli. " +
      "A N4 (Lucas) já está concluída nas três rotinas diárias: desenvolvimento do HXH, envio do HXH e análise de dados. " +
      "Nas carteiras N5, o desenvolvimento e o envio do HXH estão em andamento com Deyvid (Pró-Ativos) e Andressa (Onboarding). " +
      "O ponto crítico é o acesso externo: o preenchimento para a apresentação semanal (focal Juliana, N5 às quartas e N4 às terças) e a análise de dados e insights das duas carteiras N5 estão parados aguardando o acesso aos KPI's Meli."
  );
}

/* =================================== SLIDE 4 — PMO DOS ALINHAMENTOS */
async function slideAlinhamentos(bg) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: bg, x: 0, y: 0, w: 13.33, h: 7.5 });

  header(
    s,
    "PMO   ·   REUNIÕES DE ALINHAMENTO",
    "Frentes em aberto",
    "6 frentes acordadas nos alinhamentos — prazos entre 09 e 13/10."
  );

  {
    const pw = 3.25, ph = 1.0, px = M + W - pw, py = 0.5;
    s.addShape(pres.ShapeType.roundRect, {
      x: px, y: py, w: pw, h: ph, rectRadius: 0.1,
      fill: { color: WHITE, transparency: 92 }, line: { color: STROKE, width: 1 },
    });
    s.addText("PRÓXIMO MARCO", {
      x: px + 0.3, y: py + 0.17, w: pw - 0.6, h: 0.24, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9, bold: true, color: MUTED, charSpacing: 1.4,
    });
    s.addText(
      [
        { text: "13/10", options: { fontSize: 20, bold: true, color: AMBER, fontFace: H } },
        { text: "   4 frentes com prazo", options: { fontSize: 11, color: WHITE } },
      ],
      { x: px + 0.3, y: py + 0.36, w: pw - 0.6, h: 0.3, isTextBox: true, margin: 0, valign: "middle", fontFace: B }
    );
    s.addText("Aging: 09/10", {
      x: px + 0.3, y: py + 0.7, w: pw - 0.6, h: 0.24, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9.5, color: ICE,
    });
  }

  const frentes = [
    {
      icon: Fi.FiUsers, titulo: "Apresentação de resultados",
      desc: "Rodada semanal às quintas-feiras, com os dados já consolidados.",
      prazo: "PENDENTE EXT", level: 2,
    },
    {
      icon: Fi.FiBarChart2, titulo: "Dimensionamento",
      desc: "Demanda entrante + backlog. Avaliar os dados nesta semana e movimentar a partir da próxima.",
      prazo: "13/10", level: 1,
    },
    {
      icon: Fi.FiLayers, titulo: "Pró-Ativos  ·  dados manuais",
      desc: "Will aprofunda na carteira, analisa as planilhas do Deyvid e desenha o processo de acompanhamento, com visão de catálogo.",
      prazo: "13/10", level: 1,
    },
    {
      icon: Fi.FiLayers, titulo: "Onboarding  ·  dados manuais",
      desc: "Mapeamento com a Andressa e desenho do fluxo com operações para controlar o preenchimento da planilha pelos agentes.",
      prazo: "13/10", level: 1,
    },
    {
      icon: Fi.FiFolder, titulo: "Demanda de catálogo  ·  CRM",
      desc: "Extração da base, separação por vendor e definição da prioridade de tratativa.",
      prazo: "EM ESTUDO", level: 1,
    },
    {
      icon: Fi.FiSearch, titulo: "KPIs por frente de atuação + aging",
      desc: "Análise por frente, não consolidada, com foco no aging de 5 dias sem atuação. Visão de frentes a desenvolver; aging já construído, aguarda EXT para validar.",
      prazo: "13/10  ·  09/10", level: 1,
    },
  ];

  const GY = 2.08, GGAP = 0.22;
  const GW = (W - GGAP) / 2;
  const GH = 1.3;
  for (let i = 0; i < frentes.length; i++) {
    const f = frentes[i];
    const x = M + (i % 2) * (GW + GGAP);
    const y = GY + Math.floor(i / 2) * (GH + GGAP);

    panel(s, x, y, GW, GH, false);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.3, y: y + 0.26, w: 0.4, h: 0.4, fill: { color: AMBER } });
    s.addImage({ data: await iconData(f.icon, NAVY), x: x + 0.4, y: y + 0.36, w: 0.2, h: 0.2 });

    s.addText(f.titulo, {
      x: x + 0.82, y: y + 0.24, w: GW - 2.35, h: 0.32, isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 12, bold: true, color: WHITE,
    });
    statusPill(s, x + GW - 1.5, y + 0.28, 1.2, f.prazo, f.level);
    s.addText(f.desc, {
      x: x + 0.3, y: y + 0.66, w: GW - 0.6, h: 0.5, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 9.5, color: ICE, lineSpacingMultiple: 1.1,
    });
  }

  const FY = GY + 3 * (GH + GGAP) + 0.04;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: FY, w: W, h: 0.72, rectRadius: 0.09,
    fill: { color: WHITE, transparency: 94 }, line: { color: STROKE, width: 1 },
  });
  s.addText(
    [
      { text: "ESCOPO DAS FRENTES        ", options: { bold: true, color: AMBER, fontSize: 9, charSpacing: 1.3 } },
      { text: "N4   ", options: { bold: true, color: WHITE, fontSize: 11 } },
      { text: "Full, Inbound e P2P          ", options: { color: ICE, fontSize: 11 } },
      { text: "N5   ", options: { bold: true, color: WHITE, fontSize: 11 } },
      { text: "Onboarding (2 frentes) e Pró-Ativos (9 frentes)", options: { color: ICE, fontSize: 11 } },
    ],
    { x: M + 0.4, y: FY, w: W - 0.8, h: 0.72, isTextBox: true, margin: 0, valign: "middle", fontFace: B }
  );

  s.addNotes(
    "PMO das reuniões de alinhamento. Seis frentes acordadas. " +
      "A apresentação de resultados é semanal, às quintas, e está pendente de acesso externo. " +
      "O dimensionamento (demanda entrante mais backlog) tem os dados avaliados nesta semana para começar a movimentar na próxima, com prazo em 13/10. " +
      "Os dois dashboards com dados manuais (Pró-Ativos e Onboarding) exigem aprofundamento do Will na carteira: no Pró-Ativos, analisar as planilhas do Deyvid e desenhar o processo de acompanhamento; no Onboarding, mapear com a Andressa e desenhar o fluxo com operações para controlar o preenchimento pelos agentes. Ambos em 13/10. " +
      "A demanda de catálogo envolve extrair a base do CRM, separar por vendor e definir a prioridade de tratativa. " +
      "Por fim, a análise de KPIs deve ser feita por frente de atuação e não de forma consolidada, com foco no aging de 5 dias sem atuação: a visão por frentes ainda precisa ser desenvolvida e o acompanhamento de aging já está construído, aguardando acesso externo para validar os dados."
  );
}

/* ====================================== SLIDE 5 — EVOLUÇÕES DO DASH */
async function slideEvolucoes(bg) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: bg, x: 0, y: 0, w: 13.33, h: 7.5 });

  header(
    s,
    "PMO   ·   EVOLUÇÕES DO DASHBOARD",
    "O que já foi entregue",
    "10 melhorias pedidas no alinhamento — 7 entregues, 2 validadas em conceito e 1 em andamento."
  );
  progressPanel(s, 9, 10, "MELHORIAS");

  // 0 entregue · 1 conceito · 2 em andamento
  const itens = [
    ["Volumetria de casos fechados por hora", "na evolução dia a dia", 0],
    ["Volumetria e % de casos fechados por célula", "", 0],
    ["Todos os status dos tickets", "além do que foi fechado", 0],
    ["Visão online de N4", "com acesso do Plan no CXOne", 0],
    ["Abertura por semana e ano", "", 0],
    ["Visão de tabulação dos casos tratados", "", 0],
    ["TMA e recebimento por categoria", "abertos na visão", 0],
    ["Produtividade apenas de quem trabalhou na fila", "", 1],
    ["Filtro de operador já logado", "", 1],
    ["Acesso para migração entre filas", "solicitação aberta", 2],
  ];

  const GY = 2.12, GGAP = 0.22;
  const GW = (W - GGAP) / 2;
  const RH = 0.74, RGAP = 0.12;

  for (let i = 0; i < itens.length; i++) {
    const [titulo, nota, level] = itens[i];
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const x = M + col * (GW + GGAP);
    const y = GY + row * (RH + RGAP);

    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: GW, h: RH, rectRadius: 0.08,
      fill: { color: WHITE, transparency: level === 0 ? 92 : 94 },
      line: { color: level === 0 ? AMBER : STROKE, width: 1, transparency: level === 0 ? 40 : 45 },
    });

    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.28, y: y + (RH - 0.32) / 2, w: 0.32, h: 0.32,
      fill: level === 0 ? { color: AMBER } : { color: AMBER, transparency: 45 },
    });
    s.addImage({
      data: await iconData(level === 2 ? Fi.FiClock : Fi.FiCheck, level === 0 ? NAVY : WHITE),
      x: x + 0.355, y: y + (RH - 0.32) / 2 + 0.075, w: 0.17, h: 0.17,
    });

    s.addText(titulo, {
      x: x + 0.72, y: nota ? y + 0.14 : y, w: GW - 2.2, h: nota ? 0.28 : RH,
      isTextBox: true, margin: 0, valign: "middle",
      fontFace: B, fontSize: 11.5, bold: true, color: WHITE,
    });
    if (nota) {
      s.addText(nota, {
        x: x + 0.72, y: y + 0.4, w: GW - 2.2, h: 0.24, isTextBox: true, margin: 0, valign: "middle",
        fontFace: B, fontSize: 9, color: MUTED,
      });
    }

    const label = level === 0 ? "ENTREGUE" : level === 1 ? "CONCEITO" : "EM ANDAMENTO";
    const pw = 1.25;
    statusPill(s, x + GW - pw - 0.28, y + (RH - 0.26) / 2, pw, label, level === 0 ? 0 : 1);
  }

  const FY = GY + 5 * (RH + RGAP) + 0.06;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: FY, w: W, h: 0.66, rectRadius: 0.09,
    fill: { color: WHITE, transparency: 94 }, line: { color: STROKE, width: 1 },
  });
  s.addText(
    [
      { text: "CONCEITO   ", options: { bold: true, color: AMBER, fontSize: 9, charSpacing: 1.3 } },
      { text: "regra validada, implementação na sequência.        ", options: { color: ICE, fontSize: 10.5 } },
      { text: "EM ANDAMENTO   ", options: { bold: true, color: AMBER, fontSize: 9, charSpacing: 1.3 } },
      { text: "migração entre filas aguarda liberação de acesso.", options: { color: ICE, fontSize: 10.5 } },
    ],
    { x: M + 0.4, y: FY, w: W - 0.8, h: 0.66, isTextBox: true, margin: 0, valign: "middle", fontFace: B }
  );

  s.addNotes(
    "PMO das evoluções do dashboard pedidas no alinhamento: de dez pontos, sete estão entregues — volumetria de casos fechados por hora na evolução dia a dia, volumetria e percentual por célula, todos os status dos tickets além do fechado, visão online de N4 com acesso do Plan no CXOne, abertura por semana e ano, visão de tabulação dos casos tratados e abertura de TMA e recebimento por categoria. " +
      "Dois estão validados em conceito e entram na implementação: produtividade apenas de quem trabalhou na fila e filtro de operador já logado. " +
      "Um segue em andamento: o acesso para migração entre filas, que depende de liberação."
  );
}

async function build() {
  pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Planejamento";
  pres.title = "Planejamento — ganhos e PMO";

  const bg = await backgroundData();
  await slideGanhos(bg);
  await slideDashboards(bg);
  await slideProcessos(bg);
  await slideAlinhamentos(bg);
  await slideEvolucoes(bg);

  const out = process.argv[2] || "Planejamento_Ganhos.pptx";
  await pres.writeFile({ fileName: out });
  console.log("gerado:", out);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
