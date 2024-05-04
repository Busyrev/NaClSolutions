
/*
rho is grams of salt per 1 liter of solution! Not per 1 liter of water!
 */
export function getECbyRho(rho: number): number {
    let EW = 58.44;
    let A0 = 126.5;
    let a = 0.7;
    let b = 0.74;
    let EC = A0 * (1 - a * Math.sqrt(rho / EW) + b * (rho / EW)) * (rho / EW);
    return EC;
}