"use client";

import React from 'react';
import GroupDrawer from "@/components/custom/drawer";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PackageCheck } from "lucide-react";
import { revalidateDailyQuestion } from "@/lib/actions";

interface QuestionPackage {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionPackagesProps {
  groupId: string;
}

export default function QuestionPackages({ groupId }: QuestionPackagesProps) {
    const [activePackage, setActivePackage] = useState<QuestionPackage | null>(null);
    const [availablePackages, setAvailablePackages] = useState<QuestionPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPackages = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/packages`, {
                next: {
                    revalidate: 3600,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch packages');
            }
            const { activePackage: activePkg, availablePackages: availablePkgs } = await response.json();
            setActivePackage(activePkg);
            setAvailablePackages(availablePkgs);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [groupId]);

    const handleActivatePackage = async (packageId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/packages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ packageId }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to activate package');
            }
            
            // Refresh the packages
            await revalidateDailyQuestion();
            await fetchPackages();
        } catch (error) {
            console.error('Error activating package:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 p-2">
                {/* Active Package */}
                <div>
                    <h3 className="text-sm font-medium mb-2">Aktives Paket</h3>
                    {activePackage ? (
                        <Card className="w-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <PackageCheck className="h-5 w-5 text-green-500" />
                                        {activePackage.name}
                                    </CardTitle>
                                    {activePackage.description && (
                                        <CardDescription>{activePackage.description}</CardDescription>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="text-center p-4 border-2 border-dashed rounded-lg text-gray-500">
                            Kein aktives Paket ausgewählt
                        </div>
                    )}
                </div>

                {/* Available Packages */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Verfügbare Pakete</h3>
                        <GroupDrawer
                            title="Alle Pakete anzeigen"
                            description="Wählen Sie ein Paket aus, um es zu aktivieren"
                            triggerClass="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            triggerText="Alle anzeigen"
                            form={
                                <div className="p-4">
                                    <h3 className="text-lg font-medium mb-4">Verfügbare Pakete</h3>
                                    <div className="space-y-4">
                                        {availablePackages.length > 0 ? (
                                            availablePackages.map((pkg) => (
                                                <Card key={pkg.id} className="p-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h4 className="font-medium">{pkg.name}</h4>
                                                            {pkg.description && (
                                                                <p className="text-sm text-gray-500">{pkg.description}</p>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            onClick={() => handleActivatePackage(pkg.id)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Aktivieren
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center">Keine weiteren Pakete verfügbar</p>
                                        )}
                                    </div>
                                </div>
                            }
                        />
                    </div>
                    
                    {availablePackages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availablePackages.slice(0, 3).map((pkg) => (
                                <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                        {pkg.description && (
                                            <CardDescription>{pkg.description}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => handleActivatePackage(pkg.id)}
                                        >
                                            Aktivieren
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500">Keine weiteren Pakete verfügbar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}