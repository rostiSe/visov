// components/packages/GroupPackagesManager.tsx
// This component has been refactored to work with the new many-to-many package subscription model.

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PackagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner"; // Using a toast library for user feedback is recommended

// The interface for a package remains the same
interface QuestionPackage {
  id: string;
  name: string;
  description: string | null;
}

interface GroupPackagesManagerProps {
  groupId: string;
}

export default function GroupPackagesManager({ groupId }: GroupPackagesManagerProps) {
  // NEW STATE: We now manage a list of subscribed packages, not just one active one.
  const [subscribedPackages, setSubscribedPackages] = useState<QuestionPackage[]>([]);
  const [availablePackages, setAvailablePackages] = useState<QuestionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // For disabling buttons during POST/DELETE

  // Using useCallback to memoize the fetch function
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/packages`); // Using relative URL
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      // NEW API RESPONSE: Destructure the two lists
      const { subscribedPackages, availablePackages } = await response.json();
      setSubscribedPackages(subscribedPackages);
      setAvailablePackages(availablePackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error("Fehler beim Laden der Pakete.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // NEW FUNCTION: Handles SUBSCRIBING to a package
  const handleSubscribe = async (packageId: string) => {
    setIsMutating(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to package');
      }
      toast.success("Paket erfolgreich abonniert!");
      await fetchPackages(); // Refetch all packages to update both lists
    } catch (error) {
      console.error('Error subscribing to package:', error);
      toast.error("Abonnieren fehlgeschlagen.");
    } finally {
      setIsMutating(false);
    }
  };

  // NEW FUNCTION: Handles UNSUBSCRIBING from a package
  const handleUnsubscribe = async (packageId: string) => {
    setIsMutating(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/packages`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from package');
      }
      toast.success("Paket erfolgreich deabonniert!");
      await fetchPackages(); // Refetch all packages to update both lists
    } catch (error) {
      console.error('Error unsubscribing from package:', error);
      toast.error("Deabonnieren fehlgeschlagen.");
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 space-y-8">
      {/* SECTION for Subscribed Packages */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Abonnierte Pakete</h2>
        <div className="space-y-4">
          {subscribedPackages.length > 0 ? (
            subscribedPackages.map((pkg) => (
              <Card key={pkg.id} className="bg-secondary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.description && (
                        <CardDescription>{pkg.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnsubscribe(pkg.id)}
                      disabled={isMutating}
                      aria-label="Paket deabonnieren"
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground">
              Keine Pakete abonniert.
            </div>
          )}
        </div>
      </div>

      {/* SECTION for Available Packages */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pakete entdecken</h2>
        <div className="space-y-4">
          {availablePackages.length > 0 ? (
            availablePackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.description && (
                        <CardDescription>{pkg.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSubscribe(pkg.id)}
                      disabled={isMutating}
                      aria-label="Paket abonnieren"
                    >
                      <PackagePlus className="h-5 w-5 text-primary" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground">
              Alle verfügbaren Pakete sind bereits abonniert.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
