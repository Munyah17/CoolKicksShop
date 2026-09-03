import { whatsappLink } from "@/lib/config";
import { getSiteSettings } from "@/lib/catalogue/queries";
import { WhatsAppIcon } from "@/components/ui/icons";

// Hidden entirely if no WhatsApp number is configured -- same rule the
// /contact page's WhatsApp row already follows.
export async function FloatingWhatsAppButton() {
  const settings = await getSiteSettings();
  const whatsappNumber = settings?.whatsapp_number;
  if (!whatsappNumber) return null;

  return (
    <a
      href={whatsappLink(undefined, whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#20bd5a]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
