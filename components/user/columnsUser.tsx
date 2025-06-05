
"use client";

import { Badge } from "@/components/ui/badge";
import { UserType } from "@/lib/db/schema";
import { UserStatus } from "@/types/rafed-types";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return "default"
      case "User":
    
      default:
        return "default"
    }
  }

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "success"
      case "pending":
        return "warning"
      case "inactive":
        return "destructive"

    }
  }
export const UsersColumns: ColumnDef<UserType>[] = [
  
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex font-medium  items-center">
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Full name
          </button>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon
              onClick={() => {
                // Toggle sorting
                column.clearSorting();
              }}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className=" ml-2 h-4 w-4 cursor-pointer"
            />
          ) : (
            <CaretSortIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          )}
        </div>
      ),
      cell: ({ row }) => <div className="font-bold">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <div className="flex  items-center">
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
          </button>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon
              onClick={() => {
                // Toggle sorting
                column.clearSorting();
              }}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className=" ml-2 h-4 w-4 cursor-pointer"
            />
          ) : (
            <CaretSortIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          )}
        </div>
      ),
      cell: ({ row }) => <div className="">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <div className="flex  items-center">
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Role
          </button>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon
              onClick={() => {
                // Toggle sorting
                column.clearSorting();
              }}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className=" ml-2 h-4 w-4 cursor-pointer"
            />
          ) : (
            <CaretSortIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          )}
        </div>
      ),
      cell: ({ row }) => <div>
        <Badge variant={getRoleBadgeVariant(row.getValue("role")) as any}>
                            {row.getValue("role")}
                          </Badge>
      </div>,
    },
  {
      accessorKey: "isDisabled",
      header: ({ column }) => (
        <div className="flex  items-center">
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
          </button>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon
              onClick={() => {
                // Toggle sorting
                column.clearSorting();
              }}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className=" ml-2 h-4 w-4 cursor-pointer"
            />
          ) : (
            <CaretSortIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          )}
        </div>
      ),
      cell: ({ row }) => <div> <Badge variant={getStatusBadgeVariant(row.getValue("isDisabled") === true ? "inactive" : "active") as any}>
                     {row.getValue("isDisabled") === true ? "Inactive" : "Active"}
                    </Badge></div>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex  items-center">
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
          </button>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon
              onClick={() => {
                // Toggle sorting
                column.clearSorting();
              }}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className=" ml-2 h-4 w-4 cursor-pointer"
            />
          ) : (
            <CaretSortIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          )}
        </div>
      ),
      cell: ({ row }) => <div> 
                   {new Date(row.getValue("createdAt")).toLocaleDateString()}</div>,
                    
    },
    {
      accessorKey: "last_login",
      header: ({ column }) => (
        <div className="flex  items-center">
          <button
            className="cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last login
          </button>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon
              onClick={() => {
                // Toggle sorting
                column.clearSorting();
              }}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className=" ml-2 h-4 w-4 cursor-pointer"
            />
          ) : (
            <CaretSortIcon
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2 h-4 w-4 cursor-pointer"
            />
          )}
        </div>
      ),
      cell: ({ row }) => {
    const value = row.original.last_login;
    if (!value) return null;
    const date = new Date(value);
    return (
      <div>
      {date.toLocaleDateString()} {date.toLocaleTimeString()}
      </div>
    );
    },
                    
    }
  ];