import { Truck, RotateCcw, Shield} from 'lucide-react';

interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const trustBadges: TrustBadge[] = [
  {
    icon: <Truck size={32} />,
    title: 'Free Shipping',
    description: 'On orders over £50'
  },
  {
    icon: <RotateCcw size={32} />,
    title: '30-Day Returns',
    description: 'Easy returns policy'
  },
  {
    icon: <Shield size={32} />,
    title: 'Authentic Silver',
    description: '925 Sterling Silver'
  },

];

export default function TrustBadges() {
  return (
    <div className="mt-8 space-y-2.5">
      {trustBadges.map((badge, index) => (
        <div
          key={index}
          className="flex items-start gap-2 p-2 border border-gray-200 rounded hover:border-gray-300 transition-colors"
        >
          <div className="text-gray-700 flex-shrink-0">
            {badge.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              {badge.title}
            </h3>
            <p className="text-sm text-gray-600">
              {badge.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}