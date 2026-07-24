import { btnWine } from "@/components/store/button-styles";

export function PixInstructions({ qrCode, qrCodeBase64 }: { qrCode: string; qrCodeBase64?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {qrCodeBase64 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR code Pix" className="h-56 w-56 rounded-xl border border-ink/12" />
      ) : null}
      <textarea
        readOnly
        value={qrCode}
        className="w-full resize-none rounded-xl border border-ink/12 bg-white p-3 text-xs text-ink/70"
        rows={3}
        onFocus={(e) => e.currentTarget.select()}
      />
      <p className="text-xs text-ink/50">Assim que o Pix cair, seu pedido é confirmado automaticamente.</p>
    </div>
  );
}

export function BoletoInstructions({ ticketUrl }: { ticketUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <a href={ticketUrl} target="_blank" rel="noreferrer" className={btnWine}>
        Ver boleto
      </a>
      <p className="text-xs text-ink/50">A compensação pode levar até 3 dias úteis.</p>
    </div>
  );
}
