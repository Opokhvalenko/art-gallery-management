import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <Dialog open onClose={onClose} transition className="relative z-50">
      <div
        className="fixed inset-0 bg-black/40 duration-200 ease-out data-[closed]:opacity-0"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle as="h2" className="text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
