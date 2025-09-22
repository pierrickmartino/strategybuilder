const en = {
  common: {
    appName: "Strategy Builder"
  },
  home: {
    hero: {
      badge: "Strategy Builder",
      heading: "Build crypto trading strategies with zero code",
      description:
        "Drag-and-drop your logic, backtest on historical data, and paper trade live markets — all from one browser workspace designed for beginners and pros alike.",
      cta: "Access the demo workspace",
      credentialsHint: "Use your email, password, or Google account to continue."
    },
    highlights: [
      {
        title: "Design visually",
        copy:
          "Drag, drop, and connect nodes on an infinite canvas to express trading logic without touching code."
      },
      {
        title: "Validate safely",
        copy:
          "Replay strategies against curated historical OHLCV data to understand returns, drawdowns, and trade logs."
      },
      {
        title: "Paper trade live",
        copy: "Shadow live markets through CCXT-powered feeds to see how your strategy behaves in current conditions."
      }
    ],
    pricing: {
      heading: "Choose your pace",
      tiers: [
        {
          name: "Free",
          features: ["• 3 saved strategies", "• Daily backtest quota", "• One connected wallet"]
        },
        {
          name: "Premium",
          features: [
            "• Unlimited strategies & backtests",
            "• Priority computation queue",
            "• Multiple wallets & private sharing"
          ],
          highlighted: true
        }
      ]
    }
  },
  auth: {
    heading: "Sign in or create your workspace",
    subheading: "Authenticate with Supabase to load the interactive demo environment.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    passwordGuidance: "Passwords must contain at least 6 characters to satisfy Supabase policies.",
    oauthButton: "Continue with Google",
    orDivider: "or",
    signInAction: "Sign in",
    signUpAction: "Create account",
    switchToSignUp: "Need an account? Create one now.",
    switchToSignIn: "Already registered? Sign in instead.",
    consentLabel:
      "I confirm that I will only run simulated trades until my account passes compliance review.",
    consentHint: "Required for compliance — the demo workspace is simulation only.",
    loading: "Processing...",
    messages: {
      missingCredentials: "Enter both an email and password to continue.",
      consentRequired: "You must accept the simulation-only policy before accessing the workspace.",
      verifyEmail: "Check your inbox to verify your email before signing in.",
      successRedirect: "Authenticated successfully. Redirecting to your workspace...",
      redirectingForOAuth: "Redirecting to the provider for authentication...",
      genericError: "Something went wrong. Please try again."
    }
  },
  strategies: {
    heading: "Strategy Workspace",
    workspacePrefix: "Workspace: {name}",
    onboardingHeading: "Onboarding checklist",
    loadingWorkspace: "Bootstrapping your demo workspace...",
    description: "Launch into your seeded workspace, tweak nodes, and explore the canvas.",
    nameLabel: "Strategy name",
    namePlaceholder: "e.g. Trend Following",
    notesLabel: "Notes",
    notesPlaceholder: "Outline the decision flow for this strategy",
    createAction: "Create strategy",
    saveAction: "Save changes",
    cancelAction: "Cancel edit",
    editAction: "Edit",
    deleteAction: "Delete",
    designerAction: "Open designer",
    emptyState: "No strategies yet. Add one to start shaping the flowchart.",
    demoStrategies: [
      { id: 1, name: "Mean Reversion", notes: "Buy dips, sell spikes." },
      { id: 2, name: "Breakout", notes: "Ride momentum after key levels." }
    ]
  },
  designer: {
    heading: "Strategy Designer",
    description: "Mocked React Flow canvas to sketch how trades unfold.",
    backAction: "Back to strategies",
    untitled: "Untitled strategy"
  }
};

export default en;
