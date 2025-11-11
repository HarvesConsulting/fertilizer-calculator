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
    { key: "Томат", name: { uk: "Томат", en: "Tomato", es: "Tomate", pt: "Tomate", fr: "Tomate", kk: "Қызанақ", sw: "Nyanya" } },
    { key: "Перець", name: { uk: "Перець", en: "Pepper", es: "Pimiento", pt: "Pimentão", fr: "Poivron", kk: "Бұрыш", sw: "Pilipili" } },
    { key: "Баклажан", name: { uk: "Баклажан", en: "Eggplant", es: "Berenjena", pt: "Beringela", fr: "Aubergine", kk: "Баклажан", sw: "Biringani" } },
    { key: "Цибуля ріпчаста", name: { uk: "Цибуля ріпчаста", en: "Onion", es: "Cebolla", pt: "Cebola", fr: "Oignon", kk: "Пияз", sw: "Kitunguu" } },
    { key: "Огірок", name: { uk: "Огірок", en: "Cucumber", es: "Pepino", pt: "Pepino", fr: "Concombre", kk: "Қияр", sw: "Tango" } },
    { key: "Кабачок", name: { uk: "Кабачок", en: "Zucchini", es: "Calabacín", pt: "Abobrinha", fr: "Courgette", kk: "Кабачок", sw: "Boga" } },
    { key: "Кавун", name: { uk: "Кавун", en: "Watermelon", es: "Sandía", pt: "Melancia", fr: "Pastèque", kk: "Қарбыз", sw: "Tikiti maji" } },
    { key: "Диня", name: { uk: "Диня", en: "Melon", es: "Melón", pt: "Melão", fr: "Melon", kk: "Қауын", sw: "Tikiti" } },
    { key: "Гарбуз", name: { uk: "Гарбуз", en: "Pumpkin", es: "Calabaza", pt: "Abóbora", fr: "Citrouille", kk: "Асқабақ", sw: "Boga" } },
    { key: "Капуста білоголова", name: { uk: "Капуста білоголова", en: "White Cabbage", es: "Repollo Blanco", pt: "Repolho Branco", fr: "Chou Blanc", kk: "Ақ қауданды қырыққабат", sw: "Kabeji Nyeupe" } },
    { key: "Капуста цвітна", name: { uk: "Капуста цвітна", en: "Cauliflower", es: "Coliflor", pt: "Couve-flor", fr: "Chou-fleur", kk: "Гүлді қырыққабат", sw: "Koliflawa" } },
    { key: "Капуста броколі", name: { uk: "Капуста броколі", en: "Broccoli", es: "Brócoli", pt: "Brócolis", fr: "Brocoli", kk: "Брокколи", sw: "Brokoli" } },
    { key: "Капуста кольрабі", name: { uk: "Капуста кольрабі", en: "Kohlrabi", es: "Colinabo", pt: "Couve-rábano", fr: "Chou-rave", kk: "Кольраби", sw: "Kolirabi" } },
    { key: "Капуста брюссельська", name: { uk: "Капуста брюссельська", en: "Brussels Sprouts", es: "Coles de Bruselas", pt: "Couve de Bruxelas", fr: "Choux de Bruxelles", kk: "Брюссель қырыққабаты", sw: "Chipukizi za Brussels" } },
    { key: "Капуста кале(кейл)", name: { uk: "Капуста кале(кейл)", en: "Kale", es: "Col rizada", pt: "Couve", fr: "Chou frisé", kk: "Кейл", sw: "Kale" } },
    { key: "Кукурудза солодка", name: { uk: "Кукурудза солодка", en: "Sweet Corn", es: "Maíz Dulce", pt: "Milho Doce", fr: "Maïs Doux", kk: "Тәтті жүгері", sw: "Mahindi Matamu" } },
    { key: "Часник", name: { uk: "Часник", en: "Garlic", es: "Ajo", pt: "Alho", fr: "Ail", kk: "Сарымсақ", sw: "Kitunguu saumu" } },
    { key: "Морква", name: { uk: "Морква", en: "Carrot", es: "Zanahoria", pt: "Cenoura", fr: "Carotte", kk: "Сәбіз", sw: "Karoti" } },
    { key: "Буряк столовий", name: { uk: "Буряк столовий", en: "Beetroot", es: "Remolacha", pt: "Beterraba", fr: "Betterave", kk: "Қызылша", sw: "Beetroot" } },
    { key: "Картопля", name: { uk: "Картопля", en: "Potato", es: "Patata", pt: "Batata", fr: "Pomme de terre", kk: "Картоп", sw: "Kiazi" } },
    { key: "Салат Айсберг", name: { uk: "Салат Айсберг", en: "Iceberg Lettuce", es: "Lechuga Iceberg", pt: "Alface Iceberg", fr: "Laitue Iceberg", kk: "Айсберг салаты", sw: "Saladi ya Iceberg" } },
    { key: "Салат Ромен", name: { uk: "Салат Ромен", en: "Romaine Lettuce", es: "Lechuga Romana", pt: "Alface Romana", fr: "Laitue Romaine", kk: "Ромен салаты", sw: "Saladi ya Romaine" } },
    { key: "Селера коренева", name: { uk: "Селера коренева", en: "Celeriac", es: "Apionabo", pt: "Aipo-rábano", fr: "Céleri-rave", kk: "Тамыржемісті балдыркөк", sw: "Celery ya Mizizi" } },
    { key: "Цибуля порей", name: { uk: "Цибуля порей", en: "Leek", es: "Puerro", pt: "Alho-poró", fr: "Poireau", kk: "Порей пиязы", sw: "Giligilani" } }
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
    { value: 'дефекат', label: { uk: 'Дефекат', en: 'Defecate', es: 'Defecado', pt: 'Defecado', fr: 'Défécat', kk: 'Дефекат', sw: 'Takataka' } },
    { value: 'вапно', label: { uk: 'Вапно', en: 'Lime', es: 'Cal', pt: 'Cal', fr: 'Chaux', kk: 'Әк', sw: 'Chokaa' } },
    { value: 'доломітове борошно', label: { uk: 'Доломітове борошно', en: 'Dolomite flour', es: 'Harina de dolomita', pt: 'Farinha de dolomita', fr: 'Farine de dolomie', kk: 'Доломит ұны', sw: 'Unga wa Dolomite' } },
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
        { label: { uk: 'Суперфосфат', en: 'Superphosphate', es: 'Superfosfato', pt: 'Superfosfato', fr: 'Superphosphate', kk: 'Суперфосфат', sw: 'Superfosfati' }, value: 19 },
        { label: { uk: 'Подвійний суперфосфат', en: 'Double superphosphate', es: 'Superfosfato doble', pt: 'Superfosfato duplo', fr: 'Superphosphate double', kk: 'Қос суперфосфат', sw: 'Superfosfati maradufu' }, value: 46 },
        { label: { uk: 'Амофос', en: 'Ammonium phosphate', es: 'Fosfato de amonio', pt: 'Fosfato de amônio', fr: 'Phosphate d\'ammonium', kk: 'Аммофос', sw: 'Fosfati ya Amonia' }, value: 52 },
    ],
    'K2O': [
        { label: { uk: 'Калій хлористий', en: 'Potassium chloride', es: 'Cloruro de potasio', pt: 'Cloreto de potássio', fr: 'Chlorure de potassium', kk: 'Калий хлориді', sw: 'Kloridi ya Potasiamu' }, value: 60 },
        { label: { uk: 'Сульфат калію', en: 'Potassium sulfate', es: 'Sulfato de potasio', pt: 'Sulfato de potássio', fr: 'Sulfate de potassium', kk: 'Калий сульфаты', sw: 'Sulfate ya Potasiamu' }, value: 52 },
    ],
    'CaO': [
        { label: { uk: 'Нітрат кальцію', en: 'Calcium nitrate', es: 'Nitrato de calcio', pt: 'Nitrato de cálcio', fr: 'Nitrate de calcium', kk: 'Кальций нитраты', sw: 'Nitrati ya Kalisi' }, value: 26 },
        { label: { uk: 'Сульфат кальцію (гіпс)', en: 'Calcium sulfate (gypsum)', es: 'Sulfato de calcio (yeso)', pt: 'Sulfato de cálcio (gesso)', fr: 'Sulfate de calcium (gypse)', kk: 'Кальций сульфаты (гипс)', sw: 'Sulfate ya Kalisi (jasi)' }, value: 35 },
    ],
    'MgO': [
        { label: { uk: 'Сульфат магнію', en: 'Magnesium sulfate', es: 'Sulfato de magnesio', pt: 'Sulfato de magnésio', fr: 'Sulfate de magnésium', kk: 'Магний сульфаты', sw: 'Sulfate ya Magnesiamu' }, value: 16 },
    ],
};
