
export async function register() {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_RUNTIME === 'nodejs') {
      console.log('[Amigoal] Development server starting, ensuring database is seeded...');
      // Dynamically import to avoid pulling server code into edge runtime
      try {
        const { seedAllData } = await import('@/ai/flows/seed');
        await seedAllData();
      } catch (error) {
        console.error('[Seeder] Could not run seeder:', error);
      }
  }
}
