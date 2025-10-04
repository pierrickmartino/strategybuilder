# Blockbuilders - Product Requirements Document

## 1. Elevator Pitch  
Blockbuilders is a web app that empowers retail crypto traders to design, test, and monitor trading strategies without writing code. Instead of learning scripting languages or juggling spreadsheets, users drag and connect modular blocks—data sources, indicators, signals, risk controls, and execution—into visual workflows. The system validates strategies in real time, runs fast backtests on BTC and ETH daily data, and lets users schedule paper-trading to monitor live-like performance. Blockbuilders makes reproducible, explainable, and compliant strategy building accessible to everyone.  

## 2. Who is this app for  
- Retail crypto traders who want to experiment with strategies without coding.  
- Hands-on tinkerers seeking trustworthy and reproducible workflows.  
- Users who are currently frustrated with opaque bots, Pine Script, or manual spreadsheets.  

## 3. Functional Requirements  
- **Strategy Canvas**: Drag-and-drop visual interface to build trading strategies from blocks.  
- **Validation Engine**: Real-time wiring checks to ensure valid strategies.  
- **Versioning**: Automatic version tracking of all changes.  
- **Backtesting**: Deterministic backtests on BTC-USD and ETH-USD using daily OHLCV data; target ~30 seconds for one year of data.  
- **Results Dashboard**: Equity curves, KPIs, and trade logs.  
- **Paper-Trading Scheduler**: Ability to schedule strategies for simulated live performance.  
- **Comparison View**: Line up multiple strategies side-by-side for analysis.  
- **Onboarding**: Starter templates, checklist, and contextual education to guide new users.  
- **Compliance**: Clear messaging that all results are simulation-only and not financial advice.  

### Non-Functional Requirements  
- **Performance**: Backtest runs within ~30 seconds for 1 year of daily data.  
- **Reliability**: 99.5% uptime target during beta.  
- **Security**: Encryption for data and user strategies, full auditability.  
- **Observability**: Monitoring for data quality and execution consistency.  

## 4. User Stories  
- As a retail trader, I want to drag blocks onto a canvas and connect them so I can visually create a strategy.  
- As a user, I want the system to validate my strategy connections in real time so I don’t make errors.  
- As a trader, I want to run a backtest and see results quickly so I can iterate on my ideas.  
- As a user, I want to view equity curves, KPIs, and trade logs so I can understand performance.  
- As a trader, I want to schedule my strategy for paper-trading so I can observe it in a live-like environment.  
- As a user, I want to compare two or more strategies side-by-side so I can decide which one to pursue.  
- As a new user, I want starter templates and guidance so I can achieve a first backtest quickly.  

## 5. User Interface (High-Level)  
- **Main Navigation**: Entry points for Canvas, Backtests, Paper-Trading, and Strategy Library.  
- **Canvas View**: Drag-and-drop area with block palette (data sources, indicators, signals, risk, execution).  
- **Results Dashboard**: Displays equity curves, key performance indicators, and trade logs.  
- **Comparison View**: Grid/table view for aligning multiple strategies.  
- **Onboarding Layer**: Guided walkthrough, starter templates, and contextual tips.  
