import { getECbyRho } from "./getECbyRho";
import { getDencityByRho } from "./getDencityByRho";
import { getRhoByEC } from "./getRhoByEC";
import { bruteForceMonotonic } from "./bruteForceMonotonic";
import { getRhoByDencitySaltAndWaterGrams } from "./getRhoByDencitySaltAndWaterGrams";

export class SolutionCalculationResult {
    public rho: number;
    public targetEC: number;
    public realEC: number;
    public ECError: number;
    public ECAccuracy: number;
    public saltGrams: number;
    public waterGrams: number;
    public minEC: number;
    public maxEC: number;
    public score: number;
    public volume: number;
}

export function calculateSolutionMassesByEC(EC: number, minWaterGrams: number, maxWatergrams: number, waterStep: number, saltStep: number): SolutionCalculationResult {
    let rho = getRhoByEC(EC);
    let dencity = getDencityByRho(rho);
    let bestCandidate: SolutionCalculationResult = {
        rho: 0,
        targetEC: EC,
        realEC: 0,
        ECError: Number.POSITIVE_INFINITY,
        ECAccuracy: Number.POSITIVE_INFINITY,
        saltGrams: 0,
        waterGrams: 0,
        minEC: 0,
        maxEC: 0,
        score: Number.POSITIVE_INFINITY,
        volume: 0
    };
    for (let waterGrams = minWaterGrams; waterGrams <= maxWatergrams; waterGrams += waterStep) {
        waterGrams = Math.round(waterGrams / waterStep) * waterStep;
        let calculatedSaltGrams = bruteForceMonotonic((saltGrams: number) => {
            let realRho = getRhoByDencitySaltAndWaterGrams(dencity, saltGrams, waterGrams);
            return realRho;
        }, rho, saltStep, 1000, 0.000001);
        let saltGramsRounded = Math.round(calculatedSaltGrams / saltStep) * saltStep;
        let saltFrom = saltGramsRounded - 2 * saltStep;
        let saltTo = saltGramsRounded + 2 * saltStep;
        for (let saltGrams = saltFrom; saltGrams <= saltTo; saltGrams += saltStep) {
            let realEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, saltGrams, waterGrams));
            let minSalt = saltGrams - saltStep / 2;
            let maxSalt = saltGrams + saltStep / 2;
            let minWater = waterGrams - waterStep / 2;
            let maxWater = waterGrams + waterStep / 2;
            let minEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, minSalt, maxWater));
            let maxEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, maxSalt, minWater));
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
                    saltGrams,
                    waterGrams,
                    minEC,
                    maxEC,
                    score,
                    volume: ((saltGrams + waterGrams) / dencity) * 1000
                };
            }
        }
        // console.log('waterGrams:', waterGrams, 'saltGrams:', saltGrams, 'rhoError:', rhoError);
    }
    return bestCandidate;
}
