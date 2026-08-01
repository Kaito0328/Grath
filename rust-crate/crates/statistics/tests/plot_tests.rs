use statistics::distribution::continuous::normal::Normal;
use statistics::plot::svg_continuous_pdf;

#[test]
fn test_svg_smoke() {
    let n = Normal::new(0.0, 1.0).unwrap();
    let svg = svg_continuous_pdf(&n, 400, 300, 100);
    assert!(svg.contains("<svg"));
    assert!(svg.contains("<path"));
    assert!(svg.contains("</svg>"));
}
