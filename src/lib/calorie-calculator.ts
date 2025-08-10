// src/lib/calorie-calculator.ts

export enum CalorieCalculationMethod {
    MET = 'MET',
    ACSM = 'ACSM',
    HeartRate = 'HeartRate',
}

type Gender = 'male' | 'female' | 'other';

interface CalorieCalculationParams {
    method: CalorieCalculationMethod;
    weight: number; // kg
    age: number; // years
    gender: Gender;
    duration: number; // hours
    speed: number; // km/h
    incline?: number; // percentage
    heartRate?: number; // bpm
}

// MET values based on speed (compendium of physical activities)
const getMetValue = (speedKph: number): number => {
    if (speedKph < 3.2) return 2.0; // Walking, slow
    if (speedKph < 4.8) return 3.0; // Walking, moderate
    if (speedKph < 5.6) return 3.5; // Walking, brisk
    if (speedKph < 6.4) return 5.0; // Walking, very brisk
    if (speedKph < 8.0) return 8.3; // Jogging
    if (speedKph < 9.7) return 9.8; // Running
    if (speedKph < 11.3) return 11.0; // Running
    if (speedKph < 12.9) return 11.8; // Running
    if (speedKph < 14.5) return 12.8; // Running
    if (speedKph < 16.1) return 14.5; // Running
    if (speedKph < 17.7) return 16.0; // Running
    return 19.0; // Running, > 17.7 km/h
};

/**
 * Calculates calories burned using the MET formula.
 * Formula: kcal = MET × 3.5 × weight(kg) × time(min) / 200
 */
const calculateMetCalories = (weight: number, durationHours: number, speedKph: number): number => {
    const met = getMetValue(speedKph);
    const durationMinutes = durationHours * 60;
    const calories = (met * 3.5 * weight * durationMinutes) / 200;
    return calories;
};

/**
 * Calculates calories burned using the ACSM formula for running.
 * Formula: VO2 = (0.2 * speed_mpm) + (0.9 * speed_mpm * incline_fraction) + 3.5
 * kcal/min = (VO2 * weight_kg / 1000) * 5
 */
const calculateAcsCalories = (weight: number, durationHours: number, speedKph: number, incline: number = 0): number => {
    if (speedKph < 4.8) { // ACSM walking formula is different, for simplicity we use MET for lower speeds
        return calculateMetCalories(weight, durationHours, speedKph);
    }
    const speedMpm = (speedKph * 1000) / 60; // convert km/h to m/min
    const inclineFraction = incline / 100;
    const vo2 = (0.2 * speedMpm) + (0.9 * speedMpm * inclineFraction) + 3.5;
    const kcalPerMin = (vo2 * weight / 1000) * 5;
    return kcalPerMin * (durationHours * 60);
};

/**
 * Calculates calories burned using heart rate (Keytel formula).
 * Men: C/min = (-55.0969 + 0.6309 * HR + 0.1988 * W + 0.2017 * A) / 4.184
 * Women: C/min = (-20.4022 + 0.4472 * HR - 0.1263 * W + 0.074 * A) / 4.184
 */
const calculateHeartRateCalories = (weight: number, age: number, gender: Gender, durationHours: number, heartRate: number): number => {
    let kcalPerMin;
    const W = weight;
    const A = age;
    const HR = heartRate;

    if (gender === 'male') {
        kcalPerMin = (-55.0969 + (0.6309 * HR) + (0.1988 * W) + (0.2017 * A)) / 4.184;
    } else { // female or other
        kcalPerMin = (-20.4022 + (0.4472 * HR) + (0.1263 * W) + (0.074 * A)) / 4.184;
    }

    if (kcalPerMin < 0) return 0; // Cannot have negative calories

    return kcalPerMin * (durationHours * 60);
};


/**
 * Main function to calculate calories based on the selected method.
 */
export const calculateCalories = (params: CalorieCalculationParams): number => {
    const { method, weight, age, gender, duration, speed, incline = 0, heartRate = 0 } = params;

    // Pause detection
    if (speed < 1.0) {
        return 0;
    }

    switch (method) {
        case CalorieCalculationMethod.MET:
            return calculateMetCalories(weight, duration, speed);
        case CalorieCalculationMethod.ACSM:
            return calculateAcsCalories(weight, duration, speed, incline);
        case CalorieCalculationMethod.HeartRate:
            if (!heartRate || heartRate <= 0) {
                // Fallback to MET if HR is not available
                return calculateMetCalories(weight, duration, speed);
            }
            return calculateHeartRateCalories(weight, age, gender, duration, heartRate);
        default:
            return calculateMetCalories(weight, duration, speed);
    }
};

/**
 * Moving average for smoothing data like incline.
 */
export class MovingAverage {
    private queue: number[];
    private size: number;
    private sum: number;

    constructor(size: number) {
        this.queue = [];
        this.size = size;
        this.sum = 0;
    }

    next(value: number): number {
        if (this.queue.length === this.size) {
            this.sum -= this.queue.shift()!;
        }
        this.queue.push(value);
        this.sum += value;
        return this.sum / this.queue.length;
    }
}
