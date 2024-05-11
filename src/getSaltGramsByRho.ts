import { getDencityByRho } from "./getDencityByRho";

/**
 * 
 * @param solutionGrams 
 * @param rho Rho, грам соли на литр раствора
 * @returns grams of salt
 */
export function getSaltGramsByRho(solutionGrams: number, rho:number): number {
    let dencity = getDencityByRho(rho);
    let liters = solutionGrams / dencity;
    let saltGrams = rho * liters;
    return saltGrams;
}