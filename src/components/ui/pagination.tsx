
"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page")) || 1

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const visiblePages = 5 // Number of page links to show

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      pageNumbers.push(1)

      if (startPage > 2) {
        pageNumbers.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      pageNumbers.push(totalPages)
    }

    return pageNumbers.map((page, index) =>
      typeof page === "number" ? (
        <Link
          key={`${page}-${index}`}
          href={createPageURL(page)}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0",
            currentPage === page && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          )}
        >
          {page}
        </Link>
      ) : (
        <span key={`${page}-${index}`} className="flex items-center justify-center w-9 h-9">
          <MoreHorizontal className="h-4 w-4" />
        </span>
      )
    )
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className="mx-auto flex w-full justify-center"
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Link
            href={createPageURL(currentPage - 1)}
            className={cn(
              buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0",
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
            aria-disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Link>
        </li>
        {renderPageNumbers()}
        <li>
          <Link
            href={createPageURL(currentPage + 1)}
            className={cn(
              buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0",
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
            aria-disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export { Pagination }
