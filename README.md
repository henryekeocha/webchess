# Chess Master - Full Stack Chess Game

A modern, full-featured chess application built with React, TypeScript, and Express.js. Features include intelligent AI opponents with multiple difficulty levels, complete chess rule enforcement, move history tracking, and game review functionality.

## 🎯 Features

### Core Gameplay
- ♔ **Complete Chess Engine**: Full rule enforcement including castling, en passant, pawn promotion
- 🤖 **AI Opponents**: Three difficulty levels (Easy, Medium, Hard) with minimax algorithm
- 👥 **Human vs Human**: Local multiplayer mode for two players
- 📝 **Move History**: Complete game notation and move tracking
- 🔄 **Game Review**: Navigate through completed games move by move
- ⏱️ **Move Timer**: Built-in game timer for competitive play

### User Interface
- 🎨 **Modern Design**: Clean, responsive UI with Tailwind CSS
- 📱 **Mobile Friendly**: Fully responsive design for all devices
- 🌙 **Dark Mode**: Automatic theme switching support
- ♟️ **Visual Feedback**: Move highlights, check indicators, captured pieces display
- 🏆 **Game States**: Proper handling of checkmate, stalemate, and draw conditions

### Technical Features
- ⚡ **Real-time Updates**: Hot reloading during development
- 🔒 **Type Safety**: Full TypeScript coverage
- 🗄️ **Database Ready**: PostgreSQL integration with Drizzle ORM
- 🚀 **Production Ready**: Built-in deployment configuration

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chess-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

That's it! The chess game should be running locally.

---

## 🛠️ Development Setup

### Project Structure

```
chess-master/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── chess-board.tsx
│   │   │   ├── chess-square.tsx
│   │   │   ├── game-status-panel.tsx
│   │   │   ├── move-history-panel.tsx
│   │   │   ├── game-over-modal.tsx
│   │   │   └── game-mode-selector.tsx
│   │   ├── lib/           # Utilities and core logic
│   │   │   ├── chess-engine.ts    # Core chess game logic
│   │   │   ├── chess-ai.ts        # AI opponent logic
│   │   │   ├── chess-utils.ts     # Helper functions
│   │   │   └── utils.ts           # General utilities
│   │   ├── pages/         # Route components
│   │   │   ├── home.tsx
│   │   │   └── not-found.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx        # Main application component
│   └── index.html
├── server/                 # Backend Express.js application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage interface
│   └── vite.ts           # Vite integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database and type definitions
├── package.json
├── vite.config.ts         # Build configuration
├── tailwind.config.ts     # Styling configuration
└── tsconfig.json          # TypeScript configuration
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reloading

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Database (if using PostgreSQL)
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open database studio
```

### Environment Configuration

Create a `.env` file in the root directory for environment variables:

```env
# Database (optional - uses in-memory storage by default)
DATABASE_URL=postgresql://username:password@localhost:5432/chess_game

# Development
NODE_ENV=development
PORT=5000

# Session Secret (for production)
SESSION_SECRET=your-secure-session-secret-here
```

---

## 🎮 How to Play

### Starting a New Game

1. Click **"New Game"** button
2. Choose your game mode:
   - **Human vs Human**: Play locally with a friend
   - **Human vs AI**: Challenge the computer

### AI Difficulty Levels

- **🟢 Easy**: AI thinks 2 moves ahead, good for beginners
- **🟡 Medium**: AI thinks 3 moves ahead, balanced challenge
- **🔴 Hard**: AI thinks 4 moves ahead, expert level

### Game Controls

- **Click pieces** to select them
- **Click highlighted squares** to move
- **Move History Panel**: View all moves in chess notation
- **Timer**: Track time per move
- **Resign/Draw**: Game control options

### Review Mode

After a game ends:
1. Click **"Review Game"** in the game over modal
2. Use navigation buttons to step through moves:
   - **⏮ Start**: Go to game beginning
   - **⏪ Prev**: Previous move
   - **Next ⏩**: Next move  
   - **End ⏭**: Go to final position

---

## 🚀 Deployment Options

The easiest way to deploy your chess game:

1. **Custom Domain** (Optional)
   - Configure your domain in deployment settings

### 3. Vercel Deployment

Perfect for static deployment:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure**
   - Set build command: `npm run build`
   - Set output directory: `dist`

### 4. Netlify Deployment

1. **Connect GitHub**
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy**
   - Netlify will automatically deploy on git push

### 5. Heroku Deployment

For full-stack deployment with database:

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-chess-app
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configure Build**
   Create `Procfile`:
   ```
   web: npm run dev
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### 6. Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app
   COPY package*.json ./
   RUN npm install

   COPY . .
   RUN npm run build

   EXPOSE 5000
   CMD ["npm", "run", "dev"]
   ```

2. **Build and Run**
   ```bash
   docker build -t chess-master .
   docker run -p 5000:5000 chess-master
   ```

---

## 🗄️ Database Setup (Optional)

The application works with in-memory storage by default, but you can enable PostgreSQL for persistence:

### Local PostgreSQL

1. **Install PostgreSQL**
   - [Download PostgreSQL](https://www.postgresql.org/download/)

2. **Create Database**
   ```sql
   CREATE DATABASE chess_game;
   ```

3. **Configure Environment**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/chess_game
   ```

4. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

### Neon Database (Cloud)

1. **Create Account**
   - Go to [Neon](https://neon.tech)
   - Create a new project

2. **Get Connection String**
   - Copy the connection string from dashboard

3. **Configure**
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
   ```

---

## 🔧 Customization

### Styling

The app uses Tailwind CSS with shadcn/ui components:

- **Colors**: Modify `tailwind.config.ts`
- **Components**: Edit files in `client/src/components/ui/`
- **Global Styles**: Edit `client/src/index.css`

### Chess Logic

- **Game Rules**: Modify `client/src/lib/chess-engine.ts`
- **AI Behavior**: Adjust `client/src/lib/chess-ai.ts`
- **Piece Values**: Update AI evaluation functions

### UI Components

- **Board Design**: Edit `chess-board.tsx` and `chess-square.tsx`
- **Game Panels**: Customize `game-status-panel.tsx` and `move-history-panel.tsx`
- **Modals**: Update `game-over-modal.tsx` and `game-mode-selector.tsx`

---

## 🐛 Troubleshooting

### Common Issues

**Port 5000 already in use**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
# Or change port in package.json
```

**Build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**Database connection issues**
```bash
# Verify database URL
echo $DATABASE_URL
# Test connection
npx drizzle-kit studio
```

### Performance Optimization

1. **AI Thinking Time**: Adjust timeout in `chess-ai.ts`
2. **Bundle Size**: Use dynamic imports for large components
3. **Caching**: Enable service worker for offline play

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes** and test thoroughly
4. **Commit changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Create Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Auto-formatting enabled
- **Components**: Use functional components with hooks

### Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🆘 Support

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README for common questions
- **Community**: Join discussions in repository discussions

### Reporting Issues

When reporting issues, please include:
- Operating system and version
- Node.js version
- Browser version (if applicable)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 🎉 Acknowledgments

- **Chess Logic**: Based on standard chess rules
- **UI Components**: Built with shadcn/ui and Radix UI
- **Styling**: Powered by Tailwind CSS
- **Icons**: Chess pieces using Unicode symbols
- **AI Algorithm**: Minimax with alpha-beta pruning

---

**Enjoy playing Chess Master! 🏆**
