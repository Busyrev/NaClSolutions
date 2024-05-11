import { getECbyRho } from "./getECbyRho";
import { getDencityByRho } from "./getDencityByRho";
import { getRhoByEC } from "./getRhoByEC";
import { bruteForceMonotonic } from "./bruteForceMonotonic";
import { getRhoByDencitySaltAndWaterGrams } from "./getRhoByDencitySaltAndWaterGrams";
import { getSaltGramsByRho } from "./getSaltGramsByRho";

export class Solution09CalculationResult {
    public rho: number;
    public targetEC: number;
    public realEC: number;
    public ECError: number;
    public ECAccuracy: number;
    public solution09Grams: number;
    public waterGrams: number;
    public minEC: number;
    public maxEC: number;
    public score: number;
    public volume: number;
}

export function calculateSolution09MassesByEC(EC: number, minWaterGrams: number, maxWatergrams: number, waterStep: number, solution09step: number): Solution09CalculationResult {
    let rho = getRhoByEC(EC);
    let solution09Rho = 9;
    let dencity = getDencityByRho(rho);
    let bestCandidate: Solution09CalculationResult = {
        rho: 0,
        targetEC: EC,
        realEC: 0,
        ECError: Number.POSITIVE_INFINITY,
        ECAccuracy: Number.POSITIVE_INFINITY,
        solution09Grams: 0,
        waterGrams: 0,
        minEC: 0,
        maxEC: 0,
        score: Number.POSITIVE_INFINITY,
        volume: 0
    };
    for (let waterGrams = minWaterGrams; waterGrams <= maxWatergrams; waterGrams += waterStep) {
        waterGrams = Math.round(waterGrams / waterStep) * waterStep;
        let calculatedSolution09grams = bruteForceMonotonic((solution09grams: number) => {
            let saltInSolution09Grams = getSaltGramsByRho(solution09grams, solution09Rho);
            let waterInSolution09Grams = solution09grams - saltInSolution09Grams;
            let realRho = getRhoByDencitySaltAndWaterGrams(dencity, saltInSolution09Grams, waterGrams + waterInSolution09Grams);
            return realRho;
        }, rho, solution09step, 10000, 0.000001);
        let solution09GramsRounded = Math.round(calculatedSolution09grams / solution09step) * solution09step;
        let solution09GramsFrom = solution09GramsRounded - 2 * solution09step;
        let solution09GramsTo = solution09GramsRounded + 2 * solution09step;
        for (let solution09Grams = solution09GramsFrom; solution09Grams <= solution09GramsTo; solution09Grams += solution09step) {
            let solution09SaltGrams = getSaltGramsByRho(solution09Grams, solution09Rho);
            let solution09WaterGrams = solution09Grams - solution09SaltGrams;

            let realEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, solution09SaltGrams, waterGrams + solution09WaterGrams));

            let minSolution09grams = solution09Grams - solution09step / 2;
            let minSolution09SaltGrams = getSaltGramsByRho(minSolution09grams, solution09Rho);
            let minSolution09WaterGrams = minSolution09grams - minSolution09SaltGrams;

            let maxSolution09Grams = solution09Grams + solution09step / 2;
            let maxSolution09SaltGrams = getSaltGramsByRho(maxSolution09Grams, solution09Rho);
            let maxSolution09WaterGrams = maxSolution09Grams - maxSolution09SaltGrams;

            let minWater = waterGrams - waterStep / 2;
            let maxWater = waterGrams + waterStep / 2;
            let minEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, minSolution09SaltGrams, maxWater + minSolution09WaterGrams));
            let maxEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, maxSolution09SaltGrams, minWater + maxSolution09WaterGrams));
            let ECError = Math.abs(EC - realEC);
            let ECAccuracy = maxEC - minEC;
            let score = ECError + ECAccuracy / 2;
            if (ECAccuracy < 0) {
                debugger;
            }
            if (score < bestCandidate.score) {
                bestCandidate = {
                    rho,
                    targetEC: EC,
                    realEC,
                    ECError,
                    ECAccuracy,
                    solution09Grams,
                    waterGrams,
                    minEC,
                    maxEC,
                    score,
                    volume: ((solution09SaltGrams + waterGrams + solution09WaterGrams) / dencity) * 1000
                };
            }
        }
        // console.log('waterGrams:', waterGrams, 'saltGrams:', saltGrams, 'rhoError:', rhoError);
    }
    return bestCandidate;
}
