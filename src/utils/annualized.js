import moment from "moment";
import CONSTANTS from "../config/constants";
const Annualized = {
  minimumCoveredCallPremium: (
    strike,
    openDate = moment(),
    closeDate = moment().endOf("week").subtract(1, "d"),
    annualizedTarget = CONSTANTS.TARGETS.PREMIUM_ANNUALIZED / 100
  ) => {
    // strike *
    //     ((0.6 * moment(close_date).diff(open_date, "days")) / 360) * 1.3
    //

    const daysInYear = 365;
    const daysOpen = moment(closeDate).diff(openDate, "days");

    return (
      strike *
      ((annualizedTarget * daysOpen) / daysInYear) *
      (2 - annualizedTarget)
    );
  },
};

export default Annualized;
