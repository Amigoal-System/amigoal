
'use server';

import {
  getAllFeatures as getAllFeaturesFlow,
  addFeature as addFeatureFlow,
  updateFeature as updateFeatureFlow,
  deleteFeature as deleteFeatureFlow,
} from '@/ai/flows/features';
import type { Feature } from '@/ai/flows/features.types';

// Wrapper functions to ensure server-side code is not exported to the client.

export async function getAllFeatures(): Promise<Feature[]> {
  return await getAllFeaturesFlow();
}

export async function addFeature(featureData: Omit<Feature, 'id'>): Promise<Feature> {
  return await addFeatureFlow(featureData);
}

export async function updateFeature(feature: Feature): Promise<void> {
  return await updateFeatureFlow(feature);
}

export async function deleteFeature(featureId: string): Promise<void> {
  return await deleteFeatureFlow(featureId);
}
