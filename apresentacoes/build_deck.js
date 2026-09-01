const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------- palette
const NAVY = "12203A";
const NAVY_SOFT = "2E4B7A";
const AMBER = "E9A13B";
const ICE = "D6E2F2";
const CARD = "F1F4F9";
const LINE = "DCE3EC";
const TXT = "1E2A3D";
const MUTED = "5B6B82";
const WHITE = "FFFFFF";

const H = "Cambria";
const B = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Planejamento";
pres.title = "Planejamento assume o ciclo de dados ponta a ponta";

const M = 0.62;
const W = 13.33 - M * 2; // 12.09

const shadow = () => ({ type: "outer", color: "0B1526", opacity: 0.1, blur: 10, offset: 2, angle: 90 });

function titleSlide(slide, kicker, title, sub) {
  slide.addText(kicker, {
    x: M, y: 0.42, w: W, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 11.5, bold: true, color: AMBER, charSpacing: 2,
  });
  slide.addText(title, {
    x: M, y: 0.76, w: W, h: 0.62, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 32, bold: true, color: NAVY,
  });
  if (sub) {
    slide.addText(sub, {
      x: M, y: 1.42, w: W - 0.4, h: 0.38, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 14.5, color: MUTED,
    });
  }
}

function bulletList(slide, items, opt) {
  slide.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: { code: "2022" }, breakLine: i !== items.length - 1 },
    })),
    Object.assign(
      { isTextBox: true, margin: 0, valign: "top", fontFace: B, fontSize: 13.5, color: TXT, paraSpaceAfter: 9, lineSpacingMultiple: 1.05 },
      opt
    )
  );
}

function numberBadge(slide, x, y, d, label, fill, textColor) {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill } });
  slide.addText(label, {
    x, y, w: d, h: d, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 15, bold: true, color: textColor, align: "center", valign: "middle",
  });
}

/* ============================================================ 1 — CAPA */
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // motivo visual: anéis concêntricos à direita
  [4.1, 3.1, 2.1].forEach((d, i) => {
    s.addShape(pres.ShapeType.ellipse, {
      x: 11.45 - d / 2, y: 3.35 - d / 2, w: d, h: d,
      fill: { color: NAVY, transparency: 100 },
      line: { color: i === 1 ? AMBER : NAVY_SOFT, width: i === 1 ? 2 : 1.25 },
    });
  });
  s.addShape(pres.ShapeType.ellipse, { x: 11.05, y: 2.95, w: 0.8, h: 0.8, fill: { color: AMBER } });

  s.addText("NOVO MODELO DE ATUAÇÃO  ·  PLANEJAMENTO & OPERAÇÃO", {
    x: M, y: 0.85, w: 9.2, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 12, bold: true, color: AMBER, charSpacing: 2.4,
  });

  s.addText("Planejamento assume o ciclo\nde dados ponta a ponta", {
    x: M, y: 1.45, w: 9.0, h: 1.6, isTextBox: true, margin: 0, valign: "top",
    fontFace: H, fontSize: 34, bold: true, color: WHITE, lineSpacingMultiple: 1.06,
  });

  s.addText(
    "A Operação volta o foco para o dia a dia — analistas e execução. O Planejamento centraliza a recepção, a tratativa, a distribuição, a consolidação e a validação dos arquivos, entrega a base para os KPIs e devolve leitura analítica ao processo.",
    { x: M, y: 3.12, w: 8.35, h: 1.3, isTextBox: true, margin: 0, valign: "top", fontFace: B, fontSize: 14, color: ICE, lineSpacingMultiple: 1.2 }
  );

  const stats = [
    ["13", "DEMANDAS MAPEADAS"],
    ["4", "PROCESSOS SOB TRATATIVA"],
    ["02/09", "ALINHAMENTO PRESENCIAL"],
  ];
  stats.forEach(([n, l], i) => {
    const x = M + i * 3.35;
    s.addText(n, {
      x, y: 4.82, w: 3.05, h: 0.75, isTextBox: true, margin: 0,
      fontFace: H, fontSize: 40, bold: true, color: AMBER,
    });
    s.addText(l, {
      x, y: 5.58, w: 3.05, h: 0.5, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 10.5, bold: true, color: ICE, charSpacing: 1.2,
    });
  });

  s.addText("Rubens Hipólito  ·  Planejamento", {
    x: M, y: 6.55, w: 7, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 12, color: "8FA6C4",
  });

  s.addNotes(
    "Abertura: hoje a operação divide atenção entre executar e tratar dados. A partir de agora o Planejamento assume o dado de ponta a ponta e a operação fica dedicada ao dia a dia."
  );
}

/* ================================================= 2 — POR QUE MUDAR */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleSlide(s, "O CONTEXTO", "Por que mudar", "A operação estava dividida entre executar e tratar dados. Separamos os papéis.");

  const cw = (W - 0.45) / 2;
  const cy = 2.05;
  const ch = 3.7;

  // Card esquerdo — modelo atual
  s.addShape(pres.ShapeType.roundRect, { x: M, y: cy, w: cw, h: ch, rectRadius: 0.08, fill: { color: CARD }, line: { color: LINE, width: 1 } });
  numberBadge(s, M + 0.42, cy + 0.42, 0.5, "!", "C4D1E2", NAVY);
  s.addText("MODELO ATUAL", {
    x: M + 1.05, y: cy + 0.52, w: cw - 1.5, h: 0.32, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 12.5, bold: true, color: MUTED, charSpacing: 1.6,
  });
  bulletList(
    s,
    [
      "Operação acumula recepção, tratativa e consolidação dos arquivos",
      "Atenção do gestor dividida entre o dado e o time",
      "Padrão de preenchimento dependente de quem executa",
      "Leitura macro: o número bruto, com pouca análise por trás",
    ],
    { x: M + 0.45, y: cy + 1.2, w: cw - 0.9, h: ch - 1.6 }
  );

  // Card direito — novo modelo
  const x2 = M + cw + 0.45;
  s.addShape(pres.ShapeType.roundRect, { x: x2, y: cy, w: cw, h: ch, rectRadius: 0.08, fill: { color: NAVY }, line: { color: NAVY, width: 1 }, shadow: shadow() });
  numberBadge(s, x2 + 0.42, cy + 0.42, 0.5, "✓", AMBER, NAVY);
  s.addText("NOVO MODELO", {
    x: x2 + 1.05, y: cy + 0.52, w: cw - 1.5, h: 0.32, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 12.5, bold: true, color: AMBER, charSpacing: 1.6,
  });
  bulletList(
    s,
    [
      "Planejamento assume o fluxo de dados de ponta a ponta",
      "Operação 100% no dia a dia: analistas, atividades e qualidade",
      "Tratativa padronizada e centralizada em um único ponto",
      "Leitura micro: onde trava, por que trava e o que fazer",
    ],
    { x: x2 + 0.45, y: cy + 1.2, w: cw - 0.9, h: ch - 1.6, color: WHITE }
  );

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 6.05, w: W, h: 0.88, rectRadius: 0.06, fill: { color: CARD }, line: { color: LINE, width: 1 } });
  s.addText(
    [
      { text: "Não é tarefa a mais para o Planejamento.  ", options: { bold: true, color: NAVY } },
      { text: "É troca de dono: o tempo que a operação gastava tratando arquivo volta para o acompanhamento dos analistas.", options: { color: MUTED } },
    ],
    { x: M + 0.4, y: 6.05, w: W - 0.8, h: 0.88, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, valign: "middle" }
  );

  s.addNotes("Não é acréscimo de tarefa para o Planejamento: é troca de dono. A operação devolve o tempo de tratativa para o acompanhamento dos analistas.");
}

/* ============================================== 3 — FLUXO PONTA A PONTA */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleSlide(s, "COMO PASSA A FUNCIONAR", "O fluxo ponta a ponta", "Um único dono do dado, do recebimento do arquivo até o indicador.");

  const steps = [
    ["1", "RECEPÇÃO", "Planejamento recebe os arquivos e as bases de origem — planilhas e CRM."],
    ["2", "TRATATIVA", "Aplica as regras: duplicados por SKU, escopo por país, colunas obrigatórias."],
    ["3", "DISTRIBUIÇÃO", "Entrega à operação apenas o que exige ação, já no formato certo."],
    ["4", "CONSOLIDAÇÃO", "Reúne o retorno, valida a consistência e fecha a base oficial."],
    ["5", "KPIs", "Disponibiliza os arquivos para o ML construir os indicadores."],
  ];
  const cw = (W - 4 * 0.22) / 5; // 2.242
  const cy = 2.2;
  const ch = 3.15;

  steps.forEach(([n, t, d], i) => {
    const x = M + i * (cw + 0.22);
    const last = i === steps.length - 1;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: cy, w: cw, h: ch, rectRadius: 0.09,
      fill: { color: last ? NAVY : CARD }, line: { color: last ? NAVY : LINE, width: 1 },
    });
    numberBadge(s, x + 0.26, cy + 0.34, 0.56, n, AMBER, NAVY);
    s.addText(t, {
      x: x + 0.26, y: cy + 1.05, w: cw - 0.5, h: 0.34, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 11.5, bold: true, color: last ? AMBER : NAVY, charSpacing: 0.4,
    });
    s.addText(d, {
      x: x + 0.26, y: cy + 1.45, w: cw - 0.52, h: 1.55, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 11.5, color: last ? ICE : MUTED, lineSpacingMultiple: 1.14,
    });
    if (!last) {
      s.addText("›", {
        x: x + cw - 0.02, y: cy + 1.25, w: 0.26, h: 0.4, isTextBox: true, margin: 0,
        fontFace: "Arial", fontSize: 20, bold: true, color: AMBER, align: "center", valign: "middle",
      });
    }
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.85, w: W, h: 0.88, rectRadius: 0.06, fill: { color: CARD }, line: { color: LINE, width: 1 } });
  s.addText(
    [
      { text: "Entrada e saída no mesmo dono.  ", options: { bold: true, color: NAVY } },
      { text: "A operação recebe a demanda pronta para executar e devolve o retorno; o Planejamento responde pela qualidade do dado que vira KPI.", options: { color: MUTED } },
    ],
    { x: M + 0.4, y: 5.85, w: W - 0.8, h: 0.88, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, valign: "middle" }
  );

  s.addNotes("Este é o coração da mudança: cinco etapas, um responsável. O ML recebe a base já validada.");
}

/* =================================================== 4 — QUEM FAZ O QUÊ */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleSlide(s, "PAPÉIS", "Quem faz o quê", "Fronteira clara entre tratar o dado e executar a operação.");

  const cw = (W - 0.45) / 2;
  const cy = 2.05;
  const ch = 3.8;

  const cards = [
    {
      x: M, dark: true, tag: "PLANEJAMENTO", who: "Rubens Hipólito",
      items: [
        "Recepção dos arquivos e bases de origem",
        "Tratativa e padronização das informações",
        "Distribuição das demandas para a operação",
        "Consolidação e validação do retorno",
        "Entrega da base oficial para os KPIs (ML)",
        "Leitura analítica, insights e recomendações",
      ],
    },
    {
      x: M + cw + 0.45, dark: false, tag: "OPERAÇÃO", who: "Time de execução",
      items: [
        "Execução das ações no dia a dia",
        "Atenção, acompanhamento e desenvolvimento dos analistas",
        "Qualidade e prazo das atividades",
        "Retorno estruturado ao Planejamento",
      ],
    },
  ];

  cards.forEach((c) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: c.x, y: cy, w: cw, h: ch, rectRadius: 0.08,
      fill: { color: c.dark ? NAVY : CARD }, line: { color: c.dark ? NAVY : LINE, width: 1 },
      shadow: c.dark ? shadow() : undefined,
    });
    s.addShape(pres.ShapeType.ellipse, { x: c.x + 0.45, y: cy + 0.45, w: 0.62, h: 0.62, fill: { color: AMBER } });
    s.addText(c.dark ? "P" : "O", {
      x: c.x + 0.45, y: cy + 0.45, w: 0.62, h: 0.62, isTextBox: true, margin: 0,
      fontFace: H, fontSize: 20, bold: true, color: NAVY, align: "center", valign: "middle",
    });
    s.addText(c.tag, {
      x: c.x + 1.22, y: cy + 0.5, w: cw - 1.6, h: 0.3, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 12.5, bold: true, color: c.dark ? AMBER : MUTED, charSpacing: 1.6,
    });
    s.addText(c.who, {
      x: c.x + 1.22, y: cy + 0.79, w: cw - 1.6, h: 0.34, isTextBox: true, margin: 0,
      fontFace: H, fontSize: 17, bold: true, color: c.dark ? WHITE : NAVY,
    });
    bulletList(s, c.items, {
      x: c.x + 0.48, y: cy + 1.42, w: cw - 0.96, h: ch - 1.85,
      color: c.dark ? WHITE : TXT, fontSize: 13.5, paraSpaceAfter: 10,
    });
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 6.18, w: W, h: 0.8, rectRadius: 0.06, fill: { color: CARD }, line: { color: LINE, width: 1 } });
  s.addText(
    [
      { text: "A operação não perde visibilidade.  ", options: { bold: true, color: NAVY } },
      { text: "Ela recebe a demanda já tratada, executa e devolve o retorno estruturado — o que sai da mesa dela é o trabalho de tratar arquivo.", options: { color: MUTED } },
    ],
    { x: M + 0.4, y: 6.18, w: W - 0.8, h: 0.8, isTextBox: true, margin: 0, fontFace: B, fontSize: 13, valign: "middle" }
  );

  s.addNotes("A operação não perde visibilidade: ela recebe a demanda tratada e devolve o retorno. O que sai da mesa dela é o trabalho de tratamento de arquivo.");
}

/* ================================================ 5 — CAMADA CONSULTIVA */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleSlide(s, "O GANHO", "De número bruto a direcionamento", "Estar em toda a cadeia é o que permite ler o processo, e não apenas o resultado.");

  const lw = 4.55;
  s.addShape(pres.ShapeType.roundRect, { x: M, y: 2.1, w: lw, h: 4.34, rectRadius: 0.08, fill: { color: NAVY }, line: { color: NAVY, width: 1 }, shadow: shadow() });
  s.addText("VISÃO MICRO", {
    x: M + 0.45, y: 2.5, w: lw - 0.9, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 12.5, bold: true, color: AMBER, charSpacing: 1.6,
  });
  s.addText(
    "Por passar por todas as etapas, o Planejamento enxerga o caminho do dado — não só o número final.\n\nA leitura deixa de ser macro e passa a ser micro: onde o processo trava, por que trava e qual ação muda o resultado.",
    { x: M + 0.45, y: 2.94, w: lw - 0.9, h: 2.2, isTextBox: true, margin: 0, valign: "top", fontFace: B, fontSize: 14, color: ICE, lineSpacingMultiple: 1.22 }
  );
  s.addText("Um Planejamento consultivo, direcionado por dado.", {
    x: M + 0.45, y: 5.42, w: lw - 0.9, h: 0.75, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 15, bold: true, italic: true, color: AMBER, lineSpacingMultiple: 1.15,
  });

  const items = [
    ["GARGALOS", "Onde o fluxo trava, com que frequência e a que custo."],
    ["OPORTUNIDADES", "Ganhos rápidos: automação, corte de retrabalho, revisão de regra."],
    ["APROVEITAMENTO", "O que já funciona bem e deve ser replicado nos demais processos."],
    ["DIRECIONAMENTO", "Recomendação para a operação sustentada em dado, não em percepção."],
  ];
  const gx = M + lw + 0.4;
  const gw = (W - lw - 0.4 - 0.32) / 2;
  const gh = 2.12;
  items.forEach(([t, d], i) => {
    const x = gx + (i % 2) * (gw + 0.32);
    const y = 2.1 + Math.floor(i / 2) * (gh + 0.2);
    s.addShape(pres.ShapeType.roundRect, { x, y, w: gw, h: gh, rectRadius: 0.08, fill: { color: CARD }, line: { color: LINE, width: 1 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.36, y: y + 0.34, w: 0.42, h: 0.42, fill: { color: AMBER } });
    s.addText(t, {
      x: x + 0.36, y: y + 0.92, w: gw - 0.72, h: 0.32, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 12.5, bold: true, color: NAVY, charSpacing: 1.3,
    });
    s.addText(d, {
      x: x + 0.36, y: y + 1.26, w: gw - 0.72, h: 0.78, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.14,
    });
  });

  s.addNotes("Aqui está o valor que a mudança gera além da organização: o dado passa a virar recomendação.");
}

/* ==================================================== 6 — ESCOPO ATUAL */
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  titleSlide(s, "ESCOPO", "O que já está mapeado", "13 demandas acompanhadas no painel — 4 com tratativa direta do Planejamento.");

  const rows = [
    ["Catálogo", "Diária  ·  Automático", "Resolução de conflitos e duplicados por SKU"],
    ["Catálogo — Action-line", "Diária  ·  Scarlet", "Acompanhamento diário da aba Action-line"],
    ["Inventory Health", "Semanal  ·  Segunda", "Transferência de casos para a planilha destino"],
    ["INP — Identificação e Rezagos MLB", "Diária  ·  Manual", "Extração da origem e preenchimento da base oficial"],
  ];
  const lw = 7.1;
  rows.forEach((r, i) => {
    const y = 2.15 + i * 1.06;
    s.addShape(pres.ShapeType.roundRect, { x: M, y, w: lw, h: 0.92, rectRadius: 0.06, fill: { color: CARD }, line: { color: LINE, width: 1 } });
    s.addShape(pres.ShapeType.ellipse, { x: M + 0.3, y: y + 0.34, w: 0.24, h: 0.24, fill: { color: AMBER } });
    s.addText(r[0], {
      x: M + 0.72, y: y + 0.14, w: lw - 1.1, h: 0.32, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 13.5, bold: true, color: NAVY,
    });
    s.addText(r[1] + "   —   " + r[2], {
      x: M + 0.72, y: y + 0.47, w: lw - 1.1, h: 0.3, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 11.5, color: MUTED,
    });
  });

  const cx = M + lw + 0.45;
  const cwid = W - lw - 0.45;
  s.addShape(pres.ShapeType.roundRect, { x: cx, y: 2.15, w: cwid, h: 3.98, rectRadius: 0.08, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addText("COMPOSIÇÃO DAS 13 DEMANDAS", {
    x: cx + 0.35, y: 2.42, w: cwid - 0.7, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 11.5, bold: true, color: MUTED, charSpacing: 1.4, align: "center",
  });
  const chY = 2.78;
  const chH = 2.35;
  s.addChart(
    pres.ChartType.doughnut,
    [{ name: "Demandas", labels: ["Tratativa do Planejamento", "Automáticos — CRM 1P"], values: [4, 9] }],
    {
      x: cx + 0.25, y: chY, w: cwid - 0.5, h: chH,
      chartColors: [AMBER, NAVY_SOFT],
      holeSize: 62,
      showLegend: false,
      showValue: false,
      showTitle: false,
      dataBorder: { pt: 2, color: WHITE },
    }
  );
  s.addText(
    "13",
    {
      x: cx + 0.25 + (cwid - 0.5) / 2 - 0.7, y: chY + chH / 2 - 0.4, w: 1.4, h: 0.8,
      isTextBox: true, margin: 0, align: "center", valign: "middle",
      fontFace: H, fontSize: 28, bold: true, color: NAVY,
    }
  );

  [
    [AMBER, "4", "Tratativa do Planejamento"],
    [NAVY_SOFT, "9", "Automáticos — CRM 1P"],
  ].forEach(([c, n, t], i) => {
    const y = 5.28 + i * 0.4;
    s.addShape(pres.ShapeType.ellipse, { x: cx + 0.4, y: y + 0.08, w: 0.16, h: 0.16, fill: { color: c } });
    s.addText(
      [
        { text: n + "  ", options: { bold: true, color: NAVY } },
        { text: t, options: { color: MUTED } },
      ],
      { x: cx + 0.68, y, w: cwid - 1.05, h: 0.32, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, valign: "middle" }
    );
  });

  s.addText(
    "Os 9 processos 1P chegam automaticamente pelo CRM; a tratativa manual se concentra nos 4 processos acima.",
    { x: M, y: 6.45, w: W, h: 0.4, isTextBox: true, margin: 0, fontFace: B, fontSize: 11.5, italic: true, color: MUTED }
  );

  s.addNotes("O escopo já está inventariado no painel de demandas: 13 no total, 4 exigem tratativa manual e são o foco imediato.");
}

/* ================================================== 7 — PRÓXIMOS PASSOS */
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addText("O CAMINHO", {
    x: M, y: 0.62, w: W, h: 0.3, isTextBox: true, margin: 0,
    fontFace: B, fontSize: 11.5, bold: true, color: AMBER, charSpacing: 2.2,
  });
  s.addText("Próximos passos", {
    x: M, y: 0.96, w: W, h: 0.66, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 32, bold: true, color: WHITE,
  });

  const steps = [
    ["02/09", "Alinhamento presencial", "Absorver com o Deyvid o processo de preenchimento das quatro bases."],
    ["Curto prazo", "Fechar o mapeamento", "Definir a sheet oficial, o critério de duplicados e o escopo por país."],
    ["Rotina", "Padronizar a entrega", "Calendário diário e semanal de tratativa, consolidação e envio ao ML."],
    ["Contínuo", "Ciclo de insights", "Leitura micro do processo e recomendações periódicas para a operação."],
  ];
  const cw = (W - 3 * 0.28) / 4;
  const cy = 2.15;
  const ch = 2.95;
  steps.forEach(([tag, t, d], i) => {
    const x = M + i * (cw + 0.28);
    s.addShape(pres.ShapeType.roundRect, { x, y: cy, w: cw, h: ch, rectRadius: 0.09, fill: { color: "1B2E4D" }, line: { color: "2E4B7A", width: 1 } });
    s.addText(tag, {
      x: x + 0.34, y: cy + 0.36, w: cw - 0.68, h: 0.34, isTextBox: true, margin: 0,
      fontFace: B, fontSize: 12.5, bold: true, color: AMBER, charSpacing: 1.2,
    });
    s.addText(t, {
      x: x + 0.34, y: cy + 0.78, w: cw - 0.68, h: 0.72, isTextBox: true, margin: 0, valign: "top",
      fontFace: H, fontSize: 16.5, bold: true, color: WHITE, lineSpacingMultiple: 1.08,
    });
    s.addText(d, {
      x: x + 0.34, y: cy + 1.58, w: cw - 0.68, h: 1.2, isTextBox: true, margin: 0, valign: "top",
      fontFace: B, fontSize: 12, color: ICE, lineSpacingMultiple: 1.16,
    });
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.5, w: W, h: 1.0, rectRadius: 0.07, fill: { color: AMBER } });
  s.addText("Operação focada na execução. Planejamento, dono do dado e do direcionamento.", {
    x: M + 0.45, y: 5.5, w: W - 0.9, h: 1.0, isTextBox: true, margin: 0,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, valign: "middle", align: "center",
  });

  s.addNotes("Fechamento: o alinhamento de 02/09 destrava a absorção; a partir daí a rotina roda e o ciclo de insights começa.");
}

pres.writeFile({ fileName: process.argv[2] || "Planejamento_Novo_Modelo_Atuacao.pptx" }).then((f) => console.log("gerado:", f));
