/**
 * Converts legacy Greek-font keystrokes (Mounce/bwgrkl-style) to Unicode Greek.
 *
 * Letters:  a=α b=β g=γ d=δ e=ε z=ζ h=η q=θ i=ι k=κ l=λ m=μ n=ν x=ξ
 *           o=ο p=π r=ρ s=σ t=τ u=υ f=φ c=χ y=ψ w=ω   V=ς (final sigma)
 * Diacritics are typed AFTER the vowel they sit on:
 *           v=acute  `=grave  '=circumflex  j=smooth  J=rough  |=iota subscript
 * Beta-code equivalents also accepted: / acute, \ grave, = circumflex,
 *           ) smooth, ( rough
 * A plain s at the end of a word is converted to ς automatically.
 */

const LOWER: Record<string, string> = {
  a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ',
  i: 'ι', k: 'κ', l: 'λ', m: 'μ', n: 'ν', x: 'ξ', o: 'ο', p: 'π',
  r: 'ρ', s: 'σ', t: 'τ', u: 'υ', f: 'φ', c: 'χ', y: 'ψ', w: 'ω',
};

const UPPER: Record<string, string> = {
  A: 'Α', B: 'Β', G: 'Γ', D: 'Δ', E: 'Ε', Z: 'Ζ', H: 'Η', Q: 'Θ',
  I: 'Ι', K: 'Κ', L: 'Λ', M: 'Μ', N: 'Ν', X: 'Ξ', O: 'Ο', P: 'Π',
  R: 'Ρ', S: 'Σ', T: 'Τ', U: 'Υ', F: 'Φ', C: 'Χ', Y: 'Ψ', W: 'Ω',
};

// Combining marks, applied to the preceding Greek letter
const DIACRITICS: Record<string, string> = {
  v: '́', // acute
  '/': '́',
  '`': '̀', // grave
  '\\': '̀',
  "'": '͂', // circumflex (perispomeni)
  '=': '͂',
  j: '̓', // smooth breathing
  ')': '̓',
  J: '̔', // rough breathing
  '(': '̔',
  '|': 'ͅ', // iota subscript
};

const GREEK_LETTER = /[Α-ωἀ-῿]/;
const GREEK_VOWEL_OR_RHO = /[αεηιουωΑΕΗΙΟΥΩρΡ]/;

const COMBINING = /[̀-ͅ]/;

/** True if the string ends with a letter (skipping combining marks) that can carry a diacritic. */
function canCarryDiacritic(out: string): boolean {
  const chars = [...out];
  let i = chars.length - 1;
  while (i >= 0 && COMBINING.test(chars[i])) i--;
  if (i < 0) return false;
  return GREEK_VOWEL_OR_RHO.test(chars[i].normalize('NFD')[0] ?? '');
}

export function convertGreekTyping(input: string): string {
  let out = '';
  for (const ch of input) {
    if (DIACRITICS[ch] !== undefined && canCarryDiacritic(out)) {
      out += DIACRITICS[ch];
      continue;
    }
    if (ch === 'V') {
      out += 'ς';
      continue;
    }
    if (LOWER[ch] !== undefined) {
      out += LOWER[ch];
      continue;
    }
    if (UPPER[ch] !== undefined) {
      out += UPPER[ch];
      continue;
    }
    out += ch;
  }
  // Final-sigma pass: σ at a word boundary becomes ς
  out = out.normalize('NFC').replace(/σ(?![̀-ͅ]*[Α-ωἀ-῿])/gu, 'ς');
  return out;
}

/** Lowercases and strips accents/breathings for accent-insensitive matching. */
export function normalizeGreek(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͅ]/g, '')
    .toLowerCase()
    .replace(/ς/g, 'σ')
    .normalize('NFC');
}
