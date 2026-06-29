// Gera o resumo + recomendação do funil a partir dos agregados do D1.
// Função pura (testável): recebe dados, devolve texto pronto pra enviar.

const brl = (n) => "R$ " + (Number(n) || 0).toFixed(2);

export function formatReport({ dias = 7, por_canal = [], por_variante = [] } = {}) {
  const canais = [...por_canal].sort((a, b) => (b.vendas || 0) - (a.vendas || 0) || (b.receita || 0) - (a.receita || 0));
  const totCliques = canais.reduce((s, c) => s + (c.cliques || 0), 0);
  const totVendas = canais.reduce((s, c) => s + (c.vendas || 0), 0);
  const totReceita = canais.reduce((s, c) => s + (c.receita || 0), 0);
  const totComissao = canais.reduce((s, c) => s + (c.comissao || 0), 0);

  const L = [];
  L.push(`📊 Funil Noma Mini — últimos ${dias} dias`);
  L.push("");
  L.push(`Cliques: ${totCliques} · Vendas: ${totVendas} · Receita: ${brl(totReceita)} · Comissão: ${brl(totComissao)}`);
  L.push(`Conversão geral: ${pct(totVendas, totCliques)}`);
  L.push("");

  if (!canais.length || !totCliques) {
    L.push("Sem cliques no período. Publique e gere tráfego — depois eu te digo o que converte.");
    return L.join("\n");
  }

  // canal vencedor
  const winner = canais.find((c) => (c.vendas || 0) > 0);
  if (winner) {
    L.push(`✅ Dobre no canal "${winner.channel || "—"}": ${winner.vendas} venda(s), ` +
      `conversão ${pct(winner.vendas, winner.cliques)}, ${brl(winner.receita)} de receita.`);
  } else {
    L.push("⚠️ Nenhum canal converteu ainda. Ou é cedo (espere ~3 dias), ou a oferta/link não está fechando.");
  }

  // o que cortar: gastou clique e não vendeu (com volume mínimo pra ter significância)
  const cortar = canais.filter((c) => (c.cliques || 0) >= 30 && (c.vendas || 0) === 0);
  if (cortar.length) {
    L.push(`✂️ Corte/ajuste: ${cortar.map((c) => `"${c.channel || "—"}" (${c.cliques} cliques, 0 venda)`).join(", ")}.`);
  }

  // A/B, se houver
  if (por_variante.length > 1) {
    const v = [...por_variante].sort((a, b) => (b.conv_pct || 0) - (a.conv_pct || 0));
    L.push("");
    L.push(`🧪 A/B: variante "${v[0].variante}" lidera (${v[0].conv_pct || 0}% vs ${v[1].conv_pct || 0}%).`);
  }

  // tabela compacta
  L.push("");
  L.push("Por canal:");
  for (const c of canais) {
    L.push(`  • ${(c.channel || "—").padEnd(6)} ${c.cliques} cliques · ${c.vendas || 0} vendas · ${pct(c.vendas, c.cliques)} · ${brl(c.receita)}`);
  }
  return L.join("\n");
}

function pct(v, total) {
  if (!total) return "0%";
  return ((100 * (v || 0)) / total).toFixed(1) + "%";
}
