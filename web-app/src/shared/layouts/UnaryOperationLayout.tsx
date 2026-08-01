import { ReactNode } from "react";
import { OperationNotebookLayout } from "./OperationNotebookLayout";

export interface UnaryOperationLayoutProps {
	setting?: ReactNode;
	input: ReactNode;
	action?: ReactNode;
	output: ReactNode;
	verification?: ReactNode;
	startIndex?: number;
}

export const UnaryOperationLayout = ({
	setting,
	input,
	action,
	output,
	verification,
	startIndex = 1,
}: UnaryOperationLayoutProps) => {
	return <OperationNotebookLayout setting={setting} input={input} action={action} output={output} verification={verification} startIndex={startIndex} />;
};
