# Vectraxis

**Interactive MITRE ATT&CK threat actor visualizer. Search any known threat group, see every technique they use across the full attack matrix.**

---

## What This Is

Vectraxis is a web application built on top of the MITRE ATT&CK knowledge base. You search for a threat actor — APT28, Lazarus Group, FIN7, Sandworm, or any of the 130+ groups tracked by MITRE — and get a fully interactive ATT&CK matrix showing exactly which techniques that actor is known to use, organized across all 14 tactic columns.

Every technique cell links to a detail panel with the full description, detection guidance, mitigation recommendations, sub-techniques, and the specific context of how that actor has used it in real-world operations.

All data comes directly from the official MITRE ATT&CK STIX dataset. No third-party APIs. No API keys required.

---

## Why It Exists

The MITRE ATT&CK website is comprehensive but not built for rapid actor-focused analysis. If you want to understand what APT28 does and how to detect it, you end up manually cross-referencing actor pages with technique pages across multiple tabs. Vectraxis collapses that into a single view.

The use cases are practical: a red team mapping their operation to known actor TTPs, a blue team building detection coverage for a specific threat group, a security engineer doing threat modeling for their environment, or anyone trying to understand what a particular adversary actually does rather than reading paragraphs of prose to find out.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI |
| Data | MITRE ATT&CK STIX (Enterprise v14.1) |
| STIX Parsing | mitreattack-python |
| Caching | Redis |
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, Space Grotesk, JetBrains Mono |
| Animations | Framer Motion |
| Containerization | Docker, Docker Compose |

---

## Architecture

```
vectraxis/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry, lifespan hooks
│   │   ├── api/routes/            # actors, techniques, matrix, health
│   │   ├── core/
│   │   │   ├── attack_loader.py   # Downloads + caches STIX on startup
│   │   │   └── redis.py
│   │   └── services/
│   │       ├── actor_service.py   # Actor queries and search
│   │       ├── technique_service.py
│   │       └── matrix_service.py  # Builds matrix payload per actor
│   ├── data/
│   │   └── enterprise-attack.json # Downloaded once on first run
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Landing — actor search
│   │   └── actor/[id]/page.tsx    # Actor profile + matrix
│   ├── components/
│   │   ├── SearchBar.tsx          # Fuzzy actor search with dropdown
│   │   ├── AttackMatrix.tsx       # Full 14-column ATT&CK matrix
│   │   ├── TechniqueCell.tsx      # Individual matrix cell
│   │   ├── TechniqueDrawer.tsx    # Slide-in technique detail panel
│   │   ├── TacticColumn.tsx       # One column of the matrix
│   │   ├── ActorHeader.tsx        # Actor name, aliases, metadata
│   │   └── StatsRail.tsx          # Actor statistics sidebar
│   └── types/attack.ts            # TypeScript interfaces
│
├── docker-compose.yml
└── README.md
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/actors` | All tracked threat actors with technique counts |
| `GET` | `/api/actors/search?q=` | Search actors by name or alias |
| `GET` | `/api/actors/{id}` | Full actor profile |
| `GET` | `/api/actors/{id}/matrix` | Matrix-ready payload for a specific actor |
| `GET` | `/api/techniques/{id}` | Full technique detail with mitigations |
| `GET` | `/api/health` | Service status |

The matrix endpoint returns all 14 tactics and every technique within each, with a `used_by_actor` boolean per technique. The frontend renders used techniques as colored cells and unused as near-invisible — this is how the actor's profile takes shape visually.

---

## Getting Started

### Requirements

- Docker and Docker Compose
- Git

### Run Locally

```bash
git clone https://github.com/Devrancis/vectraxis.git
cd vectraxis
cp backend/.env.example backend/.env
docker compose up --build
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

On first startup, the backend downloads the MITRE ATT&CK Enterprise dataset (~50MB) and parses the STIX data into Redis. This takes approximately 10–15 seconds. Subsequent restarts use the cache and are near-instant.

### Environment Variables

**Backend (`backend/.env`)**

```env
REDIS_URL=redis://redis:6379
ATTACK_DATA_URL=https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack-14.1.json
CORS_ORIGINS=http://localhost:3000
DATA_DIR=./data
```

**Frontend (`frontend/.env.local`)**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## The Matrix

Each of the 14 ATT&CK tactic columns has a distinct color identity. Technique cells used by the selected actor render with that tactic's color at reduced opacity, with a full-color left border. Unused techniques are near-invisible. The contrast between what an actor does and what they don't is the core of the visualization.

Clicking any used technique opens a detail drawer from the right showing the full MITRE description, detection rules, mitigation options, and sub-techniques. Technique IDs (T1566, G0016) always render in monospace throughout the interface.

---

## Data

All data is sourced from the MITRE ATT&CK Enterprise knowledge base, licensed under [CC BY 4.0](https://attack.mitre.org/resources/terms-of-use/).

This product uses the MITRE ATT&CK® knowledge base. ATT&CK® is a registered trademark of The MITRE Corporation.

---

## Project Status

**Done**
- Project scaffolding, Docker setup, environment config

**In Progress**
- STIX data loader and Redis caching
- Actor and technique service layer
- API routes
- ATT&CK matrix component
- Technique drawer

**Planned**
- Technique filtering by platform (Windows / Linux / Cloud)
- Side-by-side actor comparison
- Tactic coverage heatmap across multiple actors
- Export matrix as PNG or PDF
- Campaign-level filtering (show only techniques from a specific campaign)

---

## License

MIT — see `LICENSE` for details.

---

Built by [Francis](https://github.com/Devrancis)