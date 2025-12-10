'use client';

import * as React from 'react';
import { format, addHours, addDays, addWeeks } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { IEmailListItem } from '@/types/api.types';

export interface SnoozeDialogProps {
  open: boolean;
  email: IEmailListItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (snoozeUntil: string) => void;
}

const SNOOZE_OPTIONS = [
  { label: '1 hour', value: '1h', getDate: () => addHours(new Date(), 1) },
  { label: '3 hours', value: '3h', getDate: () => addHours(new Date(), 3) },
  { label: 'Tomorrow', value: '1d', getDate: () => addDays(new Date(), 1) },
  { label: 'Next week', value: '1w', getDate: () => addWeeks(new Date(), 1) },
];

export function SnoozeDialog({
  open,
  email,
  onOpenChange,
  onConfirm,
}: SnoozeDialogProps) {
  //Init state hook
  const [selectedOption, setSelectedOption] = React.useState<string>('1h');

  //Init event handle
  const handleConfirm = () => {
    const option = SNOOZE_OPTIONS.find((opt) => opt.value === selectedOption);
    if (option) {
      const snoozeUntil = option.getDate().toISOString();
      onConfirm(snoozeUntil);
      onOpenChange(false);
    }
  };

  //Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Snooze Email</DialogTitle>
          <DialogDescription>
            Choose when to bring this email back to your inbox.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {SNOOZE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option.label} ({format(option.getDate(), 'MMM d, h:mm a')})
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Snooze</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
