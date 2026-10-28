// Downloads census population series from the IBGE SIDRA API and writes the
// normalised datasets used by the compositions to src/data/.
//
// Usage: npm run fetch-data
//
// The Sinopse page (censo2010.ibge.gov.br/sinopse) sits behind a bot
// challenge, so we read the same census series straight from SIDRA:
//   - Table 1286: população nos Censos Demográficos (1872-2010), Brasil / Grandes Regiões / UFs
//   - Table 1288: população por situação do domicílio (1950-2010), Brasil

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const API = "https://apisidra.ibge.gov.br/values";

// The first digit of a UF code is its Grande Região code.
const REGIONS = {
  1: { id: "norte", label: "Norte" },
  2: { id: "nordeste", label: "Nordeste" },
  3: { id: "sudeste", label: "Sudeste" },
  4: { id: "sul", label: "Sul" },
  5: { id: "centro-oeste", label: "Centro-Oeste" },
};

const UF_ABBR = {
  11: "RO", 12: "AC", 13: "AM", 14: "RR", 15: "PA", 16: "AP", 17: "TO",
  21: "MA", 22: "PI", 23: "CE", 24: "RN", 25: "PB", 26: "PE", 27: "AL", 28: "SE", 29: "BA",
  31: "MG", 32: "ES", 33: "RJ", 35: "SP",
  41: "PR", 42: "SC", 43: "RS",
  50: "MS", 51: "MT", 52: "GO", 53: "DF",
};

const sidra = async (path) => {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`SIDRA ${res.status} for ${path}`);
  const [, ...rows] = await res.json(); // first row is the header
  return rows;
};

// SIDRA uses "-", "..", "...", "X" for values that don't exist or are withheld.
const toNumber = (v) => (/^\d+$/.test(v) ? Number(v) : 0);

const buildRegioes = async () => {
  const [brasil, regioes, ufs] = await Promise.all([
    sidra("t/1286/n1/all/v/606/p/all"),
    sidra("t/1286/n2/all/v/606/p/all"),
    sidra("t/1286/n3/all/v/606/p/all"),
  ]);

  const years = [...new Set(brasil.map((r) => r.D3N))].sort();
  const nodes = [
    { id: "brasil", label: "Brasil", level: 0, parent: null },
    ...Object.entries(REGIONS).map(([, r]) => ({ id: r.id, label: r.label, level: 1, parent: "brasil" })),
    ...Object.entries(UF_ABBR).map(([code, abbr]) => ({
      id: abbr.toLowerCase(),
      label: ufs.find((r) => r.D1C === code).D1N,
      short: abbr,
      level: 2,
      parent: REGIONS[code[0]].id,
    })),
  ];

  const values = Object.fromEntries(years.map((y) => [y, {}]));
  for (const r of brasil) values[r.D3N].brasil = toNumber(r.V);
  for (const r of regioes) values[r.D3N][REGIONS[r.D1C].id] = toNumber(r.V);
  for (const r of ufs) values[r.D3N][UF_ABBR[r.D1C].toLowerCase()] = toNumber(r.V);

  return {
    title: "População residente por Grande Região e Unidade da Federação",
    source: "Fonte: IBGE, Censos Demográficos 1872-2010 (SIDRA, tabela 1286)",
    years,
    nodes,
    values,
  };
};

const buildUrbanoRural = async () => {
  const rows = await sidra("t/1288/n1/all/v/606/p/all/c1/all");
  const ids = { 0: "brasil", 1: "urbana", 2: "rural" };
  const years = [...new Set(rows.map((r) => r.D3N))].sort();
  const values = Object.fromEntries(years.map((y) => [y, {}]));
  for (const r of rows) values[r.D3N][ids[r.D4C]] = toNumber(r.V);

  return {
    title: "População residente por situação do domicílio",
    source: "Fonte: IBGE, Censos Demográficos 1950-2010 (SIDRA, tabela 1288)",
    years,
    nodes: [
      { id: "brasil", label: "Brasil", level: 0, parent: null },
      { id: "urbana", label: "Urbana", level: 1, parent: "brasil" },
      { id: "rural", label: "Rural", level: 1, parent: "brasil" },
    ],
    values,
  };
};

// Children of each parent should add up to the parent. Report any gap so it's
// visible when refreshing data rather than silently skewing the bands.
const report = (name, data) => {
  console.log(`\n${name}: ${data.years.join(", ")}`);
  for (const year of data.years) {
    const v = data.values[year];
    const gaps = data.nodes
      .filter((p) => data.nodes.some((c) => c.parent === p.id))
      .map((p) => {
        const sum = data.nodes.filter((c) => c.parent === p.id).reduce((s, c) => s + (v[c.id] ?? 0), 0);
        return v[p.id] - sum === 0 ? null : `${p.id} ${v[p.id] - sum > 0 ? "+" : ""}${v[p.id] - sum}`;
      })
      .filter(Boolean);
    console.log(`  ${year}: total ${v.brasil.toLocaleString("pt-BR")}${gaps.length ? `  (gaps: ${gaps.join(", ")})` : ""}`);
  }
};

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const regioes = await buildRegioes();
  const urbanoRural = await buildUrbanoRural();
  await writeFile(join(OUT_DIR, "regioes-ufs.json"), JSON.stringify(regioes, null, 2) + "\n");
  await writeFile(join(OUT_DIR, "urbano-rural.json"), JSON.stringify(urbanoRural, null, 2) + "\n");
  report("regioes-ufs.json", regioes);
  report("urbano-rural.json", urbanoRural);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
