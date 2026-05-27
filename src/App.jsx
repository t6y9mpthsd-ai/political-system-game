import { useMemo, useState } from 'react';

const initialState = {
  year: 2026,
  turn: 1,
  budget: 120,
  approval: 62,
  stability: 70,
  energy: 58,
  economy: 55,
  environment: 48,
  infrastructure: 50,
  industry: 53,
  trust: 60,
  crisis: 18,
  gameOver: false,
  result: '',
  log: ['Neue Regierung gebildet. Ziel: 12 Jahre ueberstehen und stabile Wiederwahl gewinnen.'],
};

const actions = [
  {
    id: 'renewables',
    name: 'Erneuerbare ausbauen',
    cost: 18,
    effect: { energy: 8, environment: 10, industry: -2, approval: 2 },
    description: 'Staerkt Energiesicherheit und Umwelt, belastet kurzfristig Industrie.',
  },
  {
    id: 'industry',
    name: 'Industrie subventionieren',
    cost: 22,
    effect: { economy: 10, industry: 8, environment: -6, budget: -5 },
    description: 'Sichert Arbeitsplaetze, erzeugt aber Umwelt- und Folgekosten.',
  },
  {
    id: 'grid',
    name: 'Stromnetz modernisieren',
    cost: 15,
    effect: { infrastructure: 10, energy: 5, stability: 3 },
    description: 'Reduziert Kettenrisiken bei Energie und Infrastruktur.',
  },
  {
    id: 'social',
    name: 'Sozialpaket beschliessen',
    cost: 20,
    effect: { approval: 8, trust: 10, budget: -8, economy: -2 },
    description: 'Senkt soziale Spannungen, ist aber teuer.',
  },
  {
    id: 'nuclear',
    name: 'Kernenergieprogramm',
    cost: 30,
    effect: { energy: 15, stability: 6, approval: -5, environment: -3 },
    description: 'Hohe Energiesicherheit mit politischem Konfliktpotenzial.',
  },
  {
    id: 'research',
    name: 'Forschungsinitiative',
    cost: 12,
    effect: { economy: 5, infrastructure: 3, industry: 4, environment: 2 },
    description: 'Langsamer Innovationsschub ohne harte Nebenwirkung.',
  },
  {
    id: 'administration',
    name: 'Verwaltung digitalisieren',
    cost: 14,
    effect: { stability: 5, trust: 5, infrastructure: 4, budget: 3 },
    description: 'Verbessert Staatsfaehigkeit und spart spaeter Kosten.',
  },
  {
    id: 'austerity',
    name: 'Sparpaket',
    cost: 0,
    effect: { budget: 22, approval: -9, trust: -6, economy: -3 },
    description: 'Sanierung des Haushalts mit hohem gesellschaftlichem Preis.',
  },
];

const events = [
  { name: 'Energiekrise', text: 'Gasimporte brechen ein.', effect: { energy: -12, economy: -6, approval: -4, crisis: 10 } },
  { name: 'Technologiedurchbruch', text: 'Neue Speichertechnologie entsteht.', effect: { energy: 8, economy: 4, environment: 4 } },
  { name: 'Grossproteste', text: 'Massenproteste gegen Reformen.', effect: { approval: -10, stability: -8, trust: -6 } },
  { name: 'Exportboom', text: 'Die Industrie waechst stark.', effect: { economy: 12, industry: 10, budget: 10 } },
  { name: 'Cyberangriff', text: 'Kritische Infrastruktur wird angegriffen.', effect: { infrastructure: -10, stability: -6, crisis: 6 } },
  { name: 'Duerresommer', text: 'Hitze belastet Versorgung und Vertrauen.', effect: { environment: -8, economy: -3, trust: -4, crisis: 5 } },
];

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyEffects(state, effect) {
  const next = { ...state };
  for (const [key, value] of Object.entries(effect)) {
    if (typeof next[key] === 'number') next[key] += value;
  }
  return next;
}

function simulateNetwork(state) {
  const next = { ...state };

  if (next.energy < 35) {
    next.economy -= 5;
    next.stability -= 4;
    next.crisis += 8;
    next.log = ['Ketteneffekt: Energiemangel belastet Wirtschaft und Stabilitaet.', ...next.log];
  }

  if (next.economy < 30) {
    next.approval -= 6;
    next.trust -= 4;
    next.log = ['Ketteneffekt: Wirtschaftskrise senkt Zustimmung und Vertrauen.', ...next.log];
  }

  if (next.environment < 25) {
    next.approval -= 4;
    next.stability -= 3;
    next.log = ['Ketteneffekt: Umweltkrise erzeugt politischen Druck.', ...next.log];
  }

  if (next.infrastructure < 30) {
    next.energy -= 4;
    next.crisis += 4;
    next.log = ['Ketteneffekt: Schwache Infrastruktur erhoeht Systemrisiken.', ...next.log];
  }

  if (next.trust < 30) {
    next.stability -= 8;
    next.approval -= 5;
    next.log = ['Ketteneffekt: Vertrauensverlust destabilisiert die Regierung.', ...next.log];
  }

  if (next.approval > 75) next.stability += 5;
  if (next.crisis > 70) {
    next.approval -= 4;
    next.stability -= 5;
  }

  for (const key of ['approval', 'stability', 'energy', 'economy', 'environment', 'infrastructure', 'industry', 'trust', 'crisis']) {
    next[key] = clamp(next[key]);
  }

  next.budget = Math.round(next.budget);
  return next;
}

export default function App() {
  const [state, setState] = useState(initialState);

  const stats = useMemo(() => [
    ['Budget', state.budget, 'budget'],
    ['Zustimmung', state.approval, 'approval'],
    ['Stabilitaet', state.stability, 'stability'],
    ['Energie', state.energy, 'energy'],
    ['Wirtschaft', state.economy, 'economy'],
    ['Umwelt', state.environment, 'environment'],
    ['Infrastruktur', state.infrastructure, 'infrastructure'],
    ['Industrie', state.industry, 'industry'],
    ['Vertrauen', state.trust, 'trust'],
    ['Krisenlevel', state.crisis, 'crisis'],
  ], [state]);

  function executeAction(action) {
    if (state.gameOver) return;

    if (state.budget < action.cost) {
      setState({ ...state, log: ['Nicht genug Budget fuer diese Massnahme.', ...state.log] });
      return;
    }

    let next = { ...state, budget: state.budget - action.cost };
    next = applyEffects(next, action.effect);

    const logEntries = [`Massnahme umgesetzt: ${action.name}`];

    if (Math.random() > 0.52) {
      const event = events[Math.floor(Math.random() * events.length)];
      next = applyEffects(next, event.effect);
      logEntries.unshift(`Ereignis: ${event.name} - ${event.text}`);
    }

    next.log = [...logEntries, ...state.log];
    next = simulateNetwork(next);
    next.turn += 1;
    next.year += 1;
    next.budget += 25;
    next.crisis = clamp(next.crisis - 2);

    if (next.stability <= 10 || next.approval <= 5 || next.trust <= 5) {
      next.gameOver = true;
      next.result = 'Niederlage: Die Regierung kollabiert.';
      next.log = [next.result, ...next.log];
    }

    if (next.turn >= 12 && next.stability > 50 && next.economy > 55 && next.approval > 45) {
      next.gameOver = true;
      next.result = 'Sieg: Wiederwahl gewonnen und System stabilisiert.';
      next.log = [next.result, ...next.log];
    }

    if (next.turn >= 12 && !next.gameOver) {
      next.gameOver = true;
      next.result = 'Unentschieden: Amtszeit ueberstanden, aber ohne klares Mandat.';
      next.log = [next.result, ...next.log];
    }

    setState(next);
  }

  function resetGame() {
    setState(initialState);
  }

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Onlinespiel-Prototyp</p>
          <h1>Political System Game</h1>
          <p className="subtitle">Fuehre eine Regierung durch Krisen, Zielkonflikte und Kettenreaktionen.</p>
        </div>
        <div className="turn-card">
          <span>Jahr</span>
          <strong>{state.year}</strong>
          <span>Runde {state.turn} / 12</span>
        </div>
      </header>

      {state.gameOver && (
        <section className="result">
          <strong>{state.result}</strong>
          <button onClick={resetGame}>Neues Spiel</button>
        </section>
      )}

      <section className="stats-grid">
        {stats.map(([label, value, key]) => (
          <article className="stat" key={key}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="bar"><div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
          </article>
        ))}
      </section>

      <section className="layout">
        <div className="panel actions">
          <h2>Politische Massnahmen</h2>
          <div className="action-grid">
            {actions.map((action) => (
              <article className="action" key={action.id}>
                <div className="action-head">
                  <h3>{action.name}</h3>
                  <span>{action.cost} Budget</span>
                </div>
                <p>{action.description}</p>
                <div className="effects">
                  {Object.entries(action.effect).map(([key, value]) => (
                    <small key={key}>{key}: {value > 0 ? '+' : ''}{value}</small>
                  ))}
                </div>
                <button onClick={() => executeAction(action)} disabled={state.gameOver}>Umsetzen</button>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel log">
          <h2>Regierungslog</h2>
          <div className="log-list">
            {state.log.map((entry, index) => <div key={index} className="log-entry">{entry}</div>)}
          </div>
        </aside>
      </section>
    </main>
  );
}
