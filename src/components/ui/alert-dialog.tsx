"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

interface AlertDialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogActionProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface AlertDialogCancelProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// Context untuk mengelola state dialog
const AlertDialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

const useAlertDialog = () => {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialog");
  }
  return context;
};

// Root component
const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

// Trigger component - Simplified version
const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({
  asChild,
  children,
  onClick,
}) => {
    if (asChild && React.isValidElement(children)) {
      const existingOnClick = children.props.onClick;

      return React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
          existingOnClick?.(e);
          onClick?.(e); 
        },
      });
    }
    

  return <div onClick={onClick}>{children}</div>;
};

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  className,
  children,
}) => {
  const { open, onOpenChange } = useAlertDialog();

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      disableAutoFocus={false} // Pastikan ini false
      disableRestoreFocus={false} // Pastikan ini false
      PaperProps={{
        className: cn("rounded-lg p-4", className),
      }}
    >
      <IconButton
        aria-label="close"
        onClick={() => onOpenChange(false)}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <X />
      </IconButton>
      {children}
    </Dialog>
  );
};

// Header component
const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  className,
  children,
}) => {
  return <div className={cn("mb-4", className)}>{children}</div>;
};

// Footer component
const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  className,
  children,
}) => {
  return (
    <DialogActions className={cn("gap-2 pt-4", className)}>
      {children}
    </DialogActions>
  );
};

// Title component
const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  className,
  children,
}) => {
  return (
    <DialogTitle
      id="alert-dialog-title"
      className={cn("text-lg font-semibold p-0", className)}
    >
      {children}
    </DialogTitle>
  );
};

// Description component
const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  className,
  children,
}) => {
  return (
    <DialogContent className="p-0">
      <DialogContentText
        id="alert-dialog-description"
        className={cn("text-sm text-gray-600 mt-2", className)}
      >
        {children}
      </DialogContentText>
    </DialogContent>
  );
};

// Action component
const AlertDialogAction: React.FC<AlertDialogActionProps> = ({
  className,
  children,
  onClick,
}) => {
  const { onOpenChange } = useAlertDialog();

  const handleClick = () => {
    onClick?.();
    onOpenChange(false);
  };

  return (
    <Button
      onClick={handleClick}
      variant="contained"
      color="primary"
      className={cn("", className)}
    >
      {children}
    </Button>
  );
};

// Cancel component
const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({
  className,
  children,
  onClick,
}) => {
  const { onOpenChange } = useAlertDialog();

  const handleClick = () => {
    onClick?.();
    onOpenChange(false);
  };

  return (
    <Button
      onClick={handleClick}
      variant="outlined"
      color="inherit"
      className={cn("", className)}
    >
      {children}
    </Button>
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
