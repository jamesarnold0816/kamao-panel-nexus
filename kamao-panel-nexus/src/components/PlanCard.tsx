import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface PlanFeature {
  title: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  subtitle: string;
  price: string;
  period?: string;
  features: PlanFeature[];
  buttonText: string;
  buttonAction: () => void;
  popular?: boolean;
  disabled?: boolean;
}

const PlanCard = ({
  title,
  subtitle,
  price,
  period,
  features,
  buttonText,
  buttonAction,
  popular = false,
  disabled = false,
}: PlanCardProps) => {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-lg overflow-hidden border",
      popular ? "border-kamao-purple" : "border-gray-200"
    )}>
      {popular && (
        <div className="bg-kamao-purple text-white py-1 px-4 text-center font-medium">
          Most Popular
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-gray-600 mb-4">{subtitle}</p>
        <div className="mb-6">
          <span className="text-3xl font-bold">{price}</span>
          {period && (
            <span className="text-gray-500 ml-1 text-sm">per {period}</span>
          )}
        </div>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              ) : (
                <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
              )}
              <span className={cn(
                "text-sm",
                feature.included ? "text-gray-700" : "text-gray-500 line-through"
              )}>
                {feature.title}
              </span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={buttonAction} 
          className="w-full"
          variant={popular ? "default" : "outline"}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default PlanCard;
