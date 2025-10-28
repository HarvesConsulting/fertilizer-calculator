import type { CultureParams } from './types';

export const CULTURES: string[] = [
    "Томат", "Перець", "Баклажан", "Цибуля ріпчаста", "Огірок", "Кабачок", 
    "Кавун", "Диня", "Гарбуз", "Капуста білоголова", "Капуста цвітна", 
    "Капуста броколі", "Капуста кольрабі", "Капуста брюссельська", 
    "Капуста кале(кейл)", "Кукурудза солодка", "Часник", "Морква", 
    "Буряк столовий", "Картопля", "Салат Айсберг", "Салат Ромен", 
    "Селера коренева", "Цибуля порей"
];

export const CULTURE_PARAMS: Record<string, CultureParams> = {
    "Томат": {
        nitrogenFactor: 1.6,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 100 },
            { min: 121, max: 200, value: 200 },
            { min: 60, max: 120, value: 300 },
            { min: 0, max: 59, value: 350 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Перець": {
        nitrogenFactor: 2.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 50 },
            { min: 201, max: 250, value: 100 },
            { min: 121, max: 200, value: 150 },
            { min: 60, max: 120, value: 200 },
            { min: 0, max: 59, value: 250 },
        ],
        calciumFactor: 1.3,
        magnesiumFactor: 0.25,
    },
    "Баклажан": {
        nitrogenFactor: 2.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Цибуля ріпчаста": {
        nitrogenFactor: 2.2,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Огірок": {
        nitrogenFactor: 1.5,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 40 },
            { min: 121, max: 200, value: 80 },
            { min: 60, max: 120, value: 100 },
            { min: 0, max: 59, value: 120 },
        ],
        calciumFactor: 0.65,
        magnesiumFactor: 0.16,
    },
     "Кабачок": {
        nitrogenFactor: 1.2,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.65,
        magnesiumFactor: 0.16,
    },
    "Кавун": {
        nitrogenFactor: 1.2,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.65,
        magnesiumFactor: 0.16,
    },
    "Диня": {
        nitrogenFactor: 1.2,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.65,
        magnesiumFactor: 0.16,
    },
    "Гарбуз": {
        nitrogenFactor: 1.2,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.65,
        magnesiumFactor: 0.16,
    },
    "Капуста білоголова": {
        nitrogenFactor: 1.75,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Капуста брюссельська": {
        nitrogenFactor: 6.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 75 },
            { min: 60, max: 120, value: 150 },
            { min: 0, max: 59, value: 200 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Капуста цвітна": {
        nitrogenFactor: 5.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Капуста броколі": {
        nitrogenFactor: 9.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Капуста кольрабі": {
        nitrogenFactor: 4.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Капуста кале(кейл)": {
        nitrogenFactor: 5.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Кукурудза солодка": {
        nitrogenFactor: 3.5,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Часник": {
        nitrogenFactor: 8.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Морква": {
        nitrogenFactor: 1.7,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 125 },
            { min: 0, max: 59, value: 150 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Буряк столовий": {
        nitrogenFactor: 1.5,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 40 },
            { min: 121, max: 200, value: 80 },
            { min: 60, max: 120, value: 100 },
            { min: 0, max: 59, value: 120 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Картопля": {
        nitrogenFactor: 3.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 100 },
            { min: 121, max: 200, value: 200 },
            { min: 60, max: 120, value: 250 },
            { min: 0, max: 59, value: 300 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Салат Айсберг": {
        nitrogenFactor: 5.0,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 50 },
            { min: 201, max: 250, value: 100 },
            { min: 121, max: 200, value: 150 },
            { min: 60, max: 120, value: 200 },
            { min: 0, max: 59, value: 250 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Салат Ромен": {
        nitrogenFactor: 5.5,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 50 },
            { min: 121, max: 200, value: 100 },
            { min: 60, max: 120, value: 150 },
            { min: 0, max: 59, value: 200 },
        ],
        calciumFactor: 0.9,
        magnesiumFactor: 0.4,
    },
    "Селера коренева": {
        nitrogenFactor: 1.5,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 100 },
            { min: 121, max: 200, value: 200 },
            { min: 60, max: 120, value: 250 },
            { min: 0, max: 59, value: 300 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
    "Цибуля порей": {
        nitrogenFactor: 2.2,
        potassiumRanges: [
            { min: 251, max: Infinity, value: 0 },
            { min: 201, max: 250, value: 100 },
            { min: 121, max: 200, value: 150 },
            { min: 60, max: 120, value: 200 },
            { min: 0, max: 59, value: 250 },
        ],
        calciumFactor: 0.75,
        magnesiumFactor: 0.25,
    },
};

export const AMENDMENTS = [
    { value: 'дефекат', label: 'Дефекат' },
    { value: 'вапно', label: 'Вапно' },
    { value: 'доломітове борошно', label: 'Доломітове борошно' },
];

export const AMENDMENT_EFFECTS = {
    'дефекат': { calcium: 500, magnesium: 100 },
    'вапно': { calcium: 600, magnesium: 50 },
    'доломітове борошно': { calcium: 300, magnesium: 200 },
};

export const FERTIGATION_CULTURES: Record<string, string> = {
    tomato: "Томат",
    pepper: "Перець",
    eggplant: "Баклажан",
    onion: "Цибуля ріпчаста",
    cucumber: "Огірок",
    squash: "Кабачок",
    watermelon: "Кавун",
    melon: "Диня",
    pumpkin: "Гарбуз",
    cabbage60: "Капуста білоголова",
    cabbage80: "Капуста білоголова", // Mapping both to one schedule
    cauliflower60: "Капуста цвітна",
    broccoli60: "Капуста броколі",
    kohlrabi: "Капуста кольрабі",
    carrot: "Морква",
    beets: "Буряк столовий",
    potato: "Картопля",
    potato70: "Картопля", // Mapping both to one schedule
    iceberg: "Салат Айсберг",
    romaine: "Салат Ромен",
    celery: "Селера коренева",
    leek: "Цибуля порей",
    Brussels: "Капуста брюссельська",
};

export const SIMPLE_FERTILIZERS: Record<string, { label: string; value: number }[]> = {
    'P2O5': [
        { label: 'Суперфосфат', value: 19 },
        { label: 'Подвійний суперфосфат', value: 46 },
        { label: 'Амофос', value: 52 },
    ],
    'K2O': [
        { label: 'Калій хлористий', value: 60 },
        { label: 'Сульфат калію', value: 52 },
    ],
    'CaO': [
        { label: 'Нітрат кальцію', value: 26 },
        { label: 'Сульфат кальцію (гіпс)', value: 35 },
    ],
    'MgO': [
        { label: 'Сульфат магнію', value: 16 },
    ],
};