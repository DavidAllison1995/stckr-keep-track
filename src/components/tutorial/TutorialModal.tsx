import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, Plus, Calendar, QrCode, Settings, Camera } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Your Asset Manager!",
    description: "Let's take a quick tour to show you how to manage your items and tasks efficiently.",
    icon: <Settings className="h-6 w-6" />
  },
  {
    title: "Add Your First Item",
    description: "Click the '+' button to add household items, appliances, or equipment. You can add photos, warranty info, and documents.",
    icon: <Plus className="h-6 w-6" />,
    highlight: "Click the + button in the navigation"
  },
  {
    title: "Take or Upload Photos",
    description: "Use your camera to capture item photos or upload existing images. Visual records help with insurance and organization.",
    icon: <Camera className="h-6 w-6" />
  },
  {
    title: "Create Maintenance Tasks",
    description: "Set up recurring maintenance schedules for your items. Never miss important maintenance again!",
    icon: <Calendar className="h-6 w-6" />,
    highlight: "Access via the Maintenance tab"
  },
  {
    title: "Generate QR Codes",
    description: "Create QR codes for your items to quickly access information, manuals, and maintenance history.",
    icon: <QrCode className="h-6 w-6" />,
    highlight: "Find QR options in item details"
  },
  {
    title: "Stay Organized",
    description: "Use categories, rooms, and search to keep everything organized. Track warranties, maintenance, and important documents all in one place.",
    icon: <Settings className="h-6 w-6" />
  }
];

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialModal = ({ open, onOpenChange }: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStepData.icon}
              <DialogTitle className="text-lg">{currentStepData.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription className="text-base leading-relaxed">
            {currentStepData.description}
          </DialogDescription>

          {currentStepData.highlight && (
            <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-sm font-medium text-primary">
                💡 {currentStepData.highlight}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} className="flex items-center gap-2">
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < tutorialSteps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;