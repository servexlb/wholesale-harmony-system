import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Clock, AlertTriangle, AlertCircle, CalendarClock, ArrowUpDown, RefreshCw, ArrowUp } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { products } from '@/lib/data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SubscriptionTracker: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('expiring-soon');
  const navigate = useNavigate();

  useEffect(() => {
    const getUserId = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        setUserId(session.session.user.id);
      }
    };
    
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        const { data: subscriptionsData, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId);
          
        if (error) {
          console.error('Error fetching subscriptions:', error);
          fallbackToLocalStorage();
          return;
        }
        
        if (subscriptionsData) {
          const mappedSubscriptions = subscriptionsData.map(sub => {
            let formattedCredentials = null;
            
            if (sub.credentials) {
              if (typeof sub.credentials === 'string') {
                try {
                  formattedCredentials = JSON.parse(sub.credentials);
                } catch (e) {
                  formattedCredentials = { notes: sub.credentials };
                }
              } else if (typeof sub.credentials === 'object') {
                formattedCredentials = sub.credentials;
              } else {
                formattedCredentials = { notes: String(sub.credentials) };
              }
            } else {
              formattedCredentials = {};
            }
            
            return {
              ...sub,
              credentials: formattedCredentials
            } as Subscription;
          });
          
          setSubscriptions(mappedSubscriptions);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchSubscriptions:', error);
        fallbackToLocalStorage();
      }
    };

    const fallbackToLocalStorage = () => {
      try {
        const savedSubscriptions = localStorage.getItem('subscriptions');
        if (savedSubscriptions) {
          const allSubs = JSON.parse(savedSubscriptions);
          const userSubs = allSubs.filter((sub: Subscription) => sub.userId === userId);
          setSubscriptions(userSubs);
        } else {
          setSubscriptions([]);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
    
    const subscriptionsChannel = supabase
      .channel('subscriptions_tracker')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        fetchSubscriptions();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [userId]);

  const getServiceName = (serviceId: string): string => {
    const product = products.find(p => p.id === serviceId);
    return product ? product.name : 'Unknown Service';
  };

  const getSubscriptionStatus = (endDate: string) => {
    const today = new Date();
    const end = parseISO(endDate);
    const daysLeft = differenceInDays(end, today);
    
    if (daysLeft < 0) {
      return { 
        status: "Expired", 
        color: "destructive",
        daysText: "Expired", 
        bgColor: "bg-red-50", 
        textColor: "text-red-800",
        borderColor: "border-red-200",
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    
    if (daysLeft <= 30) {
      return { 
        status: "Expiring Soon", 
        color: "orange", 
        daysText: `${daysLeft} days left`,
        bgColor: "bg-amber-50",
        textColor: "text-amber-800",
        borderColor: "border-amber-200",
        icon: <AlertTriangle className="h-4 w-4" />
      };
    }
    
    return { 
      status: "Active", 
      color: "green", 
      daysText: `${daysLeft} days left`,
      bgColor: "bg-green-50",
      textColor: "text-green-800", 
      borderColor: "border-green-200",
      icon: <Clock className="h-4 w-4" />
    };
  };

  const calculateProgressPercentage = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const today = new Date();
    
    if (today > end) return 100;
    
    const totalDuration = differenceInDays(end, start);
    const elapsed = differenceInDays(today, start);
    
    const percentage = (elapsed / totalDuration) * 100;
    
    return Math.min(Math.max(percentage, 0), 100);
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    switch (sortOption) {
      case 'expiring-soon':
        return parseISO(a.endDate).getTime() - parseISO(b.endDate).getTime();
      case 'recently-added':
        return parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime();
      case 'alphabetical':
        return getServiceName(a.serviceId).localeCompare(getServiceName(b.serviceId));
      default:
        return 0;
    }
  });

  const activeSubscriptions = sortedSubscriptions.filter(
    sub => sub.status === 'active' || 
    (sub.status !== 'cancelled' && differenceInDays(parseISO(sub.endDate), new Date()) >= 0)
  );
  
  const expiredSubscriptions = sortedSubscriptions.filter(
    sub => sub.status === 'expired' || 
    (sub.status !== 'cancelled' && differenceInDays(parseISO(sub.endDate), new Date()) < 0)
  );
  
  const expiringCount = activeSubscriptions.filter(
    sub => differenceInDays(parseISO(sub.endDate), new Date()) <= 30
  ).length;

  const handleRenew = (subscription: Subscription) => {
    navigate(`/services/${subscription.serviceId}`);
    toast.info("Redirecting to renewal page", {
      description: "You'll be able to renew your subscription there."
    });
  };

  const handleUpgrade = (subscription: Subscription) => {
    navigate('/services');
    toast.info("Check out our available services", {
      description: "You can upgrade to a different service or package."
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>Track and manage all your subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Your Subscriptions</CardTitle>
              <CardDescription>Track and manage all your subscriptions</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiring-soon">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Expiring Soon</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="recently-added">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      <span>Recently Added</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alphabetical">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <span>Alphabetical</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/services')}>
                <RefreshCw className="h-4 w-4" />
                <span>Browse Services</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-50 border border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium">Active Subscriptions</h3>
                </div>
                <p className="text-2xl font-bold mt-2">{activeSubscriptions.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 border border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium">Expiring Soon</h3>
                </div>
                <p className="text-2xl font-bold mt-2">{expiringCount}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-medium">Expired</h3>
                </div>
                <p className="text-2xl font-bold mt-2">{expiredSubscriptions.length}</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active" className="relative">
                Active
                {activeSubscriptions.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-0.5">
                    {activeSubscriptions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="expired" className="relative">
                Expired
                {expiredSubscriptions.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium rounded-full px-2 py-0.5">
                    {expiredSubscriptions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All Subscriptions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <div className="space-y-4">
                {activeSubscriptions.length === 0 ? (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <p className="text-muted-foreground">You don't have any active subscriptions.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/services')}
                    >
                      Browse Services
                    </Button>
                  </div>
                ) : (
                  activeSubscriptions.map(subscription => {
                    const serviceName = getServiceName(subscription.serviceId);
                    const statusInfo = getSubscriptionStatus(subscription.endDate);
                    const progressPercent = calculateProgressPercentage(subscription.startDate, subscription.endDate);
                    
                    return (
                      <Card 
                        key={subscription.id} 
                        className={`border ${statusInfo.borderColor} overflow-hidden`}
                      >
                        <div className={`${statusInfo.bgColor} px-4 py-2 flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            {statusInfo.icon}
                            <span className={`font-medium ${statusInfo.textColor}`}>
                              {statusInfo.status}
                            </span>
                          </div>
                          <Badge 
                            variant={
                              statusInfo.color === "green" ? "default" : 
                              statusInfo.color === "orange" ? "outline" : 
                              "destructive"
                            }
                            className={
                              statusInfo.color === "orange" 
                                ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                                : ""
                            }
                          >
                            {statusInfo.daysText}
                          </Badge>
                        </div>
                        
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-medium">{serviceName}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarClock className="h-4 w-4" />
                                  <span>Started: {format(parseISO(subscription.startDate), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Ends: {format(parseISO(subscription.endDate), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleRenew(subscription)}>
                                Renew
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleUpgrade(subscription)}>
                                Upgrade
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress
                              value={progressPercent}
                              className="h-2 w-full"
                              indicatorClassname="bg-primary"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="expired">
              <div className="space-y-4">
                {expiredSubscriptions.length === 0 ? (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <p className="text-muted-foreground">You don't have any expired subscriptions.</p>
                  </div>
                ) : (
                  expiredSubscriptions.map(subscription => {
                    const serviceName = getServiceName(subscription.serviceId);
                    const statusInfo = getSubscriptionStatus(subscription.endDate);
                    
                    return (
                      <Card 
                        key={subscription.id} 
                        className="border border-red-200 overflow-hidden"
                      >
                        <div className="bg-red-50 px-4 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-800">Expired</span>
                          </div>
                          <Badge variant="destructive">
                            {statusInfo.daysText}
                          </Badge>
                        </div>
                        
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-medium">{serviceName}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarClock className="h-4 w-4" />
                                  <span>Started: {format(parseISO(subscription.startDate), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Ended: {format(parseISO(subscription.endDate), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleRenew(subscription)}>
                                Reactivate
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Progress value={100} className="h-2 bg-red-100" indicatorClassName="bg-red-400" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all">
              <div className="space-y-4">
                {sortedSubscriptions.length === 0 ? (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <p className="text-muted-foreground">You don't have any subscriptions yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/services')}
                    >
                      Browse Services
                    </Button>
                  </div>
                ) : (
                  sortedSubscriptions.map(subscription => {
                    const serviceName = getServiceName(subscription.serviceId);
                    const statusInfo = getSubscriptionStatus(subscription.endDate);
                    const progressPercent = calculateProgressPercentage(subscription.startDate, subscription.endDate);
                    
                    return (
                      <Card 
                        key={subscription.id} 
                        className={`border ${statusInfo.borderColor} overflow-hidden`}
                      >
                        <div className={`${statusInfo.bgColor} px-4 py-2 flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            {statusInfo.icon}
                            <span className={`font-medium ${statusInfo.textColor}`}>
                              {statusInfo.status}
                            </span>
                          </div>
                          <Badge 
                            variant={
                              statusInfo.color === "green" ? "default" : 
                              statusInfo.color === "orange" ? "outline" : 
                              "destructive"
                            }
                            className={
                              statusInfo.color === "orange" 
                                ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                                : ""
                            }
                          >
                            {statusInfo.daysText}
                          </Badge>
                        </div>
                        
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-medium">{serviceName}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarClock className="h-4 w-4" />
                                  <span>Started: {format(parseISO(subscription.startDate), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Ends: {format(parseISO(subscription.endDate), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {statusInfo.color !== "destructive" ? (
                                <>
                                  <Button size="sm" onClick={() => handleRenew(subscription)}>
                                    Renew
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleUpgrade(subscription)}>
                                    Upgrade
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" onClick={() => handleRenew(subscription)}>
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress 
                              value={progressPercent} 
                              className="h-2" 
                              indicatorClassName={statusInfo.color === "destructive" ? "bg-red-400" : undefined}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriptionTracker;


