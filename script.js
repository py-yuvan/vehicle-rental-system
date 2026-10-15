/**
 * ============================================================================
 *  MILEMARK VEHICLE RENTAL SYSTEM - API CLIENT SCRIPT
 * ============================================================================
 *  This file runs every REST endpoint of the server and prints the
 *  METHOD + URL + JSON BODY it sends, together with the server response.
 *
 *  HOW TO USE
 *  -----------
 *  1. Start the server first:   node server.js
 *  2. Then run this script:     node script.js
 *     (or)                     npm run api
 *     (or)                     BASE_URL=http://localhost:3000 node script.js
 *
 *  NO external packages are required - it uses the global `fetch()`
 *  that ships with Node.js 18+ (you are on Node 24).
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CONFIGURATION
// ----------------------------------------------------------------------------
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ----------------------------------------------------------------------------
// 2. TERMINAL COLOURS (so the output is easy to read)
// ----------------------------------------------------------------------------
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// ----------------------------------------------------------------------------
// 3. THE COMPLETE ENDPOINT REFERENCE (method, url, json body)
//    This is the catalogue that is printed at the start of the run.
// ----------------------------------------------------------------------------
const API_ENDPOINTS = [
  // ---------------- GET ----------------
  {
    method: 'GET',
    url: '/api/vehicles',
    body: null,
    note: 'List the whole fleet'
  },
  {
    method: 'GET',
    url: '/api/vehicles?type=Compact',
    body: null,
    note: 'List fleet filtered by class (Compact | Sedan | SUV | Luxury | Bike)'
  },
  {
    method: 'GET',
    url: '/api/vehicles?available=true',
    body: null,
    note: 'List only vehicles that are free right now'
  },
  {
    method: 'GET',
    url: '/api/vehicles/1',
    body: null,
    note: 'Get one vehicle by id'
  },
  {
    method: 'GET',
    url: '/api/rentals',
    body: null,
    note: 'List active rentals'
  },
  {
    method: 'GET',
    url: '/api/stats',
    body: null,
    note: 'Fleet summary counters'
  },

  // ---------------- POST ----------------
  {
    method: 'POST',
    url: '/api/vehicles',
    body: {
      name: 'Audi A4 Quattro',
      type: 'Sedan',
      pricePerDay: 75,
      seats: 5,
      gear: 'AWD',
      fuel: 'Petrol'
    },
    note: 'Add a new vehicle (name, type, pricePerDay are required)'
  },
  {
    method: 'POST',
    url: '/api/rent/2',
    body: {
      customerName: 'John Miller',
      days: 4,
      pickupLocation: 'Airport Terminal 2'
    },
    note: 'Rent a vehicle -> sets available = false'
  },

  // ---------------- PUT ----------------
  {
    method: 'PUT',
    url: '/api/return/2',
    body: null,
    note: 'Return a vehicle -> sets available = true and closes the rental'
  },

  // ---------------- DELETE ----------------
  {
    method: 'DELETE',
    url: '/api/vehicles/6',
    body: null,
    note: 'Delete a vehicle by id (also removes its active rental)'
  }
];

// ----------------------------------------------------------------------------
// 4. LOW LEVEL REQUEST HELPER
//    Sends the request and returns { status, data }.
// ----------------------------------------------------------------------------
async function request({ method, url, body }) {
  const fullUrl = BASE_URL + url;

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  // Only attach a body for methods that can carry one.
  if (body && method !== 'GET' && method !== 'DELETE') {
    options.body = JSON.stringify(body);
  }

  // Human readable log of what is being sent.
  console.log(`${C.cyan}  ${method.padEnd(6)} ${C.bold}${fullUrl}${C.reset}`);
  console.log(`${C.dim}  body  : ${body ? JSON.stringify(body) : '(none)'}${C.reset}`);

  const res = await fetch(fullUrl, options);
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, data };
}

// ----------------------------------------------------------------------------
// 5. STEP RUNNER - runs one call, prints the response, tracks pass / fail
// ----------------------------------------------------------------------------
let passed = 0;
let failed = 0;

async function step(label, call, expectedStatus = 200) {
  console.log(`\n${C.magenta}--- ${label} ---${C.reset}`);

  try {
    const { status, data } = await request(call);
    const ok = status === expectedStatus;
    const tag = ok ? `${C.green}PASS${C.reset}` : `${C.red}FAIL${C.reset}`;

    console.log(`${C.dim}  status: ${status}${C.reset}`);
    console.log(
      `  ${tag} ${C.dim}(expected ${expectedStatus})${C.reset}\n` +
      `  ${C.yellow}response:${C.reset} ${JSON.stringify(data, null, 2)
        .split('\n')
        .join('\n  ')}`
    );

    if (ok) passed++;
    else failed++;

    return data;
  } catch (err) {
    failed++;
    console.log(`${C.red}  FAIL${C.reset} ${err.message}`);
    console.log(`${C.dim}  Is the server running?  ->  node server.js${C.reset}`);
    return null;
  }
}

// ----------------------------------------------------------------------------
// 6. PRINT THE ENDPOINT REFERENCE TABLE
// ----------------------------------------------------------------------------
function printReference() {
  console.log(`\n${C.bold}${C.yellow}========================================================`);
  console.log('  MILEMARK API - METHOD / URL / JSON BODY REFERENCE');
  console.log('========================================================' + C.reset);
  console.log(`${C.dim}  Base URL: ${BASE_URL}${C.reset}\n`);

  for (const ep of API_ENDPOINTS) {
    console.log(`${C.cyan}${ep.method.padEnd(7)}${C.reset}${C.bold}${ep.url}${C.reset}`);
    console.log(`${C.dim}       body   : ${ep.body ? JSON.stringify(ep.body) : '(none)'}${C.reset}`);
    console.log(`${C.dim}       desc   : ${ep.note}${C.reset}`);
  }
  console.log('');
}

// ----------------------------------------------------------------------------
// 7. MAIN - exercise the full CRUD lifecycle
// ----------------------------------------------------------------------------
async function main() {
  console.log(`${C.bold}${C.yellow}========================================================`);
  console.log('  API SMOKE TEST - running all GET / POST / PUT / DELETE calls');
  console.log('========================================================' + C.reset);
  printReference();

  // ---- GET : read data -----------------------------------------------------
  await step('GET  /api/vehicles  (full fleet)', {
    method: 'GET',
    url: '/api/vehicles',
    body: null
  });

  await step('GET  /api/vehicles?type=Compact  (filter by class)', {
    method: 'GET',
    url: '/api/vehicles?type=Compact',
    body: null
  });

  await step('GET  /api/vehicles?available=true  (only free cars)', {
    method: 'GET',
    url: '/api/vehicles?available=true',
    body: null
  });

  await step('GET  /api/vehicles/1  (single vehicle)', {
    method: 'GET',
    url: '/api/vehicles/1',
    body: null
  });

  await step('GET  /api/vehicles/999  (not found -> 404)', {
    method: 'GET',
    url: '/api/vehicles/999',
    body: null
  }, 404);

  await step('GET  /api/rentals  (active rentals)', {
    method: 'GET',
    url: '/api/rentals',
    body: null
  });

  await step('GET  /api/stats  (fleet counters)', {
    method: 'GET',
    url: '/api/stats',
    body: null
  });

  // ---- POST : create data --------------------------------------------------
  const created = await step('POST /api/vehicles  (create -> 201)', {
    method: 'POST',
    url: '/api/vehicles',
    body: {
      name: 'Audi A4 Quattro',
      type: 'Sedan',
      pricePerDay: 75,
      seats: 5,
      gear: 'AWD',
      fuel: 'Petrol'
    }
  }, 201);

  await step('POST /api/vehicles  (missing name -> 400 validation)', {
    method: 'POST',
    url: '/api/vehicles',
    body: { type: 'Sedan', pricePerDay: 75 }
  }, 400);

  const newId = created && created.vehicle ? created.vehicle.id : null;

  if (newId) {
    // ---- GET : read the record we just created ------------------------------
    await step(`GET  /api/vehicles/${newId}  (read the new vehicle)`, {
      method: 'GET',
      url: `/api/vehicles/${newId}`,
      body: null
    });

    // ---- POST : rent it -----------------------------------------------------
    await step(`POST /api/rent/${newId}  (rent the new vehicle)`, {
      method: 'POST',
      url: `/api/rent/${newId}`,
      body: {
        customerName: 'John Miller',
        days: 4,
        pickupLocation: 'Airport Terminal 2'
      }
    });

    await step(`POST /api/rent/${newId}  (rent again -> 400 already rented)`, {
      method: 'POST',
      url: `/api/rent/${newId}`,
      body: {
        customerName: 'Someone Else',
        days: 1,
        pickupLocation: 'Uptown Station Plaza'
      }
    }, 400);

    await step('GET  /api/rentals  (new rental must be listed)', {
      method: 'GET',
      url: '/api/rentals',
      body: null
    });

    // ---- PUT : return it ---------------------------------------------------
    await step(`PUT  /api/return/${newId}  (return the vehicle)`, {
      method: 'PUT',
      url: `/api/return/${newId}`,
      body: null
    });

    // ---- DELETE : remove it ------------------------------------------------
    await step(`DELETE /api/vehicles/${newId}  (delete the vehicle)`, {
      method: 'DELETE',
      url: `/api/vehicles/${newId}`,
      body: null
    });

    await step(`GET  /api/vehicles/${newId}  (gone -> 404)`, {
      method: 'GET',
      url: `/api/vehicles/${newId}`,
      body: null
    }, 404);
  } else {
    console.log(`${C.yellow}\n  Skipped the create/rent/return/delete chain (POST failed).${C.reset}`);
  }

  // ---- SUMMARY -------------------------------------------------------------
  console.log(`\n${C.bold}${C.yellow}========================================================`);
  console.log(`  RESULT: ${C.green}${passed} passed${C.reset} / ${failed ? C.red : C.dim}${failed} failed${C.reset}`);
  console.log('========================================================' + C.reset);
  console.log(`${C.dim}  Tip: open ${BASE_URL} in your browser to see the UI.\n${C.reset}`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
