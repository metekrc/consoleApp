let pool = { tokenA: 1000, tokenB: 1000, K: 1000000 }; 
let userBalance = { tokenA: 500, tokenB: 500 }; 

function swapTokens(wantedToken, amountDeposited) {
  if (amountDeposited <= 0) {
    console.log("Invalid amount. Please deposit a positive value.");
    return;
  }

  if (wantedToken === "tokenA") {
    if (userBalance.tokenB >= amountDeposited) {
      let newPoolTokenB = pool.tokenB + amountDeposited; // New pool token B after deposit
      let newPoolTokenA = pool.K / newPoolTokenB; // New pool token A calculated using K
      let takenAmount = pool.tokenA - newPoolTokenA; // Token A received by the user

      if (takenAmount > 0 && newPoolTokenA >= 0) {
        // Update balances
        userBalance.tokenB -= amountDeposited;
        userBalance.tokenA += takenAmount;

        pool.tokenB = newPoolTokenB;
        pool.tokenA = newPoolTokenA;

        console.log(`Successfully swapped ${amountDeposited} Token B for ${takenAmount.toFixed(2)} Token A.`);
      } else {
        console.log("Swap failed: insufficient liquidity.");
      }
    } else {
      console.log("Insufficient Token B balance.");
    }
  } else if (wantedToken === "tokenB") {
    // Swap Token A for Token B
    if (userBalance.tokenA >= amountDeposited) {
      let newPoolTokenA = pool.tokenA + amountDeposited; // New pool token A after deposit
      let newPoolTokenB = pool.K / newPoolTokenA; // New pool token B calculated using K
      let takenAmount = pool.tokenB - newPoolTokenB; // Token B received by the user

      if (takenAmount > 0 && newPoolTokenB >= 0) {
        // Update balances
        userBalance.tokenA -= amountDeposited;
        userBalance.tokenB += takenAmount;

        pool.tokenA = newPoolTokenA;
        pool.tokenB = newPoolTokenB;

        console.log(`Successfully swapped ${amountDeposited} Token A for ${takenAmount.toFixed(2)} Token B.`);
      } else {
        console.log("Swap failed: insufficient liquidity.");
      }
    } else {
      console.log("Insufficient Token A balance.");
    }
  } else {
    console.log("Invalid token selected.");
  }
}

// Example Usage
swapTokens("tokenA", 50); // Swap 50 Token B for Token A
swapTokens("tokenB", 30); // Swap 30 Token A for Token B

console.log("User Balances:", userBalance);
console.log("Pool Reserves:", pool);

