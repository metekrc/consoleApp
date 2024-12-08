let pool = { tokenA: 1000, tokenB: 1000, K: 1000000 }; 
let userBalance = { tokenA: 500, tokenB: 500 }; 

function addLiquidity(tokenA, tokenB) {
    // Validate inputs
    if (tokenA <= 0 || tokenB <= 0) {
        console.log("Invalid amount. Please deposit a positive value.");
        return;
    }

    // Check if user has enough balance
    if (userBalance.tokenA < tokenA || userBalance.tokenB < tokenB) {
        console.log("Insufficient balance to add liquidity.");
        return;
    }

    // Update pool reserves
    pool.tokenA += tokenA;
    pool.tokenB += tokenB;

    // Deduct from user's balance
    userBalance.tokenA -= tokenA;
    userBalance.tokenB -= tokenB;

    // Update K (constant product)
    pool.K = pool.tokenA * pool.tokenB;

    console.log(`Successfully added ${tokenA} Token A and ${tokenB} Token B to the pool.`);
    console.log("Updated Pool:", Pool);
    console.log("Updated User Balance:", userBalance);
}


// Example usage
addLiquidity(100, 160); // Call the corrected function
