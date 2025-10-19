import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';
import Button from './ui/Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttonText?: string;
  skipButtonText?: string;
  onSkip?: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, title, children, buttonText = "Got it", skipButtonText, onSkip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={onClose} className="w-full">{buttonText}</Button>
          {onSkip && skipButtonText && (
            <Button onClick={onSkip} variant="ghost" className="w-full">{skipButtonText}</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingModal;