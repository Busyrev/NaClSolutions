import { getECbyRho } from "./getECbyRho";
import { bruteForceMonotonic } from "./bruteForceMonotonic";

export function getRhoByEC(targetEC: number): number {
    let rho = bruteForceMonotonic(getECbyRho, targetEC, 0, 350, 0.000001);
    return rho;
}
