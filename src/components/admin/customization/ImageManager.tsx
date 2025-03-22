
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

const ImageManager = () => {
  const [images, setImages] = useState([
    { id: '1', name: 'Hero Background', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', location: 'Homepage' },
    { id: '2', name: 'About Us Banner', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d', location: 'About Page' },
    { id: '3', name: 'Services Banner', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475', location: 'Services Page' },
  ]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Website Images</h3>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map(image => (
          <Card key={image.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-sm font-medium">{image.name}</CardTitle>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Location: {image.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-md">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="object-cover w-full h-full" 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm">Replace</Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageManager;
