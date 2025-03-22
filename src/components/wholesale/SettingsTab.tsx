
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const SettingsTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-xl font-medium mb-4">Preferences</h2>
        <p className="text-muted-foreground mb-6">
          Settings panel is under development.
        </p>
        <Button variant="outline">
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
};

export default SettingsTab;
