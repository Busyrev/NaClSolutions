let ensureMonotonicSteps: number;

export function setEnsureMonotonicSteps(v: number): void {
    ensureMonotonicSteps = v;
}

export function bruteForceMonotonic(f: (arg: number) => number, target: number, argMin: number, argMax: number, deltaToStop: number): number {
    if (ensureMonotonicSteps) {
        ensureMonotonic(f, argMin, argMax, (argMax - argMin) / ensureMonotonicSteps);
    }
    let minValue = f(argMin);
    let maxValue = f(argMax);
    let slope = (maxValue >= minValue);
    let counter = 0;;
    let delta = Number.POSITIVE_INFINITY;
    let argMid: number;
    while (delta > deltaToStop) {
        argMid = argMin + (argMax - argMin) / 2;
        let nowValue = f(argMid);
        if (slope) {
            if (nowValue < target) {
                minValue = nowValue;
                argMin = argMid;
            } else {
                maxValue = nowValue;
                argMax = argMid;
            }
        } else {
            if (nowValue < target) {
                maxValue = nowValue;
                argMax = argMid;
            } else {
                minValue = nowValue;
                argMin = argMid;
            }
        }
        delta = Math.abs(maxValue - minValue);
        counter++;
    }
    // console.log(counter, 'iterations');
    return argMid;
}

function ensureMonotonic(f: (arg: number) => number, argMin: number, argMax: number, step: number): void {
    let minValue = f(argMin);
    let maxValue = f(argMax);
    let slope = (maxValue >= minValue);
    let prevValue = minValue;
    for (let arg = argMin; arg <= argMax; arg += step) {
        let value = f(arg);
        let partSlope = (value >= prevValue);
        if (partSlope != slope) {
            throw new Error('Slope is not the same');
        }
        prevValue = value;
    }
}