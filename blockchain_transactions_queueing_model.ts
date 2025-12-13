import { factorial } from "./helpers/factorial";
//fetch data on amount of workers
const API_URL = process.env.API_URL;

async function init() {
    const response = fetch(`${API_URL}/workers`);
    return response;
}

function average_transaction_time(transactions_time_array: number[]) {
    let count = 0;
    let total = 0;
    transactions_time_array.forEach((t) => {
        count++;
        total+=t;
    });

    return total / count;
}

//λ = arrival rate (customers/hour)
//μ = service rate (customers/hour per server)
//goal: keep utilization under 0.9
function compute_utilization(lambda: number, mhu: number, current_server_amount: number) {
    return (lambda / (current_server_amount * mhu));
}

function compute_probability_no_customers(lambda: number, mhu: number, current_server_amount: number, utilization: number) {
    const RHS = ((Math.pow((lambda / mhu), current_server_amount)) / factorial(current_server_amount)) * (1 / (1 - utilization));
    let LHS = 0;
    for (let n = 0; n < current_server_amount - 1; n++) {
        LHS += ((lambda / mhu) ^ current_server_amount / factorial(n))
    }

    return Math.pow(LHS + RHS, -1);
}

function compute_probability_n_customers(queue_probability: number, probability_no_customers: number) {
    return queue_probability * probability_no_customers;
}

function compute_erlang_c(lambda: number, mhu: number, current_customer_amount: number) {

}

