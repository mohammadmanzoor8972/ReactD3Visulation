import { largestRemainderRound } from "./utils/largestRemainderRound";

export function transformData(config, data) {
  function getTotal(d) {
    const a = getMeasures(d);
    return a.reduce(getSum);
  }

  function getSum(total, num) {
    return Math.abs(total) + Math.abs(num);
  }

  function getPercentage(val, t) {
    return Math.abs(val) / t;
  }

  function getMeasures(d) {
    return config.map(d1 => d[d1.measure]);
  }


  function getRoundedPercentage(d, i) {
    const a = getMeasures(d);
    const t = getTotal(d);
    const p = a.map(d1 => Math.abs(getPercentage(d1, t) * 100));
    const pl = largestRemainderRound(p, 100);

    return pl[i];
  }

  return data.map(d => {
    const t = getTotal(d);
    let o = {};

    config.forEach((element, i) => {
      o[element.measure + "_per_label"] = getRoundedPercentage(d, i);
    });

    const v = {
      ...d,
      ...o,
      total: t
    };

    return v;
  });
}
