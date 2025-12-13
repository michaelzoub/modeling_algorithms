import { factorial } from "./helpers/factorial";

//endpoint to fetch data on amount of workers
const API_URL = process.env.API_URL;
const UTILIZATION_THRESHOLD = 0.9;

async function init() {
  const response = fetch(`${API_URL}/workers`);
  return response;
}

function average_transaction_time(transactions_time_array: number[]) {
  let count = 0;
  let total = 0;
  transactions_time_array.forEach((t) => {
    count++;
    total += t;
  });

  return total / count;
}

//λ = arrival rate (customers/hour)
//μ = service rate (customers/hour per server)
//goal: keep utilization under 0.9
function compute_utilization(
  lambda: number,
  mhu: number,
  current_server_amount: number,
) {
  return lambda / (current_server_amount * mhu);
}

function compute_probability_no_customers(
  lambda: number,
  mhu: number,
  current_server_amount: number,
  utilization: number,
) {
  const RHS =
    (Math.pow(lambda / mhu, current_server_amount) /
      factorial(current_server_amount)) *
    (1 / (1 - utilization));
  let LHS = 0;
  for (let n = 0; n < current_server_amount - 1; n++) {
    LHS += Math.pow(lambda / mhu, n) / factorial(n);
  }

  return Math.pow(LHS + RHS, -1);
}

function compute_probability_n_customers(
  erlang_c: number,
  probability_no_customers: number,
) {
  return erlang_c * probability_no_customers;
}

function compute_erlang_c(
  lambda: number,
  mhu: number,
  servers_used: number,
  current_server_amount: number,
) {
  if (servers_used > current_server_amount) {
    throw new Error(`Limit for servers_used is ${current_server_amount}`);
  }
  return Math.pow(lambda / mhu, servers_used) / factorial(servers_used);
}

//get wait time/queue wait time and average time in queue
function compute_line_queue_size(
  lambda: number,
  mhu: number,
  utilization: number,
  probability_no_customers: number,
  current_server_amount: number,
) {
  return (
    (probability_no_customers *
      Math.pow(lambda / mhu, current_server_amount) *
      utilization) /
    (factorial(current_server_amount) * Math.pow(1 - utilization, 2))
  );
}

function compute_wait_time_queue(lambda: number, line_queue_size: number) {
  return line_queue_size / lambda;
}

function compute_wait_time(mhu: number, wait_time_queue: number) {
  return wait_time_queue + 1 / mhu;
}

export function should_scale(utilization: number) {
  if (utilization > UTILIZATION_THRESHOLD) {
    //run worker or push to telemetry
    console.error("Utilization is above threshold.", utilization);
  }
}

export async function solve_mms() {
  const response = await init();
  const data = await response.json();

  //total number of transactions and average transaction processing time of service + onchain
  const transactions = data.transactions;
  const transactions_arrival = data.transactions_arrival;

  const lambda = transactions;
  const mhu = average_transaction_time(transactions_arrival);
  const current_server_amount = data.current_server_amount;

  const utilization = compute_utilization(lambda, mhu, current_server_amount);

  should_scale(utilization);

  const probability_no_customers = compute_probability_no_customers(
    lambda,
    mhu,
    current_server_amount,
    utilization,
  );

  //probability of wait time at n customers (number_of_servers_used is an arbitrary test variables, change it depending on your needs)
  const number_of_servers_used = current_server_amount - 1;

  const erlang_c = compute_erlang_c(
    lambda,
    mhu,
    number_of_servers_used,
    current_server_amount,
  );
  const probability_n_customers = compute_probability_n_customers(
    erlang_c,
    probability_no_customers,
  );

  const line_queue_size = compute_line_queue_size(
    lambda,
    mhu,
    utilization,
    probability_no_customers,
    current_server_amount,
  );
  const wait_time_queue = compute_wait_time_queue(lambda, line_queue_size);
  const wait_time = compute_wait_time(mhu, wait_time_queue);
}
