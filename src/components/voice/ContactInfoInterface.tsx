import React, { useRef, useEffect, useState } from 'react';
import { Send, Mail, Linkedin, Loader2 } from 'lucide-react';
import { InterviewStep } from '../../config/interviewSteps';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Typography } from '../ui/Typography';

interface ContactInfoInterfaceProps {
  isVisible: boolean;
  emailValue: string;
  linkedinValue: string;
  onEmailChange: (email: string) => void;
  onLinkedInChange: (linkedin: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  currentStep?: InterviewStep | null;
}

export function ContactInfoInterface({ 
  isVisible, 
  emailValue,
  linkedinValue,
  onEmailChange, 
  onLinkedInChange,
  onSubmit, 
  onCancel,
  currentStep
}: ContactInfoInterfaceProps) {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState('');
  const [linkedinError, setLinkedinError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [linkedinValid, setLinkedinValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isVisible]);

  // Validate initial values
  useEffect(() => {
    if (emailValue) {
      handleEmailChange(emailValue);
    }
    if (linkedinValue) {
      handleLinkedInChange(linkedinValue);
    }
  }, []);

  if (!isVisible) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const validateLinkedIn = (linkedin: string): boolean => {
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+)\/?$/;
    const usernameRegex = /^[a-zA-Z0-9-]+$/; // Just username
    return linkedinRegex.test(linkedin.trim()) || usernameRegex.test(linkedin.trim());
  };

  const debouncedValidation = (value: string, validator: (val: string) => boolean, setError: (err: string) => void, setValid: (valid: boolean) => void, errorMessage: string) => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const timeout = setTimeout(() => {
      if (value.trim()) {
        const isValid = validator(value);
        setValid(isValid);
        setError(isValid ? '' : errorMessage);
      } else {
        setValid(false);
        setError('');
      }
    }, 300);

    setValidationTimeout(timeout);
  };

  const handleEmailChange = (value: string) => {
    onEmailChange(value);
    debouncedValidation(
      value,
      validateEmail,
      setEmailError,
      setEmailValid,
      'Please enter a valid email address'
    );
  };

  const handleLinkedInChange = (value: string) => {
    onLinkedInChange(value);
    debouncedValidation(
      value,
      validateLinkedIn,
      setLinkedinError,
      setLinkedinValid,
      'Please enter a valid LinkedIn profile URL or username'
    );
  };

  const handleSubmit = async () => {
    if (!emailValue.trim() || !linkedinValue.trim()) return;
    
    const emailIsValid = validateEmail(emailValue);
    const linkedinIsValid = validateLinkedIn(linkedinValue);
    
    if (emailIsValid && linkedinIsValid) {
      setIsSubmitting(true);
      try {
        await onSubmit();
      } catch (error) {
        console.error('Error submitting contact info:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!emailIsValid) setEmailError('Please enter a valid email address');
      if (!linkedinIsValid) setLinkedinError('Please enter a valid LinkedIn profile URL or username');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const canSubmit = emailValue.trim() && linkedinValue.trim() && emailValid && linkedinValid && !isSubmitting;
  const progress = (emailValid ? 50 : 0) + (linkedinValid ? 50 : 0);

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-2xl transition-all duration-700 ease-out transform animate-scale-in">
      
      <Card variant="glass" padding="lg" className="w-full">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Please provide your email and LinkedIn profile
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <ProgressBar
              value={progress}
              size="md"
              variant="primary"
              showLabel
              label="Progress"
              animated
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Field */}
          <Input
            ref={emailInputRef}
            type="email"
            label="Email Address"
            value={emailValue}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="your.email@example.com"
            leftIcon={<Mail className="w-5 h-5" />}
            error={emailError}
            isValid={emailValid}
            required
            disabled={isSubmitting}
            onKeyDown={handleKeyDown}
          />

          {/* LinkedIn Field */}
          <Input
            type="text"
            label="LinkedIn Profile"
            value={linkedinValue}
            onChange={(e) => handleLinkedInChange(e.target.value)}
            placeholder="linkedin.com/in/yourprofile or just your username"
            leftIcon={<Linkedin className="w-5 h-5" />}
            error={linkedinError}
            isValid={linkedinValid}
            required
            disabled={isSubmitting}
            onKeyDown={handleKeyDown}
            helperText="You can enter your full LinkedIn URL or just your username"
          />

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
            loadingText="Processing..."
            leftIcon={<Send className="w-5 h-5" />}
            size="lg"
            fullWidth
          >
            Continue
          </Button>

          {/* Cancel Button */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel (ESC)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}