import Icon from "./Icon";
import { site } from "@/lib/site";

export default function WhatsAppButton() {
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Μίλα μαζί μας στο WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1FA855] text-white shadow-lg transition-transform hover:scale-105"
    >
      <Icon name="whatsapp" className="h-7 w-7" />
    </a>
  );
}
