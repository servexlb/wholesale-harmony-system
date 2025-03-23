
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WholesaleUserManagement from "./WholesaleUserManagement";
import RegularCustomerManagement from "./RegularCustomerManagement";
import UserManagement from "./UserManagement";

const AdminCustomersPage = () => {
  const [activeTab, setActiveTab] = useState("regular");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Management</h2>
      </div>
      
      <Tabs defaultValue="regular" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regular">Regular Customers</TabsTrigger>
          <TabsTrigger value="wholesale">Wholesale Users</TabsTrigger>
          <TabsTrigger value="users">User Accounts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular" className="mt-6">
          <RegularCustomerManagement />
        </TabsContent>
        
        <TabsContent value="wholesale" className="mt-6">
          <WholesaleUserManagement />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCustomersPage;
