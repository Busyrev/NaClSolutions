import { getDencityByRho } from "../src/getDencityByRho";
import { getECbyRho } from "../src/getECbyRho";
import { getRhoByEC } from "../src/getRhoByEC";
import { getRhoByDencitySaltAndWaterGrams } from "../src/getRhoByDencitySaltAndWaterGrams";

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

test("Accuracy", ()=> {
    let rho = getRhoByEC(1.413);
    let dencity = getDencityByRho(rho);
    let lowEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, 0.495, 713.5));
    let highEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, 0.505, 712.5));
    console.log(lowEC, highEC);

});
