module.exports = {
  GRAPHQL: {
    URL: `https://stocks-wheel-graph.herokuapp.com/graphql`, // production
    // URL: `http://localhost:4000/graphql`, // local development
  },
  TARGETS: {
    PREMIUM_ANNUALIZED: 30, // targeting 30% annualized gains on each trade
    EARLY_CLOSE: 0.75, // cut out early
  },
  OPTION_STATUSES: ["OPEN", "CLOSED", "BOUGHT TO CLOSE", "EXPIRED", "ASSIGNED"],
};
