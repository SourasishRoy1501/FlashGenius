# FlashGenius - Spaced Repetition Flashcard App

A modern flashcard application built with Next.js that uses spaced repetition algorithms to optimize learning.

## Features

- **Deck Management:** Create, edit, and organize flashcard decks by category
- **Spaced Repetition:** Uses the SM-2 algorithm to optimize review timing
- **Analytics Dashboard:** Track progress and learning statistics
- **Marketplace:** Discover and fork community decks
- **Google Sheets Import:** Import flashcards directly from spreadsheets
- **Collaboration:** Work together on shared decks

## Marketplace Functionality

The marketplace allows users to discover and utilize flashcard decks created by other users in the community. Here's how it works:

### Publishing Decks to the Marketplace

1. Navigate to the "My Decks" page
2. Click the "Public/Private" toggle on any deck to make it public
3. Once public, your deck will appear in the marketplace for other users to discover

### Discovering Community Decks

1. Go to the "Marketplace" page from the main navigation
2. Browse available decks or use search and filters to find specific content
3. Preview decks to see their contents before forking

### Forking Decks

1. When you find a deck you want to use, click the "Fork" button
2. The deck will be copied to your personal collection with all cards intact
3. Forked decks are marked with a "Forked" badge in your deck list
4. You can edit your copy freely without affecting the original deck

### Benefits

- Share your knowledge with the community
- Learn from expertly curated content
- Build upon existing decks rather than starting from scratch
- Discover new learning materials in various subject areas

## Technical Implementation

- Uses Context API for state management
- Implemented with TypeScript for type safety
- Responsive UI design with Tailwind CSS
- Framer Motion for smooth animations
- Modular component architecture for maintainability

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Navigate to http://localhost:3000 to see the application.

## Project Structure

```
/src
  /app - Next.js app router pages
  /components
    /features - Feature-specific components
      /decks - Deck management components
      /analytics - Analytics components
      /marketplace - Marketplace components
    /layouts - Layout components (Header, Footer)
    /ui - Reusable UI components
  /lib
    /contexts - Context providers
    /types - TypeScript type definitions
    /utils - Utility functions
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
