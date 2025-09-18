const en = {
  common: {
    appName: "Strategy Builder",
  },
  home: {
    hero: {
      badge: "Strategy Builder",
      heading: "Build crypto trading strategies with zero code",
      description:
        "Drag-and-drop your logic, backtest on historical data, and paper trade live markets — all from one browser workspace designed for beginners and pros alike.",
      cta: "Access the demo workspace",
      credentialsHint: "Use demo credentials provided on the sign-in page.",
    },
    highlights: [
      {
        title: "Design visually",
        copy:
          "Drag, drop, and connect nodes on an infinite canvas to express trading logic without touching code.",
      },
      {
        title: "Validate safely",
        copy:
          "Replay strategies against curated historical OHLCV data to understand returns, drawdowns, and trade logs.",
      },
      {
        title: "Paper trade live",
        copy: "Shadow live markets through CCXT-powered feeds to see how your strategy behaves in current conditions.",
      },
    ],
    pricing: {
      heading: "Choose your pace",
      tiers: [
        {
          name: "Free",
          features: ["• 3 saved strategies", "• Daily backtest quota", "• One connected wallet"],
        },
        {
          name: "Premium",
          features: [
            "• Unlimited strategies & backtests",
            "• Priority computation queue",
            "• Multiple wallets & private sharing",
          ],
          highlighted: true,
        },
      ],
    },
  },
  auth: {
    heading: "Sign in to Strategy Builder",
    subheading: "Use the demo credentials to explore the workspace.",
    emailLabel: "Email",
    emailPlaceholder: "demo@strategybuilder.app",
    passwordLabel: "Password",
    passwordPlaceholder: "demo123",
    submit: "Enter workspace",
    success: "Access granted! Redirecting...",
    error: "Invalid credentials. Try demo@strategybuilder.app / demo123.",
  },
  strategies: {
    heading: "Strategy Workspace",
    description: "Mocked flowchart editor placeholder with simple CRUD for strategies.",
    nameLabel: "Strategy name",
    namePlaceholder: "e.g. Trend Following",
    notesLabel: "Notes",
    notesPlaceholder: "Outline the decision flow for this strategy",
    createAction: "Create strategy",
    saveAction: "Save changes",
    cancelAction: "Cancel edit",
    editAction: "Edit",
    deleteAction: "Delete",
    emptyState: "No strategies yet. Add one to start shaping the flowchart.",
    demoStrategies: [
      { id: 1, name: "Mean Reversion", notes: "Buy dips, sell spikes." },
      { id: 2, name: "Breakout", notes: "Ride momentum after key levels." },
    ],
  },
};

export default en;
