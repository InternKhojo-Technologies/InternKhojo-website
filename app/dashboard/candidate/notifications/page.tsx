"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("notifications_website")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Notifications</h1>

      <div className="mt-6 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border ${
              n.read ? "bg-white" : "bg-blue-50"
            }`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-gray-600">{n.message}</p>
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="text-gray-500">No notifications</p>
        )}
      </div>
    </div>
  );
}
