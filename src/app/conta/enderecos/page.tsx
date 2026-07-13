import { AddressManager } from "@/components/account/address-manager";
import { getAddresses } from "@/lib/account";

export default async function EnderecosPage() {
  const addresses = await getAddresses();
  return <AddressManager addresses={addresses} />;
}
