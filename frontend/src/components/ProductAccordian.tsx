import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

const staticSections: AccordionItem[] = [
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

interface ProductAccordionProps {
  description: string;
}


export default function ProductAccordion({ description }: ProductAccordionProps) {
  
  const dynamicDescriptionSection: AccordionItem = {
    id: "description",
    title: "Description",
    content: description,
  };
  
  const finalAccordionSections = [
    dynamicDescriptionSection, 
    ...staticSections
  ];
  
  const [openId, setOpenId] = useState<string | null>("description"); 

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mt-8">
      {finalAccordionSections.map((section) => (
        <div key={section.id} className="mb-4">
          {/* Header with border */}
          <button
            className="w-full flex justify-between items-center text-left text-[19px] text-[#121212] border-b pb-2" // Removed mb-17, likely a typo/excessive margin
            onClick={() => toggle(section.id)}
          >
            {section.title}
            {openId === section.id ? (
              <Minus size={12} className="text-gray-600" />
            ) : (
              <Plus size={12} className="text-gray-600" />
            )}
          </button>

          {/* Content */}
          {openId === section.id && (
            <div className="pt-4 pb-2 text-[12px] text-gray-700 leading-relaxed transition-all duration-300 ease-in-out">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}