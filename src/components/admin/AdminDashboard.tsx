
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,294</div>
          <p className="text-xs text-gray-500">+5.2% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42</div>
          <p className="text-xs text-gray-500">-12% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,345</div>
          <p className="text-xs text-gray-500">+18.2% from last month</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
