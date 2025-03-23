
import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, UserCheck, CreditCard, KeyRound, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerNotification } from '@/lib/types';
import { 
  getCustomerNotifications, 
  markCustomerNotificationAsRead, 
  markAllCustomerNotificationsAsRead 
} from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

interface CustomerNotificationsProps {
  userId: string;
}

const CustomerNotifications: React.FC<CustomerNotificationsProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [open, setOpen] = useState(false);

  // Load notifications when component mounts or when userId changes
  useEffect(() => {
    if (userId) {
      setNotifications(getCustomerNotifications(userId));
    }
  }, [userId]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleReadNotification = (id: string) => {
    markCustomerNotificationAsRead(id);
    setNotifications(getCustomerNotifications(userId));
  };

  const handleReadAll = () => {
    markAllCustomerNotificationsAsRead(userId);
    setNotifications(getCustomerNotifications(userId));
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profile_fixed':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'payment_resolved':
        return <CreditCard className="h-4 w-4 text-amber-500" />;
      case 'password_reset':
        return <KeyRound className="h-4 w-4 text-purple-500" />;
      case 'order_completed':
        return <Package className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={handleReadAll}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-default ${notification.read ? '' : 'bg-muted/40'}`}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleReadNotification(notification.id)}
                    >
                      <CheckCheck className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomerNotifications;
