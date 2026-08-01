use statistics::hypothesis::{one_sample_t, Tail};

#[test]
fn test_one_sample_t() {
    let data = vec![10.0, 12.0, 9.0, 11.0, 10.5];
    let res = one_sample_t(&data, 10.0, Tail::TwoSided, Some(0.05)).unwrap();
    // mean = 10.5, s = 1.118, t = (10.5-10)/(1.118/sqrt(5)) = 0.5/0.5 = 1.0
    assert!((res.stat - 1.0).abs() < 0.1);
    assert!(res.p_value > 0.05);
}

#[test]
fn test_chisq_gof() {
    use statistics::hypothesis::chisq_gof;
    let obs = vec![10.0, 20.0, 30.0];
    let exp = vec![20.0, 20.0, 20.0];
    let res = chisq_gof(&obs, &exp, Tail::Greater).unwrap();
    // stat = (10-20)^2/20 + (20-20)^2/20 + (30-20)^2/20 = 100/20 + 0 + 100/20 = 5 + 5 = 10
    assert_eq!(res.stat, 10.0);
    assert!(res.p_value < 0.05);
}
