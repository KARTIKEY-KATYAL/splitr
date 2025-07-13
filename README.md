# Splitr 💰

**The smartest way to split expenses with friends**

Splitr is a comprehensive expense splitting application that helps you track, split, and settle shared expenses with friends, roommates, or group activities. Built with modern web technologies and AI-powered features for an intelligent expense management experience.

## 🚀 Features

### Core Features
- **Group Expense Management**: Create groups for roommates, trips, or events to keep expenses organized
- **Smart Settlements**: Algorithm that minimizes the number of payments when settling up
- **Multiple Split Types**: Split equally, by percentage, or by exact amounts to fit any scenario
- **Real-time Updates**: See new expenses and repayments the moment your friends add them
- **Payment Reminders**: Automated reminders for pending debts via email

### AI-Powered Features
- **Smart Expense Suggestions**: AI-powered suggestions based on spending patterns and history
- **Receipt Scanner**: OCR-powered receipt scanning for automatic expense extraction
- **Spending Insights**: AI-generated monthly spending analysis and insights

### Advanced Features
- **Budget Tracking**: Set monthly budget limits by category with visual progress indicators
- **Recurring Expenses**: Manage subscriptions and recurring bills with automatic expense creation
- **Expense Analytics**: Comprehensive analytics dashboard with trends and spending insights
- **Category Management**: Organize expenses by categories like Food, Transport, Entertainment, etc.

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Clerk** - Authentication and user management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend & Database
- **Convex** - Real-time backend-as-a-service
- **Convex Database** - Real-time database with automatic sync
- **Convex Auth** - Integrated authentication

### AI & Automation
- **OpenAI API** - AI-powered expense suggestions and insights
- **Inngest** - Background job processing and scheduling
- **Resend** - Email service for notifications
- **OCR Integration** - Receipt text extraction

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **React Spinners** - Loading indicators

## 🏗️ Project Structure

```
splitr/
├── app/                          # Next.js App Router
│   ├── (main)/                  # Main application routes
│   │   ├── dashboard/           # Dashboard page
│   │   ├── expenses/            # Expense management
│   │   │   └── new/            # New expense creation
│   │   ├── contacts/           # Contact management
│   │   ├── settlements/        # Settlement handling
│   │   ├── analytics/          # Analytics dashboard
│   │   ├── recurring/          # Recurring expenses
│   │   └── budget/             # Budget tracking
│   ├── api/                    # API routes
│   └── globals.css             # Global styles
├── components/                  # Reusable UI components
│   └── ui/                     # shadcn/ui components
├── convex/                     # Convex backend functions
│   ├── expenses.js             # Expense operations
│   ├── users.js                # User management
│   ├── groups.js               # Group operations
│   ├── budgets.js              # Budget tracking
│   ├── recurring.js            # Recurring expenses
│   ├── analytics.js            # Analytics functions
│   └── schema.js               # Database schema
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
│   ├── inngest/               # Background jobs
│   └── expense-categories.js   # Category definitions
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Convex account
- Clerk account
- OpenAI API key (for AI features)
- Resend API key (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KARTIKEY-KATYAL/splitr.git
cd splitr
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Convex
CONVEX_DEPLOYMENT=your-convex-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Resend (for email notifications)
RESEND_API_KEY=your-resend-api-key

# Inngest (for background jobs)
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
```

4. **Set up Convex**
```bash
npx convex dev
```

5. **Set up Clerk**
- Create a Clerk application
- Configure OAuth providers (Google, GitHub, etc.)
- Set up webhooks for user synchronization

6. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

7. **Open your browser**
Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Database Schema Setup

The application uses Convex with the following main tables:
- `users` - User profiles and authentication
- `groups` - Expense groups and membership
- `expenses` - Individual expense records
- `budgets` - Monthly budget tracking
- `recurringExpenses` - Recurring expense templates
- `settlements` - Payment records

## 🎯 Usage

### Creating Your First Group
1. Sign up or log in to your account
2. Click "Create Group" from the dashboard
3. Add group members by email
4. Start adding expenses to the group

### Adding Expenses
1. Click "New Expense" from the dashboard
2. Choose from three methods:
   - **Manual Entry**: Fill out the expense form
   - **Receipt Scanner**: Upload a photo for automatic extraction
   - **Smart Suggestions**: Use AI-powered suggestions
3. Select how to split the expense
4. Add the expense to track balances

### Setting Up Budgets
1. Navigate to Budget Tracker
2. Set monthly limits for different categories
3. Monitor your spending with visual progress indicators
4. Get alerts when approaching budget limits

### Managing Recurring Expenses
1. Go to Recurring Expenses
2. Set up monthly bills, subscriptions, or regular expenses
3. Configure automatic expense creation
4. Manage active/paused recurring items

## 📊 Analytics & Insights

- **Spending Trends**: Track your spending patterns over time
- **Category Breakdown**: See where your money goes by category
- **Budget Performance**: Monitor budget vs actual spending
- **AI Insights**: Get personalized spending recommendations
- **Monthly Reports**: Automated email summaries of your expenses

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx convex dev` - Start Convex development environment

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 🌟 Key Highlights

- **Real-time Synchronization**: All changes sync instantly across devices
- **Smart Algorithm**: Optimizes settlement calculations to minimize payments
- **AI-Powered**: Intelligent suggestions and insights for better expense management
- **Mobile-First**: Responsive design that works on all devices
- **Secure**: Enterprise-grade security with Clerk authentication
- **Scalable**: Built on modern, scalable technologies

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Built By

**Kartikey Katyal**
- GitHub: [@KARTIKEY-KATYAL](https://github.com/KARTIKEY-KATYAL)
- LinkedIn: [Kartikey Katyal](https://www.linkedin.com/in/kartikey-katyal/)
- Portfolio: [kartikey-katyal.dev](https://kartikey-katyal.dev)

