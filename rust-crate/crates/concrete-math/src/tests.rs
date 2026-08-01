use crate::sequence::recurrence_relation::RecurrenceRelation;
use num_complex::Complex;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fibonacci() {
        // F_n = F_{n-1} + F_{n-2}, F_0=0, F_1=1
        // coeffs are [a_{k-1}, ..., a_0] for a_n = sum c_i a_{n-k+i}
        // Here a_n = 1*a_{n-1} + 1*a_{n-2} => coeffs = [1, 1]
        let rel = RecurrenceRelation::new(vec![1.0, 1.0], vec![], vec![0.0, 1.0]);
        let closed = rel.solve();

        // F_10 = 55
        let f10 = closed.term(10);
        assert!((f10.re - 55.0).abs() < 1e-9);
    }
}
