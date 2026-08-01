use algebraic::expr::SymbolicExpr as E;

// Closed-form partial sums for standard families, returned as SymbolicExpr.
// Initial scope: geometric sum, arithmetic sum, arithmetic-geometric sum.

pub fn geometric_sum(r: E, n: E) -> E {
    // sum_{k=0}^{n} r^k = (1 - r^{n+1}) / (1 - r) for r != 1; else n+1
    let one = E::int(1);
    if r == one {
        return E::add(vec![n, one]).simplify();
    }
    let num = E::add(vec![
        one.clone(),
        E::mul(vec![
            E::int(-1),
            E::pow(r.clone(), E::add(vec![n.clone(), one.clone()])),
        ]),
    ])
    .simplify();
    let den = E::add(vec![one.clone(), E::mul(vec![E::int(-1), r])]).simplify();
    (num / den).simplify()
}

pub fn arithmetic_sum(a0: E, d: E, n: E) -> E {
    // sum_{k=0}^{n} (a0 + k d) = (n+1)a0 + d n(n+1)/2
    let one = E::int(1);
    let n1 = E::add(vec![n.clone(), one.clone()]).simplify();
    let term1 = E::mul(vec![n1.clone(), a0]).simplify();
    let term2 = E::mul(vec![
        d,
        E::mul(vec![n.clone(), n1]).simplify(),
        E::rational(1, 2),
    ])
    .simplify();
    E::add(vec![term1, term2]).simplify()
}

pub fn arith_geom_sum(a0: E, d: E, r: E, n: E) -> E {
    // sum_{k=0}^{n} (a0 + k d) r^k = a0 * S_geom + d * ( (r - (n+1) r^{n+1} + n r^{n+2}) / (1-r)^2 )
    let one = E::int(1);
    let s_geom = geometric_sum(r.clone(), n.clone());
    let n1 = E::add(vec![n.clone(), one.clone()]).simplify();
    let r_n1 = E::pow(r.clone(), n1.clone());
    let r_n2 = E::pow(r.clone(), E::add(vec![n.clone(), E::int(2)]));
    let num = E::add(vec![
        r.clone(),
        E::mul(vec![E::int(-1), n1.clone(), r_n1.clone()]).simplify(),
        E::mul(vec![n.clone(), r_n2]).simplify(),
    ])
    .simplify();
    let den = E::pow(
        E::add(vec![one.clone(), E::mul(vec![E::int(-1), r.clone()])]).simplify(),
        E::int(2),
    );
    let second = E::mul(vec![d, (num / den).simplify()]).simplify();
    E::add(vec![E::mul(vec![a0, s_geom]).simplify(), second]).simplify()
}
