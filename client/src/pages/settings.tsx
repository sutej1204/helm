import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Settings Module</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SettingsIcon className="h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">This module is under development</h3>
            <p className="text-gray-500 max-w-md text-center mb-6">
              Settings and configuration tools are currently being built. Check back soon for platform customization.
            </p>
            <Button variant="outline">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
