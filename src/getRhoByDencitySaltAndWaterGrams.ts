/**
 * 
 * @param dencity грамм раствора на литр раствора
 * @param saltGrams грамм соли
 * @param waterGrams грамм воды
 * @returns Rho, грам соли на литр раствора
 */
export function getRhoByDencitySaltAndWaterGrams(dencity: number, saltGrams: number, waterGrams: number): number {
    let solutionGrams = saltGrams + waterGrams;
    let solutionMl = solutionGrams / dencity * 1000;
    let Rho = saltGrams / (solutionMl / 1000);
    return Rho;
}
