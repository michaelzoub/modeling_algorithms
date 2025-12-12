# Simplex Algorithm

TypeScript implementation of the Simplex algorithm for linear programming optimization.

## Structure

type Table = {
    header: string[],
    rows: TableRow[],
    z_row: number[]
}

## Usage
### Mock data (replace if needed):

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

## Algorithm

  1.	Find most negative (max) or positive (min) coefficient in z-row → entering variable
	2.	Minimum ratio test (b/coefficient, positive only) → leaving variable
	3.	Pivot: normalize row, eliminate column
	4.	Repeat until optimal

## Functions

	•	verify_z_negative() / verify_z_positive() - Select entering variable
	•	verify_row_and_perform_header_swap() - Minimum ratio test
	•	compute_row_reduction() - Gauss-Jordan elimination
	•	solve_simplex() - Main solver
