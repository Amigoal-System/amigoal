
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import type { Notification } from '@/ai/flows/notifications.types';
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export function NotificationBell() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const notificationsQuery = useMemo(() => {
    if (user && db) {
      return query(
        collection(db, 'users', user.uid, 'notifications'),
        orderBy('createdAt', 'desc')
      );
    }
    return null;
  }, [user, db]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const unreadCount = useMemo(() => {
    return notifications?.filter((n) => !n.read).length || 0;
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    if (!db || !user || !notifications) return;
    const unreadNotifications = notifications.filter(n => !n.read);
    const batch = [];
    for (const notification of unreadNotifications) {
       const notifRef = doc(db, 'users', user.uid, 'notifications', notification.id!);
       batch.push(updateDoc(notifRef, { read: true }));
    }
    await Promise.all(batch);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && db && user) {
        const notifRef = doc(db, 'users', user.uid, 'notifications', notification.id!);
        await updateDoc(notifRef, { read: true });
    }
    router.push(notification.link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative" aria-label="Open notifications">
          <Bell size={20} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="text-sm font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <button className="text-xs font-medium text-primary hover:underline" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="-mx-1 my-1 h-px bg-border"
        ></div>
        {isLoading ? <p className="p-4 text-sm text-center text-muted-foreground">Loading...</p> : 
          !notifications || notifications.length === 0 ? <p className="p-4 text-sm text-center text-muted-foreground">No new notifications.</p> :
          notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <div className="relative flex items-start gap-3 pe-3">
              <Avatar className="size-9">
                  <AvatarImage src={notification.fromUser?.avatar} alt={notification.fromUser?.name} />
                  <AvatarFallback>{notification.fromUser?.name?.slice(0,2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <button
                  className="text-left text-foreground/80 after:absolute after:inset-0"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.title && <p className="font-medium text-foreground">{notification.title}</p>}
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                </button>
                <div className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString('de-CH')}</div>
              </div>
              {notification.read ? (
                <div className="absolute end-0 self-center text-green-500">
                    <Check size={14} />
                </div>
              ) : (
                 <div className="absolute end-0 self-center text-primary">
                  <Dot />
                </div>
              )}
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
