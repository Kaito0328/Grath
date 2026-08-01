export const SAMPLE_DATA_SETS = [
    {
        name: "Standard Normal Sample (N=100)",
        data: Array.from({ length: 100 }, () => {
            // Box-Muller transform
            const u1 = Math.random();
            const u2 = Math.random();
            return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        }),
    },
    {
        name: "Outlier Sample",
        data: [1, 2, 3, 2, 1, 2, 3, 100],
    },
    {
        name: "Uniform (0, 10)",
        data: Array.from({ length: 50 }, () => Math.random() * 10),
    },
    {
        name: "Poisson-like (Exp lambda=5)",
        data: Array.from({ length: 60 }, () => -Math.log(Math.random()) * 5),
    },
    {
        name: "Group A/B Sample (Effect=0.5)",
        data: [
            ...Array.from({ length: 30 }, () => Math.random() + 0.0), // Mean ~0.5
            ...Array.from({ length: 30 }, () => Math.random() + 0.5), // Mean ~1.0
        ],
    },
];
