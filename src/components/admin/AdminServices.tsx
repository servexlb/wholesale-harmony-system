
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const AdminServices = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <p>Service list will appear here...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminServices;
