/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as statistics from '../wrappers/statistics';

function normalizeJsonNumbers(value: unknown): unknown {
  if (typeof value === 'number') {
    return Number(value.toPrecision(12));
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonNumbers(item));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeJsonNumbers(item)])
    );
  }
  return value;
}

describe('statistics wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    statistics.setWasmFromWasmLib(wasm);
  });

  describe('StatisticsApi::run_gmm_predict', () => {
    it('case 1', () => {
      const arg0 = "-0.1;0.0;0.2;9.8;10.0;10.2";
      const arg1 = "10.1";
      const arg2 = 2;
      const arg3 = 100;
      const arg4 = 0.000001;
      const result = statistics.runGmmPredict(arg0, arg1, arg2, arg3, arg4);
      expect(String(result)).toBe("1");
    });
  });

  describe('StatisticsApi::run_z_test_proportion', () => {
    it('case 1', () => {
      const arg0 = 50;
      const arg1 = 100;
      const arg2 = 0.5;
      const arg3 = "two-sided";
      const arg4 = 0.05;
      const result = statistics.runZTestProportion(arg0, arg1, arg2, arg3, arg4);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"stat\":0.0,\"p_value\":1.0,\"df1\":null,\"df2\":null,\"ci_lower\":0.48831267545092016,\"ci_upper\":0.5116873245490798,\"effect\":null,\"n1\":100,\"n2\":0,\"method\":\"One-sample proportion z-test\",\"tail\":\"two-sided\"}")));
    });
  });

  describe('StatisticsApi::run_ols_solve_linear_system', () => {
    it('case 1', () => {
      const arg0 = "1,0;1,1;1,2";
      const arg1 = "1,2,3";
      const result = statistics.runOlsSolveLinearSystem(arg0, arg1);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"coefficients\":[1.0000000000000007,0.9999999999999993],\"residuals\":[-6.661338147750939e-16,0.0,8.881784197001252e-16]}")));
    });
  });

  describe('StatisticsApi::run_gmm_pdf', () => {
    it('case 1', () => {
      const arg0 = "-0.1;0.0;0.2;9.8;10.0;10.2";
      const arg1 = "10.1";
      const arg2 = 2;
      const arg3 = 100;
      const arg4 = 0.000001;
      const result = statistics.runGmmPdf(arg0, arg1, arg2, arg3, arg4);
      expect(String(result)).toBe("1.0126524069580964");
    });
  });

  describe('StatisticsApi::run_gmm_log_pdf', () => {
    it('case 1', () => {
      const arg0 = "-0.1;0.0;0.2;9.8;10.0;10.2";
      const arg1 = "10.1";
      const arg2 = 2;
      const arg3 = 100;
      const arg4 = 0.000001;
      const result = statistics.runGmmLogPdf(arg0, arg1, arg2, arg3, arg4);
      expect(String(result)).toBe("0.01257303406145971");
    });
  });

  describe('StatisticsApi::run_bayesian_estimation', () => {
    it('case 1', () => {
      const arg0 = "1,2,3";
      const arg1 = "1,0;1,1;1,2";
      const arg2 = "0,0";
      const arg3 = "1,0;0,1";
      const arg4 = "1,0,0;0,1,0;0,0,1";
      const result = statistics.runBayesianEstimation(arg0, arg1, arg2, arg3, arg4);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"posterior_mean\":[0.8,0.9333333333333333],\"posterior_covariance\":[[0.4,-0.2],[-0.2,0.26666666666666666]]}")));
    });
  });

  describe('StatisticsApi::run_gmm_predict_proba', () => {
    it('case 1', () => {
      const arg0 = "-0.1;0.0;0.2;9.8;10.0;10.2";
      const arg1 = "10.1";
      const arg2 = 2;
      const arg3 = 100;
      const arg4 = 0.000001;
      const result = statistics.runGmmPredictProba(arg0, arg1, arg2, arg3, arg4);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("[0.0,1.0]")));
    });
  });

  describe('StatisticsApi::get_descriptive_stats', () => {
    it('case 1', () => {
      const arg0 = "1,2,3";
      const result = statistics.getDescriptiveStats(arg0);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"mean\":2.0,\"median\":2.0,\"variance\":1.0,\"std_dev\":1.0,\"skewness\":0.0,\"kurtosis\":-1.5,\"range\":2.0,\"q1\":1.5,\"q3\":2.5,\"iqr\":1.0,\"n\":3}")));
    });
  });

  describe('StatisticsApi::logistic_predict_proba', () => {
    it('case 1', () => {
      const arg0 = "0,2";
      const arg1 = "1";
      const result = statistics.logisticPredictProba(arg0, arg1);
      expect(String(result)).toBe("0.8807970779778823");
    });
  });

  describe('StatisticsApi::run_bayesian_em', () => {
    it('case 1', () => {
      const arg0 = "1,2,3";
      const arg1 = "1,0;1,1;1,2";
      const arg2 = 100;
      const arg3 = 0.000001;
      const result = statistics.runBayesianEm(arg0, arg1, arg2, arg3);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"prior_mean\":[0.9999999999996314,0.999999999999996],\"prior_covariance\":[[9.312953289333948e-11,-5.580526706529417e-11],[-5.580526706529417e-11,5.580528549138332e-11]],\"noise_covariance\":[[1e-8,1.2441421942681818e-11,-6.160333745749568e-12],[1.2441421942681818e-11,1e-8,1.2441434226741252e-11],[-6.160333745749568e-12,1.2441434226741252e-11,1e-8]]}")));
    });
  });

  describe('StatisticsApi::run_bayesian_estimation_with_precision', () => {
    it('case 1', () => {
      const arg0 = "1,2,3";
      const arg1 = "1,0;1,1;1,2";
      const arg2 = "0,0";
      const arg3 = "1,0;0,1";
      const arg4 = "1,0,0;0,1,0;0,0,1";
      const result = statistics.runBayesianEstimationWithPrecision(arg0, arg1, arg2, arg3, arg4);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"posterior_mean\":[0.8,0.9333333333333333],\"posterior_covariance\":[[0.4,-0.2],[-0.2,0.26666666666666666]]}")));
    });
  });

  describe('StatisticsApi::run_gmm_fit', () => {
    it('case 1', () => {
      const arg0 = "-0.1;0.0;0.2;9.8;10.0;10.2";
      const arg1 = 2;
      const arg2 = 100;
      const arg3 = 0.000001;
      const result = statistics.runGmmFit(arg0, arg1, arg2, arg3);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"weights\":[0.5,0.5],\"means\":[[0.03333333333333333],[10.0]],\"covariance_diagonals\":[[0.015556555555555558],[0.026667666666666482]],\"assignments\":[0,0,0,1,1,1],\"log_likelihood\":-0.9909967367134296}")));
    });
  });

  describe('StatisticsApi::run_kalman_filter', () => {
    it('case 1', () => {
      const arg0 = "0,1";
      const arg1 = "1,0;0,1";
      const arg2 = "1,1;0,1";
      const arg3 = "1,0";
      const arg4 = "0.001,0;0,0.001";
      const arg5 = "0.1";
      const arg6 = "1;2;3";
      const result = statistics.runKalmanFilter(arg0, arg1, arg2, arg3, arg4, arg5, arg6);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"states\":[[1.0,1.0],[2.0,1.0],[3.0,1.0]],\"covariance_diagonals\":[[0.09524036173250833,0.5250361732508328],[0.087752142063493,0.12441905920594712],[0.07794644557547738,0.04194333808749254]]}")));
    });
  });

  describe('StatisticsApi::run_ridge_regression', () => {
    it('case 1', () => {
      const arg0 = "1,0;1,1;1,2;1,3";
      const arg1 = "1,3,5,7";
      const arg2 = 0.1;
      const result = statistics.runRidgeRegression(arg0, arg1, arg2);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"coefficients\":[0.9990039692568391,1.998999013880011],\"residuals\":[0.0009960307431609028,0.001997016863149792,0.0029980029831389032,0.00399898910312757]}")));
    });
  });

  describe('StatisticsApi::run_simple_linear_regression', () => {
    it('case 1', () => {
      const arg0 = "1,2,3";
      const arg1 = "2,4,6";
      const result = statistics.runSimpleLinearRegression(arg0, arg1);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"intercept\":-8.881784197001252e-16,\"slope\":2.000000000000001,\"r_squared\":1.0,\"coefficients\":[-8.881784197001252e-16,2.000000000000001],\"residuals\":[0.0,-8.881784197001252e-16,-1.7763568394002505e-15]}")));
    });
  });

  describe('StatisticsApi::logistic_predict', () => {
    it('case 1', () => {
      const arg0 = "0,2";
      const arg1 = "1";
      const result = statistics.logisticPredict(arg0, arg1);
      expect(String(result)).toBe("1");
    });
  });

  describe('StatisticsApi::run_lasso_regression', () => {
    it('case 1', () => {
      const arg0 = "1,0;1,1;1,2;1,3";
      const arg1 = "1,3,5,7";
      const arg2 = 0.1;
      const arg3 = 1000;
      const arg4 = 0.000001;
      const result = statistics.runLassoRegression(arg0, arg1, arg2, arg3, arg4);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"coefficients\":[0.9600014030235171,2.009999398704207],\"residuals\":[0.03999859697648289,0.02999919827227604,0.019999799568068966,0.010000400863861891]}")));
    });
  });

  describe('StatisticsApi::run_logistic_regression', () => {
    it('case 1', () => {
      const arg0 = "0;1;2;3";
      const arg1 = "0,0,1,1";
      const arg2 = 0.1;
      const arg3 = 5000;
      const result = statistics.runLogisticRegression(arg0, arg1, arg2, arg3);
      expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse("{\"coefficients\":[-12.84006769362724,8.718844289334482],\"probabilities\":[2.6523345435182076e-6,0.015965616399251096,0.9900247299259899,0.9999983528545878],\"predictions\":[0.0,0.0,1.0,1.0]}")));
    });
  });

});
