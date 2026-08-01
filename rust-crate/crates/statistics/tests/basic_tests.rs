use statistics::continuous_stats::Stats as ContStats;
use statistics::discrete_stats::Stats as DiscStats;

#[test]
fn test_discrete_stats() {
    let data = vec![1, 2, 2, 3, 4];
    assert_eq!(data.mean(), Some(2.4));
    assert_eq!(data.median(), Some(2.0));
    assert_eq!(data.mode().unwrap(), vec![2]);
    let var = data.unbiased_variance().unwrap();
    assert!((var - 1.3).abs() < 1e-9);
}

#[test]
fn test_continuous_stats() {
    let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
    assert_eq!(data.mean(), Some(3.0));
    assert_eq!(data.median(), Some(3.0));
    let var = data.unbiased_variance().unwrap();
    assert!((var - 2.5_f64).abs() < 1e-9);
}

#[test]
fn test_percentile() {
    let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
    assert_eq!(data.percentiles(50.0).unwrap(), 3.0);
    assert_eq!(data.percentiles(0.0).unwrap(), 1.0);
    assert_eq!(data.percentiles(100.0).unwrap(), 5.0);
}
