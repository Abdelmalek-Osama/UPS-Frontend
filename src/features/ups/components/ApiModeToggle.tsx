import React, { useState, useEffect } from 'react';
import { Settings, Database, Globe } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { ApiConfig } from '../utils/apiConfig';

interface ApiModeToggleProps {
  className?: string;
}

export function ApiModeToggle({ className }: ApiModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(ApiConfig.isDemoMode());
  const [apiBaseUrl, setApiBaseUrl] = useState(ApiConfig.getApiBaseUrl());
  const [tempUrl, setTempUrl] = useState(apiBaseUrl);

  useEffect(() => {
    const status = ApiConfig.getStatus();
    setIsDemoMode(status.isDemoMode);
    setApiBaseUrl(status.apiBaseUrl);
    setTempUrl(status.apiBaseUrl);
  }, []);

  const handleModeToggle = (enabled: boolean) => {
    if (enabled) {
      ApiConfig.enableDemoMode();
    } else {
      ApiConfig.enableLiveMode(tempUrl);
    }
    
    const status = ApiConfig.getStatus();
    setIsDemoMode(status.isDemoMode);
    setApiBaseUrl(status.apiBaseUrl);
    
    // Reload the page to apply changes
    window.location.reload();
  };

  const handleUrlSave = () => {
    ApiConfig.setApiBaseUrl(tempUrl);
    setApiBaseUrl(tempUrl);
    
    if (!isDemoMode) {
      // Reload to apply new URL
      window.location.reload();
    }
  };

  const handleReset = () => {
    ApiConfig.reset();
    const status = ApiConfig.getStatus();
    setIsDemoMode(status.isDemoMode);
    setApiBaseUrl(status.apiBaseUrl);
    setTempUrl(status.apiBaseUrl);
    
    // Reload the page to apply changes
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Settings className="h-4 w-4 mr-2" />
        API Settings
        <Badge variant={isDemoMode ? "secondary" : "default"} className="ml-2">
          {isDemoMode ? "Demo" : "Live"}
        </Badge>
      </Button>
    );
  }

  return (
    <Card className={`w-96 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isDemoMode ? (
              <Database className="h-4 w-4 text-blue-500" />
            ) : (
              <Globe className="h-4 w-4 text-green-500" />
            )}
            <Label htmlFor="demo-mode">Demo Mode</Label>
          </div>
          <Switch
            id="demo-mode"
            checked={isDemoMode}
            onCheckedChange={handleModeToggle}
          />
        </div>

        {/* Current Status */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-1">Current Status:</div>
          <div className="text-sm text-gray-600">
            Mode: <Badge variant={isDemoMode ? "secondary" : "default"}>
              {isDemoMode ? "Demo Data" : "Live API"}
            </Badge>
          </div>
          {!isDemoMode && (
            <div className="text-sm text-gray-600 mt-1">
              URL: <code className="text-xs bg-white px-1 rounded">{apiBaseUrl}</code>
            </div>
          )}
        </div>

        {/* API URL Configuration (only shown in live mode) */}
        {!isDemoMode && (
          <div className="space-y-2">
            <Label htmlFor="api-url">API Base URL</Label>
            <div className="flex space-x-2">
              <Input
                id="api-url"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="http://localhost:5000/api/v1"
                className="flex-1"
              />
              <Button
                onClick={handleUrlSave}
                disabled={tempUrl === apiBaseUrl}
                size="sm"
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="text-xs text-gray-500">
          {isDemoMode ? (
            "Using demo data for development and testing. No real API calls are made."
          ) : (
            "Connected to live API. Ensure the backend server is running and accessible."
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset to Default
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}