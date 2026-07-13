import { z } from "zod";
import { validarCNPJ, validarCPF } from "./documento";

const camposComuns = {
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(8, "Senha precisa ter ao menos 8 caracteres"),
  fullName: z.string().trim().min(2, "Informe seu nome completo"),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
};

export const signUpSchema = z.discriminatedUnion("personType", [
  z.object({
    ...camposComuns,
    personType: z.literal("pf"),
    cpf: z.string().refine(validarCPF, "CPF inválido"),
  }),
  z.object({
    ...camposComuns,
    personType: z.literal("pj"),
    cnpj: z.string().refine(validarCNPJ, "CNPJ inválido"),
    companyName: z.string().trim().min(2, "Informe a razão social"),
  }),
]);

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});
