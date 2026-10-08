// Russian formatting helpers — design.md §3 "Russian typography rules"

const rubFmt = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const pluralRules = new Intl.PluralRules('ru');

/** 1290 → «1 290 ₽» (narrow nbsp for thousands, ₽ after) */
export const rub = (n) => rubFmt.format(Math.round(n));

/** Number with ru grouping and comma decimals: 4.9 → «4,9», 250000 → «250 000» */
export const num = (n) => numFmt.format(n);

/** plural(3, ['товар', 'товара', 'товаров']) → «3 товара» */
export function plural(n, [one, few, many], withNumber = true) {
  const form = { one, few, many, other: few }[pluralRules.select(n)] ?? many;
  return withNumber ? `${n} ${form}` : form;
}

export const WORDS = {
  items: ['товар', 'товара', 'товаров'],
  pcs: ['шт', 'шт', 'шт'],
  persons: ['персона', 'персоны', 'персон'],
};

/** Non-breaking spaces after short words and between numbers and units: {tg('Готовим в печи')} */
export function typograf(text) {
  return String(text)
    .replace(/(^|[\s«(„])([вксуоиаВКСУОИА]|на|от|до|по|за|из|не|ко|во|со|об|На|От|До|По|За|Из|Не)\s/g, '$1$2 ')
    .replace(/(\d)\s(г|мл|шт|мин|ч|₽|кг|л|%)(?=[\s.,;:)»]|$)/g, '$1 $2');
}

/** Wraps a name in «ёлочки», turning inner «» into „лапки“: Сет «На двоих» → «Сет „На двоих“» */
export const quote = (s) => `«${String(s).replace(/«([^»]*)»/g, '„$1“')}»`;

export const pcsWeight = (d) => [d.pcs && `${d.pcs} шт`, d.weight && `${d.weight} ${d.unit || 'г'}`].filter(Boolean).join(' · ');

export const tg = typograf;
