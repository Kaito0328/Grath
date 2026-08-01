import React from "react";
import Link from "next/link";
export function LinkText({ href, children, ...props }: React.ComponentProps<typeof Link>) {
    return <Link href={href} className="text-primary hover:underline" {...props}>{children}</Link>;
}
