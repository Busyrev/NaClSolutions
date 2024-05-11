/**
 * https://t.me/ponics_doc/47 "Conductance Data For Commonly Used Chemicals, December 2010" - источник формулы, стр. 24, коэффициенты стр. 26
 * @param rho грам соли на литр раствора
 * @returns EC, мСм/см, миллисименс на сантиметр
 */
export function getECbyRho(rho: number): number {
    let EW = 58.44;
    let A0 = 126.5;
    let a = 0.7;
    let b = 0.74;
    let C = rho / EW;
    let EC = A0 * (1 - a * Math.sqrt(C) + b * (C)) * (C);
    return EC;
}