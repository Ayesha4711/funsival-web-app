import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";

export const metadata = {
  title: "Notifications | Funsival",
  description: "Your notifications",
};

export default function UserNotifications() {
  return (
    <UserDashboardShell>
      <div className="flex-1 bg-[var(--color-bg,#f9fafb)] p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-[var(--color-text,#1a1a1a)] mb-6">Notifications</h1>
          <div className="space-y-3">
            {[
              { text: "Lorem ipsum dolor sit amet consectetur.", time: "5 min ago",  isNew: true  },
              { text: "Lorem ipsum dolor sit amet consectetur.", time: "1 hour ago", isNew: false },
              { text: "Lorem ipsum dolor sit amet consectetur.", time: "8 hours ago",isNew: false },
              { text: "Lorem ipsum dolor sit amet consectetur.", time: "1 day ago",  isNew: false },
              { text: "Lorem ipsum dolor sit amet consectetur.", time: "2 days ago", isNew: false },
            ].map((n, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="shrink-0 mt-1">
                  {n.isNew
                    ? <span className="w-2.5 h-2.5 bg-[#F5C842] rounded-full block" />
                    : <span className="w-2.5 h-2.5 bg-gray-200 rounded-full block" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserDashboardShell>
  );
}
