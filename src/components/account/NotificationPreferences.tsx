
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Save } from "lucide-react";
import { toast } from "@/lib/toast";

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    promotions: false,
    orderUpdates: true,
    serviceAnnouncements: true,
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(parsedPreferences);
      } catch (error) {
        console.error("Error parsing saved preferences:", error);
      }
    }
  }, []);

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const newPreferences = {
        ...prev,
        [key]: !prev[key],
      };
      setHasChanges(true);
      return newPreferences;
    });
  };

  const handleSavePreferences = () => {
    // Save to localStorage for demo purposes
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    toast.success("Notification preferences saved successfully");
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Manage how and when we contact you
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive order confirmations and updates via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={() => handlePreferenceChange('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promotions">Promotional Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive special offers and promotions
              </p>
            </div>
            <Switch
              id="promotions"
              checked={preferences.promotions}
              onCheckedChange={() => handlePreferenceChange('promotions')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-updates">Order Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications about your orders and subscriptions
              </p>
            </div>
            <Switch
              id="order-updates"
              checked={preferences.orderUpdates}
              onCheckedChange={() => handlePreferenceChange('orderUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="service-announcements">Service Announcements</Label>
              <p className="text-sm text-muted-foreground">
                Important updates about our services
              </p>
            </div>
            <Switch
              id="service-announcements"
              checked={preferences.serviceAnnouncements}
              onCheckedChange={() => handlePreferenceChange('serviceAnnouncements')}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSavePreferences} 
          className="w-full mt-4"
          disabled={!hasChanges}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Notification Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
