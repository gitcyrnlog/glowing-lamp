# Firebase Categories Setup Guide

This guide explains how to set up the categories in Firebase Firestore for your BelieveInTheDesigns e-commerce site.

## Prerequisites

1. Make sure you have a Firebase project set up
2. Ensure your Firebase configuration is in the `.env` file with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Firestore Structure

The app expects the following Firestore structure:

```
/categories/{categoryId}
  - id: number
  - name: string
  - description: string
  - image: string (URL to image)
  - productCount: number
  - status: string ('available' or 'coming-soon')
  - order: number
```

## Seeding Initial Categories Data

We've provided a script to seed initial category data to Firestore:

1. Install required dependencies:
   ```bash
   npm install dotenv firebase
   ```

2. Run the seed script:
   ```bash
   node scripts/seedCategories.js
   ```

This will create the following categories:
- T-Shirts (available)
- Men's Shorts (coming soon)
- Joggers (coming soon)
- Hoodies (coming soon)

## Manually Adding Categories in Firebase Console

If you prefer to add categories manually:

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a "categories" collection
4. Add documents with the following fields:
   - id: number (1, 2, 3, 4)
   - name: string (e.g., "T-Shirts")
   - description: string
   - image: string (URL to image)
   - productCount: number (0 for coming soon, actual count for available)
   - status: string ("available" or "coming-soon")
   - order: number (for sorting order)

## Updating Category Data

To update category data:
1. Go to Firebase Console > Firestore
2. Navigate to the "categories" collection
3. Edit the document fields
4. The changes will be reflected in the app automatically on next load

## Performance Considerations

The app includes:
- Loading states to indicate when data is being fetched
- Error handling for failed fetch attempts
- Fallback to hardcoded data if Firebase fetch fails
- Caching to reduce database reads
