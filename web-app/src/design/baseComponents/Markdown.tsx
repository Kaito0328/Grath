import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Required for KaTeX styling
import { View, type ViewProps } from "../primitives/View";


export interface MarkdownProps extends Omit<ViewProps, "children"> {
    children: string;
    className?: string;
}

/**
 * Renders Markdown content, including inline ($...$) and block ($$...$$) LaTeX equations.
 */
export const Markdown = React.forwardRef<HTMLDivElement, MarkdownProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <View
                ref={ref}
                className={((['markdown-body', className]).filter(Boolean).join(' '))}
                {...props}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                >
                    {children}
                </ReactMarkdown>
            </View>
        );
    }
);

Markdown.displayName = "Markdown";
