import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ATS Optimizer Pro - Resume Analysis Tool",
    description: "Analyze your resume against job descriptions with transparent scoring and improvement suggestions",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
