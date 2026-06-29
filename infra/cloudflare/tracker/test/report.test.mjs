import { test } from "node:test";
import assert from "node:assert/strict";
import { formatReport } from "../src/report.js";

test("relatório: sem cliques orienta gerar tráfego", () => {
  const r = formatReport({ dias: 7, por_canal: [] });
  assert.match(r, /Sem cliques/);
});

test("relatório: aponta canal vencedor e o que cortar", () => {
  const r = formatReport({
    dias: 7,
    por_canal: [
      { channel: "ads", cliques: 100, vendas: 8, conv_pct: 8, receita: 480, comissao: 48 },
      { channel: "bio", cliques: 50, vendas: 0, conv_pct: 0, receita: 0, comissao: 0 },
    ],
  });
  assert.match(r, /Dobre no canal "ads"/);
  assert.match(r, /Corte\/ajuste.*"bio"/);
  assert.match(r, /Receita: R\$ 480\.00/);
});

test("relatório: A/B aponta a variante líder", () => {
  const r = formatReport({
    dias: 7,
    por_canal: [{ channel: "ads", cliques: 100, vendas: 5, conv_pct: 5, receita: 300, comissao: 30 }],
    por_variante: [
      { variante: "b", cliques: 50, vendas: 4, conv_pct: 8, receita: 240 },
      { variante: "a", cliques: 50, vendas: 1, conv_pct: 2, receita: 60 },
    ],
  });
  assert.match(r, /variante "b" lidera/);
});

test("relatório: não sugere cortar canal com pouco volume", () => {
  const r = formatReport({
    dias: 7,
    por_canal: [{ channel: "reel", cliques: 10, vendas: 0, conv_pct: 0, receita: 0, comissao: 0 }],
  });
  assert.doesNotMatch(r, /Corte\/ajuste/);
});
