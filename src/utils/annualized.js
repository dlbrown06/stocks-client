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

  minimumPremiumForcast: (
    strike,
    contracts,
    open,
    expiration,
    annualizedTarget = CONSTANTS.TARGETS.PREMIUM_ANNUALIZED / 100
  ) => {
    const daysInYear = 365;
    const buyingPower = strike * contracts * 100;
    const annualizedGain = buyingPower * annualizedTarget;
    const ppd = annualizedGain / daysInYear;

    const forecast = {
      strike,
      contracts,
      open,
      expiration,
      buying_power: buyingPower,
      annualized_target: annualizedTarget,
      annualized_gain: annualizedGain,
      ppd,
      days: [],
    };

    let dateCursor = moment(open).add(1, "day");
    forecast.days.push({
      date_cursor: dateCursor.format("YYYY-MM-DD"),
      days_since_open: moment(dateCursor).diff(moment(open), "days"),
      days_until_expiration: moment(expiration).diff(dateCursor, "days"),
      profit_unrealized:
        (moment(expiration).diff(dateCursor, "days") + 1) * ppd,
    });

    while (moment(expiration).diff(dateCursor, "days") > 0) {
      dateCursor = moment(dateCursor).add(1, "day");
      forecast.days.push({
        date_cursor: dateCursor.format("YYYY-MM-DD"),
        days_since_open: moment(dateCursor).diff(moment(open), "days"),
        days_until_expiration: moment(expiration).diff(dateCursor, "days"),
        profit_unrealized:
          (moment(expiration).diff(dateCursor, "days") + 1) * ppd,
      });
    }

    return forecast;
  },
};

export default Annualized;
