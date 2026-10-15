#!/usr/bin/env bash
# ============================================================================
#  Milemark API - the same calls in curl form.
#  Works in Git Bash / WSL / macOS / Linux.  On Windows PowerShell use:
#      curl.exe http://localhost:3000/api/vehicles
# ============================================================================

BASE="http://localhost:3000"

# ------------------------------ GET ----------------------------------------
curl -X GET "$BASE/api/vehicles"
curl -X GET "$BASE/api/vehicles?type=Compact"
curl -X GET "$BASE/api/vehicles?available=true"
curl -X GET "$BASE/api/vehicles/1"
curl -X GET "$BASE/api/rentals"
curl -X GET "$BASE/api/stats"

# ------------------------------ POST ---------------------------------------
# Add a vehicle  (required: name, type, pricePerDay)
curl -X POST "$BASE/api/vehicles" \
  -H "Content-Type: application/json" \
  -d '{"name":"Audi A4 Quattro","type":"Sedan","pricePerDay":75,"seats":5,"gear":"AWD","fuel":"Petrol"}'

# Rent a vehicle (optional: customerName, days, pickupLocation)
curl -X POST "$BASE/api/rent/2" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John Miller","days":4,"pickupLocation":"Airport Terminal 2"}'

# ------------------------------ PUT ----------------------------------------
# Return a vehicle (no body needed)
curl -X PUT "$BASE/api/return/2" -H "Content-Type: application/json"

# ------------------------------ DELETE -------------------------------------
# Delete a vehicle by id
curl -X DELETE "$BASE/api/vehicles/6"
