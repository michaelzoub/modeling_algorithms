# Simplex Algorithm
TypeScript implementation of the Simplex algorithm for linear programming optimization.

## Structure
```typescript
type Table = {
    header: string[],
    rows: TableRow[],
    z_row: number[]
}
```

## Usage
```typescript
const problem: Table = {
    header: ["x1", "x2", "x3", "x4", "x5", "b"],
    rows: [
        { basic_var: "x3", coefficients: [5, 3, 1, 0, 0, 30] },
        { basic_var: "x4", coefficients: [2, 3, 0, 1, 0, 24] },
        { basic_var: "x5", coefficients: [1, 3, 0, 0, 1, 18] }
    ],
    z_row: [-8, -6, 0, 0, 0, 0]
}
const solution = solve_simplex(problem);
```

## Algorithm
1. Find entering variable (most negative in z-row)
2. Minimum ratio test → leaving variable
3. Pivot and normalize
4. Repeat until optimal

## Functions
- `verify_z_negative()` / `verify_z_positive()` - Select entering variable
- `verify_row_and_perform_header_swap()` - Minimum ratio test
- `compute_row_reduction()` - Gauss-Jordan elimination
- `solve_simplex()` - Main solver

---

# M/M/s Queue (Erlang-C)
TypeScript implementation for capacity planning and server sizing.

## Structure
```typescript
interface QueueMetrics {
  lambda: number;  // arrival rate (customers/hour)
  mu: number;      // service rate per server (customers/hour)
  s: number;       // number of servers
}
```

## Usage
```typescript
// Example: 1200 trades/hour, 3 seconds per trade, 2 workers
const lambda = 1200;
const mu = 1200;  // 1/(3/3600) customers/hour per server
const s = 2;

const rho = compute_utilization(lambda, mu, s);  // 0.5
const decision = should_scale(lambda, mu, s);
```

## Algorithm
1. Calculate ρ = λ / (s × μ)
2. If ρ > 0.8 → add servers
3. If ρ < 0.3 → remove servers
4. Target: 0.7 ≤ ρ ≤ 0.8

## Functions
- `compute_utilization()` - Calculate ρ
- `should_scale()` - Auto-scaling decision
- `factorial()` - Helper for Erlang-C
