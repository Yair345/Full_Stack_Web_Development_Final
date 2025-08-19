import React from "react";

const Table = ({ children, className = "", ...props }) => {
	return (
		<div className="w-full overflow-auto">
			<table
				className={`w-full caption-bottom text-sm ${className}`}
				{...props}
			>
				{children}
			</table>
		</div>
	);
};

const TableHeader = ({ children, className = "", ...props }) => {
	return (
		<thead className={`[&_tr]:border-b ${className}`} {...props}>
			{children}
		</thead>
	);
};

const TableBody = ({ children, className = "", ...props }) => {
	return (
		<tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
			{children}
		</tbody>
	);
};

const TableRow = ({ children, className = "", ...props }) => {
	return (
		<tr
			className={`border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50 ${className}`}
			{...props}
		>
			{children}
		</tr>
	);
};

const TableHead = ({ children, className = "", ...props }) => {
	return (
		<th
			className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}
			{...props}
		>
			{children}
		</th>
	);
};

const TableCell = ({ children, className = "", ...props }) => {
	return (
		<td
			className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
			{...props}
		>
			{children}
		</td>
	);
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
