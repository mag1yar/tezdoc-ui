import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../dialog';
import { Button } from '../button';
import { Label } from '../label';
import { Input } from '../input';
import { useState, useEffect } from 'react';
import type { VariableAttributes } from './extensions/variable-extension';

interface VariableSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: VariableAttributes | null;
  onSave: (values: Partial<VariableAttributes>) => void;
}

export function VariableSettingsDialog({
  isOpen,
  onClose,
  initialValues,
  onSave,
}: VariableSettingsDialogProps) {
  const [fallback, setFallback] = useState('');
  const [format, setFormat] = useState('');

  useEffect(() => {
    if (isOpen && initialValues) {
      setFallback(initialValues.fallback || '');
      setFormat(initialValues.format || '');
    }
  }, [isOpen, initialValues]);

  const handleSave = () => {
    onSave({ fallback, format });
    onClose();
  };

  if (!initialValues) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Variable Settings: {initialValues.label}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fallback" className="text-right">
              Fallback
            </Label>
            <Input
              id="fallback"
              value={fallback}
              onChange={(e) => setFallback(e.target.value)}
              className="col-span-3"
              placeholder="Default value"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Input
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="col-span-3"
              placeholder={
                initialValues.type === 'date'
                  ? 'DD.MM.YYYY'
                  : initialValues.type === 'number'
                    ? '0,0.00'
                    : ''
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
