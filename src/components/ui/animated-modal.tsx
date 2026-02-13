
"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Slot } from "@radix-ui/react-slot";


interface ModalContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export function Modal({ children, onOpenChange, open: controlledOpen }: { children: React.ReactNode, onOpenChange?: (open: boolean) => void, open?: boolean }) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  }

  return <ModalContext.Provider value={{ open, setOpen }}>{children}</ModalContext.Provider>;
}

export const ModalTrigger = ({
  children,
  className,
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) => {
  const { setOpen } = useModal();
  const Comp = asChild ? Slot : "button";
  
  return (
    <Comp
      className={cn(
        "px-4 py-2 rounded-md text-black dark:text-white text-center relative overflow-hidden",
        className
      )}
      onClick={() => setOpen(true)}
    >
      {children}
    </Comp>
  );
};

export const ModalBody = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as Node;
    
    // Improved check for Radix UI portaled components like Dropdowns, Popovers, etc.
    if (target instanceof Element && (target.closest('[data-radix-popper-content-wrapper]') || target.closest('[data-radix-select-content]'))) {
        return;
    }

    if (modalRef.current && !modalRef.current.contains(target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(10px)",
          }}
          exit={{
            opacity: 0,
          }}
          className="fixed inset-0 h-full w-full bg-black bg-opacity-50 flex items-center justify-center z-[100]"
        >
          <motion.div
            ref={modalRef}
            initial={{
              scale: 0.5,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.5,
              opacity: 0,
            }}
            className="bg-white dark:bg-neutral-900 rounded-lg p-4 md:p-8"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="py-4 max-h-[80vh] overflow-y-auto">{children}</div>;
};

export const ModalFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("flex justify-end pt-4", className)}>
      {children}
    </div>
  );
};

export const ModalClose = ({ children, className, asChild = false }: { children: React.ReactNode, className?: string, asChild?: boolean }) => {
    const { setOpen } = useModal();
    const Comp = asChild ? Slot : "button";
    return (
        <Comp className={className} onClick={() => setOpen(false)}>
            {children}
        </Comp>
    )
}
