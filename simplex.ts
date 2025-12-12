type BasicVariable = string; 

type TableRow = {
    basic_var: BasicVariable,
    coefficients: number[]
}

type Table = {
    header: string[], 
    rows: TableRow[],
    z_row: number[] 
}

const z_values = [];

//mock data
const initial_table: Table = {
    header: ["x1", "x2", "x3", "x4", "x5", "b"],
    rows: [
        { basic_var: "x3", coefficients: [5, 3, 1, 0, 0, 30] },
        { basic_var: "x4", coefficients: [2, 3, 0, 1, 0, 24] },
        { basic_var: "x5", coefficients: [1, 3, 0, 0, 1, 18] }
    ],
    z_row: [-8, -6, 0, 0, 0, 0]
}

function verify_z_negative(z_row: number[]) {
    let smallest = { value: 0, index: -1 };

    for (let i = 0; i < z_row.length; i++) {
        if (z_row[i] < smallest.value) {
            smallest = { value: z_row[i], index: i }
        }
    }

    return smallest;
}

function verify_z_positive(z_row: number[]) {
    let biggest = { value: 0, index: -1 };

    for (let i = 0; i < z_row.length; i++) {
        if (z_row[i] > biggest.value) {
            biggest = { value: z_row[i], index: i }
        }
    }

    return biggest;
}

function verify_row_and_perform_header_swap(table: Table, column_index_decision: number) {
    const rows = table.rows;
    const smallest_c_variable = { value: 0, index: -1 };
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].coefficients;

        const b_value = row[row.length - 1];
        const row_index_value = row[column_index_decision];
        const computed_value = (b_value / row_index_value);

        if (row_index_value > 0) {
            if (i == 0) {
                smallest_c_variable.value = computed_value;
                smallest_c_variable.index = 0;
            } else {
                if (smallest_c_variable.value > computed_value) {
                    smallest_c_variable. value = computed_value;
                    smallest_c_variable.index = i;
                }
            }
        }
    }

    if (smallest_c_variable.index === -1) {
        throw new Error("Unbounded solution");
    }
    
    //swap base variable with independant variable
    table.rows[smallest_c_variable.index].basic_var = `x${column_index_decision + 1}`;

    return { new_table: table, row_index_decision: smallest_c_variable.index };
}

function compute_row_reduction(table: Table, row_index_decision: number, column_index_decision: number) {
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        if (i == row_index_decision) {
            //find multiplier
            const divisor = row.coefficients[column_index_decision];
            table.rows[i].coefficients.forEach((c, index) => {
                table.rows[i].coefficients[index] = table.rows[i].coefficients[index] / divisor;
            })
        } else {
            //find multiplier -> multiply decision row by multiplier and substract or add current row's every element by decision row x multiplier
            const multiplier = row.coefficients[column_index_decision];
            const decision_row: TableRow["coefficients"] = []
            table.rows[row_index_decision].coefficients.forEach((c, index) => {
                decision_row.push(c * multiplier);
            })
            table.rows[i].coefficients = table.rows[i].coefficients.map((c, index) => c - decision_row[index])
        }

    }
    //do the same for z_row
    const multiplier = table.z_row[column_index_decision];
    const z_row: TableRow["coefficients"] = []
    table.rows[row_index_decision].coefficients.forEach((c, index) => {
        z_row.push(c * multiplier);
    })
    table.z_row = table.z_row.map((c, index) => c - z_row[index])


    return table;
}

function z_function(x_coefficient: number, y_coefficient: number, x: number, y: number) {
    return (x_coefficient * x) + (y_coefficient * y);
}

function solve_simplex(table: Table) {
    const z_compute_result = verify_z_negative(table.z_row);
    const column_index_decision = z_compute_result.index;
    if (z_compute_result.index !== -1) {
        const swapped_variables_table = verify_row_and_perform_header_swap(table, z_compute_result.index);
        const normalized_table = compute_row_reduction(swapped_variables_table.new_table, swapped_variables_table.row_index_decision, column_index_decision);

        //recursively checks until all elements inside z row are exclusively positive or negative (depending on maximization or minimization)
        solve_simplex(normalized_table);
    } else {
        console.log(table);
        return table;
    }
}


//test:
solve_simplex(initial_table)