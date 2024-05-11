import { getDencityByRho } from "../src/getDencityByRho";
import { getECbyRho } from "../src/getECbyRho";
import { getRhoByEC } from "../src/getRhoByEC";
import { getRhoByDencitySaltAndWaterGrams } from "../src/getRhoByDencitySaltAndWaterGrams";
import { bruteForceMonotonic } from "../src/bruteForceMonotonic";
import { pureWaterDencity } from "../src/pureWaterDencity";
import { getSaltGramsByRho } from "../src/getSaltGramsByRho";
import { Solution09CalculationResult, calculateSolution09MassesByEC } from "../src/calculateSolution09MassesByEC";

test("getDencityForRho", () => {
    expect(getDencityByRho(0.4904),).toBeCloseTo(998.5356178, 6);
    expect(getDencityByRho(7.032),).toBeCloseTo(1002.959171, 6);
    expect(getDencityByRho(51.808),).toBeCloseTo(1034.02486, 6);
});

test("getECForSolution", () => {
    expect(getECbyRho(0.4904),).toBeCloseTo(1, 2);
    expect(getECbyRho(7.032),).toBeCloseTo(12.88, 2);
    expect(getECbyRho(51.808),).toBeCloseTo(111.8, 2);
});

test("getECForSolution", () => {
    expect(getRhoByEC(1)).toBeCloseTo(0.4903750028, 6);
    expect(getRhoByEC(12.88),).toBeCloseTo(7.031514915, 6);
    expect(getRhoByEC(111.8)).toBeCloseTo(51.80772436, 6);
});

test("PharmacySolution", () => {
    let rho = 9; // 0.9% 1 мл препарата содержит: натрия хлорид - 9 мг.
    let liters = 10;
    let originalSaltGrams = rho * liters;
    let dencity = getDencityByRho(rho);
    let solutionMass = dencity * liters;
    let waterGrams = solutionMass - originalSaltGrams;
    let saltGrams = bruteForceMonotonic((saltGrams: number) => {
        let realRho = getRhoByDencitySaltAndWaterGrams(dencity, saltGrams, waterGrams);
        return realRho;
    }, rho, 0.0001, 1000, 1e-7 / liters);
    let EC = getECbyRho(rho);
    expect(saltGrams).toBeCloseTo(rho * liters, 6);
    expect(EC).toBeCloseTo(16.3500511, 6);
});

test("gramOfSaltIn09Solution", () => {
    let liters = 7;
    let rho = 9;
    let dencity = getDencityByRho(rho);
    let solutionMass = dencity * liters; // грамм
    expect(getSaltGramsByRho(solutionMass, rho)).toBeCloseTo(rho * liters, 6);
});

test("calculate09SolutionMassesByEC-1-413", ()=>{
    let res: Solution09CalculationResult = calculateSolution09MassesByEC(1.413, 960, 1000, 1, 0.01);
    console.log('qq');
});

test("calculate09SolutionMassesByEC-12-88", ()=>{
    let res: Solution09CalculationResult = calculateSolution09MassesByEC(12.88, 500, 1000, 1, 0.01);
});

