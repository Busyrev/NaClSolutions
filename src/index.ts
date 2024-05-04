import fs from "fs";
import { getECbyRho } from "./getECbyRho";
import { getDencityByRho } from "./getDencityByRho";
import { Cfg } from "./Cfg";
import { getRhoByEC } from "./getRhoByEC";
import { bruteForceMonotonic, setEnsureMonotonicSteps } from "./bruteForceMonotonic";
import { getRhoByDencitySaltAndWaterGrams } from "./getRhoByDencitySaltAndWaterGrams";
import { MarkdownExporter } from "./MarkdownExporter";
let cfg: Cfg;
let saltSymbolsAfterPoint: number;
let waterSymbolsAfterPoint: number;
async function main() {
    console.log('Welcome to NaCl EC calibration Solution generator');
    cfg = eval(fs.readFileSync('cfg.js').toString());
    setEnsureMonotonicSteps(cfg.ensureMonotonicSteps);
    saltSymbolsAfterPoint = getSymbolsAfterPoint(cfg.saltScalesDivisionValue);
    waterSymbolsAfterPoint = getSymbolsAfterPoint(cfg.waterScalesDivisionValue);

    let markdown = fs.readFileSync('doc.md').toString();

    markdown = markdown.replaceAll(/js\:\s(.*?)\\js/gm, (match, p1) => {
        console.log('Evaling:', p1);
        let evalResult = eval(p1);
        return evalResult;
    })

    let html = await MarkdownExporter.export(markdown, true);
    fs.writeFileSync('tmp/NaClSolutions.html', html);
    let pdf = await MarkdownExporter.export(markdown, false);
    fs.writeFileSync('NaClSolutions.pdf', pdf);

}

function getTable(ECs: Array<number>, minWaterGrams: number, maxWatergrams: number, printingAccuracyShift: number = 0) {

    let str = '';
    let columns = ['EC', 'H2O(г)', 'NaCl(г)', 'Рассчетный EC', 'Диапазон EC', 'Диапазон EC%', '$\\rho$(г/л)', 'Отклонение EC', 'Объём раствора(мл)'];
    str += '| ' + columns.join(' | ') + '|\n';
    let dashes = columns.map(() => '---');
    str += '| ' + dashes.join(' | ') + '|\n';
    for (let EC of ECs) {
        let targetNumDigits = getSymbolsAfterPoint(EC);
        let res = calulateSolutionMassesByEC(EC, minWaterGrams, maxWatergrams, cfg.waterScalesDivisionValue, cfg.saltScalesDivisionValue);
        let ecAccuracyPercentage = (res.ECAccuracy / EC * 100).toFixed(printingAccuracyShift + 2) + '%';
        str += '| ' + [
            EC,
            res.waterGrams.toFixed(waterSymbolsAfterPoint),
            res.saltGrams.toFixed(saltSymbolsAfterPoint),
            res.realEC.toFixed(printingAccuracyShift + targetNumDigits + 2),
            res.minEC.toFixed(printingAccuracyShift + targetNumDigits) + ' - ' + res.maxEC.toFixed(printingAccuracyShift + targetNumDigits),
            ecAccuracyPercentage,
            res.rho.toFixed(printingAccuracyShift + targetNumDigits + 2),
            res.ECError.toExponential(printingAccuracyShift + 2),
            res.volume.toFixed(waterSymbolsAfterPoint + 2),
        ].join(' | ') + '|\n';
    }
    return str;
}

class SolutionCalculationResult {
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

function calulateSolutionMassesByEC(EC: number, minWaterGrams: number, maxWatergrams: number, waterStep: number, saltStep: number): SolutionCalculationResult {
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
    }
    for (let waterGrams = minWaterGrams; waterGrams <= maxWatergrams; waterGrams += waterStep) {
        waterGrams = Math.round(waterGrams / waterStep) * waterStep;
        let saltGrams = bruteForceMonotonic((saltGrams: number) => {
            let realRho = getRhoByDencitySaltAndWaterGrams(dencity, saltGrams, waterGrams);
            return realRho;
        }, rho, saltStep, 1000, 1e-6);
        let saltGramsRounded = Math.round(saltGrams / saltStep) * saltStep;
        let saltFrom = saltGramsRounded - 2 * saltStep;
        let saltTo = saltGramsRounded + 2 * saltStep;
        for (let saltGrams = saltFrom; saltGrams <= saltTo; saltGrams += saltStep) {
            let realEC = getECbyRho(getRhoByDencitySaltAndWaterGrams(dencity, saltGrams, waterGrams));
            let minSalt = saltGrams - saltStep / 2;
            let maxSalt = saltGrams + saltStep / 2;
            let minWater = waterGrams - waterStep / 2;
            let maxWater = waterGrams + waterStep / 2
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
                    volume: ((saltGrams+waterGrams)/dencity)*1000
                }
            }
        }
        // console.log('waterGrams:', waterGrams, 'saltGrams:', saltGrams, 'rhoError:', rhoError);

    }
    return bestCandidate;
}


function formatDate(date: Date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function getSymbolsAfterPoint(n: number): number {
    let parts = n.toString().split('.');
    if (parts.length < 2) {
        return 0;
    } else {
        return parts[1].length;
    }
}

function getArray(from: number, to: number) {
    let res = [];
    for (let i = from; i <= to; i++) {
        res.push(i);
    }
    return res;
}


main();


