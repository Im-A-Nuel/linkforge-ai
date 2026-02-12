'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [esgPriority, setEsgPriority] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please connect your wallet to manage your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    // TODO: Call smart contract setProfile function
    console.log('Saving profile:', { riskLevel, esgPriority, automationEnabled });
    alert('Profile saved! (Smart contract integration pending)');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your investment preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm bg-gray-100 p-3 rounded">
            {address}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Select your risk tolerance for automated rebalancing
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  riskLevel === level
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold capitalize">{level}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {level === 'low' && 'Conservative'}
                  {level === 'medium' && 'Balanced'}
                  {level === 'high' && 'Aggressive'}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ESG Priority</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Enable sustainable and environmentally-friendly investment options
          </p>
          <button
            onClick={() => setEsgPriority(!esgPriority)}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              esgPriority
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {esgPriority ? 'Enabled' : 'Disabled'}
              </span>
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  esgPriority ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
                    esgPriority ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chainlink Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Enable automated rebalancing based on AI recommendations
          </p>
          <button
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              automationEnabled
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {automationEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  automationEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
                    automationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      <Button onClick={handleSaveProfile} className="w-full" size="lg">
        Save Profile Settings
      </Button>
    </div>
  );
}
