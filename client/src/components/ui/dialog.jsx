import React from "react";

const Dialog = ({ open, onOpenChange, children }) => {
	if (!open) return null;

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onOpenChange && onOpenChange(false);
		}
	};

	return (
		<div 
			className="modal fade show d-block" 
			tabIndex="-1" 
			role="dialog" 
			style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
			onClick={handleBackdropClick}
		>
			<div className="modal-dialog modal-dialog-centered modal-lg">
				{children}
			</div>
		</div>
	);
};

const DialogContent = ({ children, className = "", ...props }) => {
	return (
		<div 
			className={`modal-content ${className}`} 
			{...props} 
			onClick={(e) => e.stopPropagation()}
		>
			{children}
		</div>
	);
};

const DialogHeader = ({ children, className = "", ...props }) => {
	return (
		<div
			className={`modal-header ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

const DialogTitle = ({ children, className = "", ...props }) => {
	return (
		<h4
			className={`modal-title ${className}`}
			{...props}
		>
			{children}
		</h4>
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
			className={`modal-footer ${className}`}
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
