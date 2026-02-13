
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sparkles, Loader2 } from 'lucide-react';
import { FeatureDetailModal } from '@/components/ui/feature-detail-modal';
import { Badge } from '@/components/ui/badge';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useFeatures } from '@/hooks/useFeatures';
import type { Feature } from '@/ai/flows/features.types';
import { FeatureRequestModal } from '@/components/ui/feature-request-modal';

const ItemType = 'FEATURE';

const statusColumns = {
  review: { title: 'Zur Prüfung', color: 'bg-gray-200' },
  planned: { title: 'Geplant', color: 'bg-blue-200' },
  inProgress: { title: 'In Entwicklung', color: 'bg-yellow-200' },
  beta: { title: 'Beta', color: 'bg-orange-200' },
  done: { title: 'Fertig', color: 'bg-green-200' },
  rejected: { title: 'Abgelehnt', color: 'bg-red-200' },
};


const FeatureCard = ({ feature, onClick, onDrop }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { id: feature.id, status: feature.status },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <Card 
            ref={drag}
            className="mb-4 cursor-pointer hover:bg-muted/50" 
            onClick={onClick}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <CardContent className="p-3">
                <p className="font-semibold text-sm">{feature.name}</p>
                <div className="flex gap-2 mt-2">
                    <Badge variant={feature.category === 'ai' ? 'default' : 'secondary'} className={feature.category === 'ai' ? 'bg-purple-500' : ''}>
                        {feature.category === 'ai' && <Sparkles className="h-3 w-3 mr-1"/>}
                        {feature.category}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}

const StatusColumn = ({ status, features, onDrop, onFeatureClick }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemType,
        drop: (item: { id: string }) => onDrop(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div 
            ref={drop} 
            className={`p-4 rounded-lg h-full ${isOver ? 'bg-primary/10' : ''}`}
        >
            <h3 className="font-bold mb-4">{statusColumns[status].title} ({features.length})</h3>
            <div className="space-y-4">
                {features.map(feature => (
                    <FeatureCard key={feature.id} feature={feature} onClick={() => onFeatureClick(feature)} onDrop={onDrop}/>
                ))}
            </div>
        </div>
    )
}

export default function RoadmapPage() {
    const { features, setFeatures, updateFeature, isLoading } = useFeatures();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

    const handleOpenModal = (feature: Feature) => {
        setSelectedFeature(feature);
        setIsDetailModalOpen(true);
    };

    const handleFeatureDrop = (featureId: string, newStatus: string) => {
        const featureToUpdate = features.find(f => f.id === featureId);
        if (featureToUpdate && featureToUpdate.status !== newStatus) {
            const updatedFeature = { ...featureToUpdate, status: newStatus as Feature['status'] };
            // Optimistic UI update
            setFeatures(prevFeatures => prevFeatures.map(f => 
                f.id === featureId ? updatedFeature : f
            ));
            // Persist change to backend
            updateFeature(updatedFeature);
        }
    };

    if (isLoading) {
        return <div className="flex items-center gap-2"><Loader2 className="h-6 w-6 animate-spin"/> Lade Roadmap...</div>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Produkt-Roadmap</h1>
                        <p className="text-muted-foreground">Unsere Pläne und Prioritäten für die Zukunft von Amigoal.</p>
                    </div>
                    <Button onClick={() => setIsIdeaModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Neue Idee einreichen
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
                    {Object.keys(statusColumns).map(statusKey => (
                        <StatusColumn
                            key={statusKey}
                            status={statusKey}
                            features={features.filter(f => f.status === statusKey)}
                            onDrop={handleFeatureDrop}
                            onFeatureClick={handleOpenModal}
                        />
                    ))}
                </div>

            </div>
            {selectedFeature && (
                <FeatureDetailModal 
                    feature={selectedFeature}
                    isOpen={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    onUpdateFeature={updateFeature}
                />
            )}
             <FeatureRequestModal 
                isOpen={isIdeaModalOpen}
                onOpenChange={setIsIdeaModalOpen}
                source="Roadmap Page"
            />
        </DndProvider>
    );
}
