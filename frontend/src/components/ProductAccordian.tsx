import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

const accordionSections: AccordionItem[] = [
  {
    id: "description",
    title: "Description",
    content: "The Silver Napoleon Ring is a chunky ring with compass art work and engravings on the shoulders. It is made from 925 Sterling Silver and hallmarked by the Goldsmiths' Company Assay Office verifying its quality.The ring has a compass on the face with layered detailing and an oxidised finish which highlights the design. On the shoulders of the ring is the branding 'Serge DeNimes' and arrows that follow around the face, representing eternity.The Napoleon Ring is hollowed on the inside so can fit comfortable over knuckles. Wear this ring with classic shapes such as the Silver Envy Signet Ring and the Silver St Christopher Necklace.Every product comes in a recyclable pouch. Our pouches are made from 100% cotton with cotton drawstrings and are completely plastic free & recyclable. Silver products (excluding Rhodium plated styles) naturally age over time, so they also come with a cleaning cloth, which can be used to polish your product.",
  },
  {
    id: "sizing",
    title: "Sizing Guide",
    content: "Use this sizing guide to find your perfect fit. Measure your chest, waist, and hips and compare to our chart.",
  },
  {
    id: "delivery",
    title: "Delivery & Returns",
    content: "Free shipping on orders over $50. Easy returns within 30 days. Contact support for exchanges.",
  },
];

export default function ProductAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mt-8">
      {accordionSections.map((section) => (
        <div key={section.id} className="mb-4">
          {/* Header with border */}
          <button
            className="w-full flex justify-between items-center text-left text-[19px] text-[#121212] border-b pb-2 mb-17"
            onClick={() => toggle(section.id)}
          >
            {section.title}
            {openId === section.id ? (
              <Minus size={12} className="text-gray-600" />
            ) : (
              <Plus size={12} className="text-gray-600" />
            )}
          </button>

          {/* Content (no border, sits under header’s border) */}
          {openId === section.id && (
            <div className="mt-2 text-sm text-gray-600 leading-relaxed">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>

  );
}
