
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Image, Package } from "lucide-react";
import ContentEditor from "./customization/ContentEditor";
import ImageManager from "./customization/ImageManager";
import ProductManager from "./customization/ProductManager";

const AdminCustomization = () => {
  const [activeTab, setActiveTab] = useState("content");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customization</h2>
      </div>
      
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">
            <Type className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="images">
            <Image className="h-4 w-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6">
          <ContentEditor />
        </TabsContent>
        
        <TabsContent value="images" className="mt-6">
          <ImageManager />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ProductManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCustomization;
