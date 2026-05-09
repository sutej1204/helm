# Helm - Supplier Intelligence Platform

## Overview
Helm is a sophisticated fintech supplier intelligence platform. It provides a "Command Center" dashboard for real-time supplier monitoring, AI-powered intelligence feeds that synthesize data from ERP, Email/Zendesk, and Contract (CLM) systems, and a capital deployment engine for early payment discounts.

## User Preferences
- **Design Style**: Dark-mode-leaning enterprise SaaS aesthetic (think Ramp/Mercury). Professional, high-trust, data-dense layouts.
- **Theme**: Dark mode by default with emerald green accent color
- **Navigation**: Sidebar with Dashboard, Supplier Portfolio, Capital Deployment, Integrations

## Recent Changes
- **Feb 2026**: Complete UI overhaul to dark-mode enterprise fintech dashboard
  - New Command Center dashboard with animated stats, live events ticker
  - ACME Manufacturing supplier intelligence page with AI processing animation
  - Radial health score, intelligence feed from 3 sources (ERP, Zendesk, CLM)
  - Capital deployment modal with financial math breakdown
  - Updated sidebar navigation (Dashboard, Supplier Portfolio, Capital Deployment, Integrations)

## System Architecture

### Pages
- **Landing** (`/`): Hero landing page with tagline "Financial Orchestration for the Supply Chain — Putting CFOs in control", feature cards, CTA to dashboard. Renders outside the sidebar layout.
- **Dashboard** (`/dashboard`): Mission Control with global metrics ($500M managed spend, $12.4M working capital counter, 247 micro-negotiations, at-risk relationships), orchestration flow map, execute orchestration button with animated sequence, Live Agent Feed with framer-motion, Active Agent Negotiations table, Active Supplier Network high-density table (20 suppliers with flags, sector, spend, health bars, agent indicators, region breakdowns), Global Risk Map (react-simple-maps with local topojson), capital deployment MTD, AI recommendation card
- **Supplier Portfolio** (`/supplier-portfolio`): List of all suppliers with health scores, risk badges, spend amounts, search & filter
- **Supplier Intelligence** (`/supplier-portfolio/acme`): ACME Manufacturing profile with radial health score, AI processing animation, intelligence feed (ERP, Zendesk/Email, Contract CLM), deploy capital modal
- **Capital Deployment** (`/capital-deployment`): Deployment history, YTD stats, discount capture tracking, link to Payment Term Extension
- **Payment Term Extension** (`/capital-deployment/payment-terms`): Dark-themed liquidity optimization page with 4 KPI metrics, cash flow optimization slider (Conservative→Aggressive), supplier term grid with AI recommendations, and embedded side-by-side short-term financing cards (Pay Now / Installments / Pay Later with radio selection, term toggles, and dynamic orange CTAs)
- **Supplier Passport** (`/supplier-passport`): Supplier passport storage with 6 KPI metrics, filters (KYC/SCF/Risk), grid/list view toggle, supplier cards with ESG scores, compliance status, risk levels
- **Supplier Passport Detail** (`/supplier-passport/:id`): Individual passport with 5 tabs (Compliance, Contract, Payment, Financing, Automation) — KYC verification, ESG risk, value leakage analysis, payment behavior, SCF eligibility, AI automation rules
- **Integrations** (`/integrations`): Connected data sources (SAP ERP, Zendesk, Contract Storage, Salesforce)

### Technical Implementation
- **Frontend**: React + TypeScript with shadcn/ui, Tailwind CSS, wouter routing, dark mode via next-themes
- **Backend**: Express.js server with in-memory storage (MemStorage)
- **Styling**: Custom dark theme with emerald green primary, CSS animations for pulse-glow, scan-line, fade-in-up, radial-progress

## External Dependencies
- lucide-react for icons
- shadcn/ui component library
- next-themes for dark mode
- wouter for routing
- @tanstack/react-query for data fetching
- react-simple-maps for Global Risk Map
- framer-motion for animations
