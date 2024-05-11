import { getDencityByRho } from "../src/getDencityByRho";
import { getECbyRho } from "../src/getECbyRho";
import { getRhoByEC } from "../src/getRhoByEC";
import { getRhoByDencitySaltAndWaterGrams } from "../src/getRhoByDencitySaltAndWaterGrams";
import { bruteForceMonotonic } from "../src/bruteForceMonotonic";
import { pureWaterDencity } from "../src/pureWaterDencity";

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
    let originalSaltGrams = 9;
    let liters = 1;
    let rho = originalSaltGrams; // 0.9% 1 мл препарата содержит: натрия хлорид - 9 мг.
    let dencity = getDencityByRho(rho);
    let solutionMass = dencity * liters;
    let waterGrams = solutionMass - originalSaltGrams;
    let saltGrams = bruteForceMonotonic((saltGrams: number) => {
        let realRho = getRhoByDencitySaltAndWaterGrams(dencity, saltGrams, waterGrams);
        return realRho;
    }, rho, 0.0001, 1000, 1e-7);
    let EC = getECbyRho(rho);
    expect(saltGrams).toBeCloseTo(rho, 6);
    expect(EC).toBeCloseTo(16.3500511, 6);
});

