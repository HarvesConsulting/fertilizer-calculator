import type { CultureParams } from './types';
import type { Language } from './i18n';

type LocalizedString = { [lang in Language]: string };

interface Culture {
    key: string;
    name: LocalizedString;
}
interface Amendment {
    value: string;
    label: LocalizedString;
}
interface SimpleFertilizer {
    label: LocalizedString;
    value: number;
}


export const CULTURES: Culture[] = [
    { key: "Томат", name: { uk: "Томат", en: "Tomato" } },
    { key: "Перець", name: { uk: "Перець", en: "Pepper" } },
    { key: "Баклажан", name: { uk: "Баклажан", en: "Eggplant" } },
    { key: "Цибуля ріпчаста", name: { uk: "Цибуля ріпчаста", en: "Onion" } },
    { key: "Огірок", name: { uk: "Огірок", en: "Cucumber" } },
    { key: "Кабачок", name: { uk: "Кабачок", en: "Zucchini" } },
    { key: "Кавун", name: { uk: "Кавун", en: "Watermelon" } },
    { key: "Диня", name: { uk: "Диня", en: "Melon" } },
    { key: "Гарбуз", name: { uk: "Гарбуз", en: "Pumpkin" } },
    { key: "Капуста білоголова", name: { uk: "Капуста білоголова", en: "White Cabbage" } },
    { key: "Капуста цвітна", name: { uk: "Капуста цвітна", en: "Cauliflower" } },
    { key: "Капуста броколі", name: { uk: "Капуста броколі", en: "Broccoli" } },
    { key: "Капуста кольрабі", name: { uk: "Капуста кольрабі", en: "Kohlrabi" } },
    { key: "Капуста брюссельська", name: { uk: "Капуста брюссельська", en: "Brussels Sprouts" } },
    { key: "Капуста кале(кейл)", name: { uk: "Капуста кале(кейл)", en: "Kale" } },
    { key: "Кукурудза солодка", name: { uk: "Кукурудза солодка", en: "Sweet Corn" } },
    { key: "Часник", name: { uk: "Часник", en: "Garlic" } },
    { key: "Морква", name: { uk: "Морква", en: "Carrot" } },
    { key: "Буряк столовий", name: { uk: "Буряк столовий", en: "Beetroot" } },
    { key: "Картопля", name: { uk: "Картопля", en: "Potato" } },
    { key: "Салат Айсберг", name: { uk: "Салат Айсберг", en: "Iceberg Lettuce" } },
    { key: "Салат Ромен", name: { uk: "Салат Ромен", en: "Romaine Lettuce" } },
    { key: "Селера коренева", name: { uk: "Селера коренева", en: "Celeriac" } },
    { key: "Цибуля порей", name: { uk: "Цибуля порей", en: "Leek" } }
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

export const AMENDMENTS: Amendment[] = [
    { value: 'дефекат', label: { uk: 'Дефекат', en: 'Defecate' } },
    { value: 'вапно', label: { uk: 'Вапно', en: 'Lime' } },
    { value: 'доломітове борошно', label: { uk: 'Доломітове борошно', en: 'Dolomite flour' } },
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

export const SIMPLE_FERTILIZERS: Record<string, SimpleFertilizer[]> = {
    'P2O5': [
        { label: { uk: 'Суперфосфат', en: 'Superphosphate' }, value: 19 },
        { label: { uk: 'Подвійний суперфосфат', en: 'Double superphosphate' }, value: 46 },
        { label: { uk: 'Амофос', en: 'Ammonium phosphate' }, value: 52 },
    ],
    'K2O': [
        { label: { uk: 'Калій хлористий', en: 'Potassium chloride' }, value: 60 },
        { label: { uk: 'Сульфат калію', en: 'Potassium sulfate' }, value: 52 },
    ],
    'CaO': [
        { label: { uk: 'Нітрат кальцію', en: 'Calcium nitrate' }, value: 26 },
        { label: { uk: 'Сульфат кальцію (гіпс)', en: 'Calcium sulfate (gypsum)' }, value: 35 },
    ],
    'MgO': [
        { label: { uk: 'Сульфат магнію', en: 'Magnesium sulfate' }, value: 16 },
    ],
};