function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function allSameDigit(value: string): boolean {
  return value.split("").every((char) => char === value[0]);
}

function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((acc, weight, index) => acc + weight * Number(digits[index]), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function validarCPF(input: string): boolean {
  const cpf = onlyDigits(input);
  if (cpf.length !== 11 || allSameDigit(cpf)) return false;

  const d1 = checkDigit(cpf, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (d1 !== Number(cpf[9])) return false;

  const d2 = checkDigit(cpf, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d2 === Number(cpf[10]);
}

export function validarCNPJ(input: string): boolean {
  const cnpj = onlyDigits(input);
  if (cnpj.length !== 14 || allSameDigit(cnpj)) return false;

  const d1 = checkDigit(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (d1 !== Number(cnpj[12])) return false;

  const d2 = checkDigit(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d2 === Number(cnpj[13]);
}

export function formatarCPF(input: string): string {
  const cpf = onlyDigits(input).slice(0, 11);
  return cpf.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_match, a, b, c, d) =>
    [a, b, c].filter(Boolean).join(".") + (d ? `-${d}` : ""),
  );
}

export function formatarCNPJ(input: string): string {
  const cnpj = onlyDigits(input).slice(0, 14);
  return cnpj.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_match, a, b, c, d, e) =>
    [a, b, c].filter(Boolean).join(".") + (d ? `/${d}` : "") + (e ? `-${e}` : ""),
  );
}
