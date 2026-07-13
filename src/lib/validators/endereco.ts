import { z } from "zod";

export const enderecoSchema = z.object({
  label: z.string().trim().optional().transform((v) => (v ? v : undefined)),
  cep: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 8, "CEP inválido"),
  street: z.string().trim().min(2, "Informe o endereço"),
  number: z.string().trim().optional().transform((v) => (v ? v : undefined)),
  complement: z.string().trim().optional().transform((v) => (v ? v : undefined)),
  district: z.string().trim().optional().transform((v) => (v ? v : undefined)),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().trim().length(2, "UF inválida").toUpperCase(),
  isDefault: z.coerce.boolean().optional(),
});

export type EnderecoInput = z.infer<typeof enderecoSchema>;
