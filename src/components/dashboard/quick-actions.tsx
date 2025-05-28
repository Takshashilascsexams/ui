"use client";

import Link from "next/link";
import { useState } from "react";

interface ActionItem {
  title: string;
  href: string;
  icon: string;
  color: string;
  description?: string;
  isEnabled?: boolean;
}

const actions: ActionItem[] = [
  {
    title: "Create Exam",
    href: "/dashboard/exams/create-exam",
    icon: "📝",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    description: "Create a new examination",
    isEnabled: true,
  },
  {
    title: "Add Question",
    href: "/dashboard/questions/create-question",
    icon: "❓",
    color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    description: "Add questions to question bank",
    isEnabled: true,
  },
  // {
  //   title: "Student Reports",
  //   href: "/dashboard/reports",
  //   icon: "📊",
  //   color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  //   description: "View student performance reports",
  //   isEnabled: true,
  // },
  // {
  //   title: "System Settings",
  //   href: "/dashboard/settings",
  //   icon: "⚙️",
  //   color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  //   description: "Configure system settings",
  //   isEnabled: true,
  // },
  // {
  //   title: "Teacher Access",
  //   href: "/dashboard/teachers",
  //   icon: "👨‍🏫",
  //   color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  //   description: "Manage teacher accounts",
  //   isEnabled: true,
  // },
  // {
  //   title: "Results Analysis",
  //   href: "/dashboard/results",
  //   icon: "📈",
  //   color: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  //   description: "Analyze exam results and trends",
  //   isEnabled: true,
  // },
];

export function QuickActions() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
        <p className="text-sm text-gray-500 mt-1">
          Quickly access commonly used features
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.isEnabled ? action.href : "#"}
              className={`
                flex flex-col items-center justify-center rounded-lg bg-white border border-gray-100 p-4 
                transition-all duration-200 group
                ${
                  action.isEnabled
                    ? "hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
              onMouseEnter={() => setHoveredAction(action.title)}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={(e) => {
                if (!action.isEnabled) {
                  e.preventDefault();
                }
              }}
            >
              <div
                className={`
                  ${action.color} p-3 rounded-full text-xl mb-2 
                  transition-transform duration-200
                  ${
                    action.isEnabled && hoveredAction === action.title
                      ? "scale-110"
                      : ""
                  }
                `}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {action.title}
              </span>
              {action.description && hoveredAction === action.title && (
                <div className="absolute z-10 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {action.description}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Additional info or stats could go here */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>System Status: All services operational</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
