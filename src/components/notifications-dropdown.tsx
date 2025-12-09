"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/useNotifications"
import { useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from "@/store/api/adminApi"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import type { Notification } from "@/types/api"

export function NotificationsDropdown() {
    const { notifications, unreadCount, refetch } = useNotifications();
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id).unwrap();
            refetch();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead({}).unwrap();
            toast.success('All notifications marked as read');
            refetch();
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case 'error':
                return 'text-red-600 dark:text-red-400';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return 'text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <>
                        {notifications.slice(0, 5).map((notif: Notification) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notif.read ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                                    }`}
                                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <span className={`text-sm font-medium ${getNotificationColor(notif.type)}`}>
                                        {notif.title}
                                    </span>
                                    {!notif.read && (
                                        <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">{notif.message}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(notif.created_at)}
                                </span>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center">
                            <Link href="/notifications" className="text-sm text-primary">
                                View all notifications
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
