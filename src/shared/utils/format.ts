/** Left-pads a non-negative integer to two digits, as clocks and date inputs show them. */
export const twoDigits = (n: number) => n.toString().padStart(2, '0')
