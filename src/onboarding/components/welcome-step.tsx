import { ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepProps } from "../types";

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center gap-6 animate-in fade-in duration-300">
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
        <Shield className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome to your Ruma</h1>
        <p className="text-muted-foreground">
          The crypto wallet made for humans. Simple, easy and secure.
        </p>
      </div>
      <Button size="lg" className="w-full" onClick={() => onNext("choice")}>
        Get Started
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
