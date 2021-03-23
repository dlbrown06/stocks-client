module.exports = {
  GRAPHQL: {
    URL: `https://stocks-wheel-graph.herokuapp.com/graphql`, // production
    // URL: `https://localhost:400/graphql` // local development
  },
  TARGETS: {
    PREMIUM_ANNUALIZED: 60, // targeting 60% annualized gains on each trade
    EARLY_CLOSE: 0.75, // cut out early
  },
};
