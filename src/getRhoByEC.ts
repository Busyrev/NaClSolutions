import { getECbyRho } from "./getECbyRho";
import { bruteForceMonotonic } from "./bruteForceMonotonic";

/**
 * 
 * @param targetEC мСм/см, миллисименс на сантиметр
 * @returns Rho, грам соли на литр раствора
 */
export function getRhoByEC(targetEC: number): number {
    let rho = bruteForceMonotonic(getECbyRho, targetEC, 0, 350, 0.000001);
    return rho;
}
