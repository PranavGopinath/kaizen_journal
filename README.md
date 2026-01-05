# Kaizen Journal

A mobile journal app for tracking daily entries, habits, goals, and mood.

## Features

- Daily journal entries with mood tracking
- Habit tracking
- Goal management with progress tracking
- Calendar view
- Search functionality

## Tech Stack

- React Native with Expo
- Supabase (backend & auth)
- Tailwind CSS (NativeWind)

## Getting Started

### Prerequisites

- Node.js (v16+)
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone git@github.com:PranavGopinath/kaizen_journal.git
   cd kaizen_journal
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Supabase
   - Create a project at [supabase.com](https://supabase.com)
   - Update `src/lib/supabase.js` with your credentials
   - Run `database_schema.sql` in your Supabase SQL editor

4. Configure environment variables
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the app
   ```bash
   npm start
   ```

## License

MIT License
