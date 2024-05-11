import fs from "fs";
import { Cfg } from "./Cfg";
import { setEnsureMonotonicSteps } from "./bruteForceMonotonic";
import { MarkdownExporter } from "./MarkdownExporter";
import { SolutionCalculationResult, calculateSolutionMassesByEC } from "./calculateSolutionMassesByEC";
import { Solution09CalculationResult, calculateSolution09MassesByEC } from "./calculateSolution09MassesByEC";

let cfg: Cfg;

async function main() {
    console.log('Welcome to NaCl EC calibration Solution generator');
    cfg = eval(fs.readFileSync('cfg.js').toString());
    setEnsureMonotonicSteps(cfg.ensureMonotonicSteps);


    let markdown = fs.readFileSync('doc.md').toString();

    markdown = markdown.replaceAll(/js\:\s(.*?)\\js/gm, (match, p1) => {
        console.log('Evaling:', p1);
        let evalResult = eval(p1);
        return evalResult;
    })

    fs.writeFileSync('tmp/NaClSolutions.md', markdown);
    let html = await MarkdownExporter.export(markdown, true);
    fs.writeFileSync('tmp/NaClSolutions.html', html);
    let pdf = await MarkdownExporter.export(markdown, false);
    fs.writeFileSync('NaClSolutions.pdf', pdf);

    console.log("Done");
}

function getTable(ECs: Array<number>, minWaterGrams: number, maxWatergrams: number, printingAccuracyShift: number = 0) {
    let str = '';
    let columns = ['**EC**', '**H2O(г)**', '**NaCl(г)**', 'Рассчетный EC', 'Диапазон EC', 'Диапазон EC%', '$\\rho$(г/л)', 'Отклонение EC', 'Объём раствора(мл)'];
    str += '| ' + columns.join(' | ') + '|\n';
    let dashes = columns.map(() => '---');
    str += '| ' + dashes.join(' | ') + '|\n';
    let saltSymbolsAfterPoint = getSymbolsAfterPoint(cfg.saltScalesDivisionValue);
    let waterSymbolsAfterPoint = getSymbolsAfterPoint(cfg.waterScalesDivisionValue);
    for (let EC of ECs) {
        let targetNumDigits = getSymbolsAfterPoint(EC);
        let res: SolutionCalculationResult = calculateSolutionMassesByEC(EC, minWaterGrams, maxWatergrams, cfg.waterScalesDivisionValue, cfg.saltScalesDivisionValue);
        let ecAccuracyPercentage = (res.ECAccuracy / EC * 100).toFixed(printingAccuracyShift + 2) + '%';
        str += '| ' + [
            '**' + EC + '**',
            '**' + res.waterGrams.toFixed(waterSymbolsAfterPoint) + '**',
            '**' + res.saltGrams.toFixed(saltSymbolsAfterPoint) + '**',
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

function getTableSolution09(ECs: Array<number>, minWaterGrams: number, maxWatergrams: number, waterScalesDivisionValue: number = undefined, saltScalesDivisionValue: number = undefined, printingAccuracyShift: number = 0, skipHeading: boolean = false) {
    let str = '';
    if (!skipHeading) {
        let columns = ['**EC**', '**H2O(г)**', '**NaCl 0.9%(г)**', 'Рассчетный EC', 'Диапазон EC', 'Диапазон EC%', '$\\rho$(г/л)', 'Отклонение EC', 'Объём раствора(мл)'];
        str += '| ' + columns.join(' | ') + '|\n';
        let dashes = columns.map(() => '---');
        str += '| ' + dashes.join(' | ') + '|\n';
    }
    if (typeof waterScalesDivisionValue == "undefined") {
        waterScalesDivisionValue = cfg.waterScalesDivisionValue;
    }
    if (typeof saltScalesDivisionValue == "undefined") {
        saltScalesDivisionValue = cfg.saltScalesDivisionValue;
    }
    let saltSymbolsAfterPoint = getSymbolsAfterPoint(saltScalesDivisionValue);
    let waterSymbolsAfterPoint = getSymbolsAfterPoint(waterScalesDivisionValue);
    let strings: Array<string> = [];
    for (let EC of ECs) {
        let targetNumDigits = getSymbolsAfterPoint(EC);
        let res: Solution09CalculationResult = calculateSolution09MassesByEC(EC, minWaterGrams, maxWatergrams, waterScalesDivisionValue, saltScalesDivisionValue);
        let ecAccuracyPercentage = (res.ECAccuracy / EC * 100).toFixed(printingAccuracyShift + 2) + '%';
        strings.push('| ' + [
            '**' + EC + '**',
            '**' + res.waterGrams.toFixed(waterSymbolsAfterPoint) + '**',
            '**' + res.solution09Grams.toFixed(saltSymbolsAfterPoint) + '**',
            res.realEC.toFixed(printingAccuracyShift + targetNumDigits + 2),
            res.minEC.toFixed(printingAccuracyShift + targetNumDigits) + ' - ' + res.maxEC.toFixed(printingAccuracyShift + targetNumDigits),
            ecAccuracyPercentage,
            res.rho.toFixed(printingAccuracyShift + targetNumDigits + 2),
            res.ECError.toExponential(printingAccuracyShift + 2),
            res.volume.toFixed(waterSymbolsAfterPoint + 2),
        ].join(' | ') + '|');
    }
    str += strings.join('\n');
    return str;
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