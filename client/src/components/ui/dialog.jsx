import React from "react";

const Dialog = ({ open, onOpenChange, children }) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
			<div
				className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
			<div
				className="fixed inset-0"
				onClick={() => onOpenChange && onOpenChange(false)}
			/>
		</div>
	);
};

const DialogContent = ({ children, className = "", ...props }) => {
	return (
		<div className={`relative ${className}`} {...props}>
			{children}
		</div>
	);
};

const DialogHeader = ({ children, className = "", ...props }) => {
	return (
		<div
			className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

const DialogTitle = ({ children, className = "", ...props }) => {
	return (
		<h3
			className={`text-lg font-semibold leading-none tracking-tight ${className}`}
			{...props}
		>
			{children}
		</h3>
	);
};

const DialogDescription = ({ children, className = "", ...props }) => {
	return (
		<p className={`text-sm text-gray-500 ${className}`} {...props}>
			{children}
		</p>
	);
};

const DialogFooter = ({ children, className = "", ...props }) => {
	return (
		<div
			className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

const DialogTrigger = ({ children, ...props }) => {
	return <div {...props}>{children}</div>;
};

export {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
};
