"use client";

import * as React from "react";

// A simplified helper for class names, removing the external dependency.
const cn = (...classes: (string | undefined | null | boolean)[]) => classes.filter(Boolean).join(' ');

// The root component doesn't render anything itself, it just holds state via context.
// In this simplified version, it just renders its children.
export const Drawer = ({ children }: { children?: React.ReactNode }) => {
    return <>{children}</>;
};

// Overlay component
const DrawerOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { open?: boolean }
>(({ className, open, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "transition-opacity duration-300 ease-in-out",
            open ? "opacity-100" : "opacity-0 pointer-events-none",
            className
        )}
        {...props}
    />
));
DrawerOverlay.displayName = "DrawerOverlay";

// Main Content component
// FIX: Re-introduced React.forwardRef to create more robust components, which is a common
// pattern for UI libraries and helps prevent issues with ref handling that can lead to runtime errors.
export const DrawerContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onClose?: () => void; direction?: "right" | "left" }
>(({ className, children, open, onClose, direction = "right", ...props }, ref) => (
    <>
        <DrawerOverlay open={open} onClick={onClose} />
        <div
            ref={ref}
            className={cn(
                "fixed top-0 h-full z-50 bg-white shadow-2xl flex flex-col",
                "transition-transform duration-300 ease-in-out",
                direction === 'right' ? 'right-0' : 'left-0',
                open ? 'translate-x-0' : (direction === 'right' ? 'translate-x-full' : '-translate-x-full'),
                className
            )}
            {...props}
        >
            {children}
        </div>
    </>
));
DrawerContent.displayName = "DrawerContent";


export const DrawerHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
));
DrawerHeader.displayName = "DrawerHeader";

export const DrawerFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-auto border-t p-4", className)} {...props} />
));
DrawerFooter.displayName = "DrawerFooter";

export const DrawerTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DrawerTitle.displayName = "DrawerTitle";

