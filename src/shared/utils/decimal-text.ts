/** A number as a French text field holds it: `3,5`. */
export const toDecimalText = (value: number) => String(value).replace('.', ',')

/** Accepts the French decimal comma. Blank reads as 0 and garbage as NaN: the domain refuses both. */
export const fromDecimalText = (text: string) => Number(text.trim().replace(',', '.'))
