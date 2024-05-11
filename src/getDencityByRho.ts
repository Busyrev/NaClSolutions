import { pureWaterDencity } from "./pureWaterDencity";
// 20°C
// https://russsam.ru/certificates/246-Tablitsa_plotnosti_rastvorov_khlorida_natriya
// "Краткий химический справочник" 1978, страница 277
let rhoToDencity: Array<[number, number]> = [
    [0, pureWaterDencity],
    [10.05, 1005],
    [20.25, 1012],
    [41.07, 1027],
    [62.47, 1041],
    [84.47, 1056],
    [107.1, 1071],
    [130.2, 1086],
    [154.1, 1101],
    [178.5, 1116],
    [203.7, 1132],
    [229.5, 1148],
    [256.0, 1164],
    [283.2, 1180],
    [311.2, 1197]
]

/**
 * 
 * @param rho 
 * @returns грамм раствора на литр раствора
 */
export function getDencityByRho(rho: number): number {
    let less: [number, number];
    let more: [number, number];
    for (let i = 0; i < rhoToDencity.length; i++) {
        if (rho < rhoToDencity[i][0]) {
            less = rhoToDencity[i - 1];
            more = rhoToDencity[i];
            break;
        }
    }
    let progress = (rho - less[0]) / (more[0] - less[0]);
    let result = (more[1] - less[1]) * progress + less[1];
    return result;
}