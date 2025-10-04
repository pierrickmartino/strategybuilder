# Blockbuilders PRD

## 1. Elevator Pitch  
Blockbuilders is a web application that empowers retail crypto traders to design, test, and monitor trading strategies without writing code. Through a drag-and-drop visual canvas, users connect data sources, indicators, signals, risk controls, and execution blocks into runnable strategies. Real-time validation and automatic versioning ensure reliability, while lightning-fast backtests and paper-trading give traders a reproducible, trustworthy way to experiment. Blockbuilders delivers a safeguarded lab where ideas go from canvas → backtest → live-simulation quickly and transparently.

---

## 2. Who is this app for  
- Retail crypto traders who are hands-on, curious, and technically savvy but not necessarily coders.  
- Users who want reproducible, explainable workflows without dealing with Pine Script, spreadsheets, or opaque bots.  
- Power users who demand speed, auditability, and deterministic strategy evaluation.  

---

## 3. Functional Requirements  
The MVP must provide:  
- **Visual Strategy Canvas**: Full-screen drag-and-drop canvas to assemble blocks (data sources, indicators, signals, risk controls, execution).  
- **Node Editing**: Right-side drawer for configuring block parameters.  
- **Real-Time Validation**: Check connections and logic while building strategies.  
- **Versioning**: Automatic version history of strategies.  
- **Backtesting Engine**: Deterministic, ~30-second backtests on one year of hourly BTC-USD and ETH-USD data.  
- **Backtest Output**: Equity curves, KPIs, trade logs.  
- **Paper Trading Scheduler**: Ability to run strategies in simulation mode with live data feeds.  
- **Dashboards**: In-app performance dashboards with metrics.  
- **Notifications**: Email and in-app alerts for paper trading events.  
- **Comparison View**: Line up multiple strategy results side by side.  
- **Onboarding & Education**: Starter templates, contextual hints, and checklists guiding first successful backtest.  
- **Reliability & Compliance**: 99.5% uptime target, encrypted data, clear “simulation only / not financial advice” messaging.  

---

## 4. User Stories (Power User Perspective)  
- As a power user, I want to drag blocks onto a canvas and connect them logically so I can rapidly prototype new strategies.  
- As a power user, I want each node to have editable parameters in a side drawer so I can fine-tune configurations without leaving the canvas.  
- As a power user, I want real-time validation to warn me about invalid connections so I don’t waste time running broken strategies.  
- As a power user, I want automatic versioning so I can roll back or compare past iterations of my strategies.  
- As a power user, I want to backtest BTC-USD and ETH-USD strategies over a year of hourly data in ~30 seconds so I can evaluate feasibility quickly.  
- As a power user, I want detailed backtest outputs (equity curve, KPIs, trade logs) so I can analyze performance.  
- As a power user, I want to schedule paper-trading runs so I can observe strategies with live-like conditions.  
- As a power user, I want performance dashboards so I can monitor my running and past strategies.  
- As a power user, I want notifications when paper-trading strategies trigger key events so I stay updated without constant monitoring.  
- As a power user, I want to compare multiple strategies side-by-side so I can identify which approach works best.  

---

## 5. User Interface  
- **Canvas**: Full-screen drag-and-drop interface for building strategies.  
- **Node Drawer**: Right-side drawer opens to configure node parameters.  
- **Backtest Results View**: Visualizations for equity curve, KPIs, and trade logs.  
- **Dashboard**: Central hub for active/past strategies and scheduled paper trades.  
- **Comparison View**: Split-screen or tabular layout for multiple strategies.  
- **Onboarding Layer**: Starter templates, checklists, and contextual hints to get users to their first backtest quickly.  
