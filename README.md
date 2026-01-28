# VaxTrack Client

A comprehensive vaccination tracking system built with Next.js 15, React 19, and TypeScript.

## 🚀 Features

- **Vaccination Management**: Track and manage vaccination records
- **Dashboard Analytics**: Real-time statistics and insights
- **Multi-language Support**: Internationalization with next-intl
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Authentication**: Secure user authentication system
- **Data Export**: Export data to Excel format
- **Responsive Design**: Mobile-first responsive layout

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.7
- **Language**: TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Internationalization**: next-intl

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.17.0 or later
- **npm**: Version 9.0.0 or later (or yarn/pnpm)
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd VaxTrack_Client
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (if applicable)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database (if applicable)
DATABASE_URL=your-database-connection-string
```

### 4. Run the Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## 🏗️ Project Structure

```
VaxTrack_Client/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard components
│   └── vaccinations/      # Vaccination management
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── forms/            # Form components
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── styles/               # Global styles
├── public/               # Static assets
└── messages/             # Internationalization messages
```

## 🔧 Configuration

### Environment Variables

Copy the `.env.example` file to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

### Database Setup

If you're using a database, ensure the connection string is properly configured in your environment variables.

## 🐛 Troubleshooting

### Common Issues

1. **Node.js Version Compatibility**
   - Ensure you're using Node.js 18.17.0 or later
   - Check your version: `node --version`

2. **Dependency Conflicts**
   - If you encounter peer dependency warnings, run:

   ```bash
   npm install --force
   ```

3. **Port Already in Use**
   - Change the port in `package.json` or kill the process:

   ```bash
   # Find and kill the process
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

4. **Build Errors**
   - Clear the cache and reinstall:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### Security Vulnerabilities

The project currently has some security vulnerabilities. To address them:

```bash
npm audit fix
```

For critical vulnerabilities, consider updating the affected packages to their latest secure versions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](../../issues)
3. Create a new issue with detailed information

## 🔄 Updates

To keep your dependencies up to date:

```bash
npm update
npm audit fix
```

---

**Note**: This is a client-side application. Make sure the backend API server is running and accessible at the configured API URL.
