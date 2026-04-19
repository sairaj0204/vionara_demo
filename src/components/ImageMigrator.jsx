'use client';

import { useEffect, useState } from 'react';
import { migrateLocalStorageImages } from '@/utils/migrateImages';

export default function ImageMigrator() {
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    // Only run once per session to avoid checking repeatedly
    if (!sessionStorage.getItem('vionara_image_migrated')) {
      migrateLocalStorageImages().then((count) => {
        if (count > 0) {
          console.log(`Successfully migrated ${count} localStorage items to public URLs`);
        }
        sessionStorage.setItem('vionara_image_migrated', 'true');
        setMigrated(true);
      });
    }
  }, []);

  return null; // This component does not render anything
}
