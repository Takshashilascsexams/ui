export function QuickActions() {
  const actions = [
    {
      title: "Create Exam",
      href: "/dashboard/exams/create",
      icon: "📝",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Add Question",
      href: "/dashboard/questions/create",
      icon: "❓",
      color: "bg-pink-100 text-pink-700",
    },
    {
      title: "Student Reports",
      href: "/dashboard/reports",
      icon: "📊",
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "System Settings",
      href: "/dashboard/settings",
      icon: "⚙️",
      color: "bg-gray-100 text-gray-700",
    },
    {
      title: "Teacher Access",
      href: "/dashboard/teachers",
      icon: "👨‍🏫",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Results Analysis",
      href: "/dashboard/results",
      icon: "📈",
      color: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex flex-col items-center justify-center rounded-lg bg-white border border-gray-100 p-4 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
            >
              <div
                className={`${action.color} p-3 rounded-full text-xl mb-2 group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {action.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
