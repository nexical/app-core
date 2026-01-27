"use client"

import * as React from "react"
import { cn } from "@/lib/core/utils"

/**
 * A lightweight, CSS-only (mostly) tooltip component for better performance and reliability.
 * Usage:
 * <Tooltip content="Hello world">
 *   <button>Hover me</button>
 * </Tooltip>
 */

interface TooltipProps {
    content: React.ReactNode
    children: React.ReactNode
    className?: string
    side?: "top" | "bottom" | "left" | "right"
}

export function Tooltip({ content, children, className, side = "top" }: TooltipProps) {
    return (
        <div className={cn("group relative inline-block", className)}>
            {children}
            <div
                className={cn(
                    "absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200",
                    "px-2 py-1 text-xs font-medium text-popover-foreground bg-popover rounded-md shadow-md border border-border whitespace-nowrap",
                    {
                        "bottom-full left-1/2 -translate-x-1/2 mb-2": side === "top",
                        "top-full left-1/2 -translate-x-1/2 mt-2": side === "bottom",
                        "right-full top-1/2 -translate-y-1/2 mr-2": side === "left",
                        "left-full top-1/2 -translate-y-1/2 ml-2": side === "right",
                    }
                )}
            >
                {content}
                {/* Simple arrow */}
                <div
                    className={cn("absolute border-4 border-transparent", {
                        "top-full left-1/2 -translate-x-1/2 border-t-popover": side === "top",
                        "bottom-full left-1/2 -translate-x-1/2 border-b-popover": side === "bottom",
                        "left-full top-1/2 -translate-y-1/2 border-l-popover": side === "left",
                        "right-full top-1/2 -translate-y-1/2 border-r-popover": side === "right",
                    })}
                />
            </div>
        </div>
    )
}

// Support for Radix-style naming if needed by modules
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TooltipRoot = Tooltip
export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
