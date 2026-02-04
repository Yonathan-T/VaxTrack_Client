<div align="center">
  <img src="public/logo.svg" alt="VaxTrack Logo" width="120" height="120">
  <h1>VaxTrack</h1>
  <p><em>A comprehensive vaccination tracking system built with passion and speed</em></p>
</div>

> \*\*🚀 Built in record time - This project was rapidly developed (vibe coded) to deliver a complete vaccination management solution for senior project.

## 📺 Product Overview

<div align="center">
  <a href="public/VaxTrack-Explainer.mp4">
    <img src="https://img.shields.io/badge/📹-Watch%20Demo-red" alt="Watch Demo Video">
  </a>
</div>

**Watch our [explainer video](public/VaxTrack-Explainer.mp4) to see VaxTrack in action!**

VaxTrack is a modern, comprehensive vaccination management system designed to streamline immunization tracking for healthcare facilities, parents, and administrators. Built with cutting-edge web technologies, it provides real-time insights, multilingual support (it works, mostly), and a user-friendly interface.

## ✨ Key Features

### 🏥 For Healthcare Workers

- **Vaccination Management**: Record and track immunizations with batch tracking
- **Appointment Scheduling**: Manage vaccination appointments with automated reminders
- **Inventory Management**: Track vaccine stock levels and expiry dates
- **Child Profiles**: Comprehensive health records for each child

### 👨‍👩‍👧‍👦 For Parents

- **Child Health Dashboard**: View vaccination history and upcoming appointments
- **Appointment Reminders**: SMS and email notifications for scheduled visits
- **Progress Tracking**: Visual representation of vaccination completion
- **Multilingual Support**: English and Amharic language options

### 📊 For Administrators

- **Real-time Analytics**: Comprehensive reporting and insights
- **Geographic Coverage**: Track vaccination rates by region
- **Defaulter Tracking**: Identify and follow up on missed vaccinations
- **Data Export**: Export reports in multiple formats (Excel, PDF, CSV)

## 🛠️ Technology Stack

### Frontend Framework

- **Next.js 15.5.7** - React framework with App Router
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development

### UI & Styling

- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icon system
- **Recharts** - Interactive data visualization

### State Management & Data

- **React Hook Form + Zod** - Form validation and management
- **date-fns** - Modern date manipulation
- **next-intl** - Internationalization framework

### Development Tools

- **ESLint + Prettier** - Code quality and formatting
- **TypeScript** - Static type checking
- **Hot Module Replacement** - Fast development experience

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17.0 or later
- **npm** 9.0.0 or later (or yarn/pnpm)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd VaxTrack_Client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment setup**

   Create a `.env.local` file in the root directory:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=https://your-api-endpoint.com/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Authentication
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
VaxTrack_Client/
├── 📁 app/                    # Next.js App Router
│   ├── 📁 auth/              # Authentication pages
│   ├── 📁 dashboard/         # Main dashboard
│   │   ├── 📁 children/      # Child management
│   │   ├── 📁 reports/       # Analytics & reports
│   │   ├── 📁 facilities/    # Facility management
│   │   └── 📁 vaccinations/  # Vaccination records
│   └── 📁 vaccinations/      # Vaccination management
├── 📁 components/            # Reusable components
│   ├── 📁 ui/               # Base UI components
│   ├── 📁 auth/              # Authentication components
│   ├── 📁 children/          # Child-related components
│   ├── 📁 vaccinations/      # Vaccination components
│   ├── 📁 reports/           # Report components
│   └── 📁 dashboard/         # Dashboard components
├── 📁 lib/                   # Utilities and configurations
│   ├── 📁 api-client.ts      # API client configuration
│   ├── 📁 auth-api.ts        # Authentication API
│   ├── 📁 admin-api.ts       # Admin API functions
│   └── 📁 translations.ts    # Internationalization
├── 📁 hooks/                 # Custom React hooks
├── 📁 public/                # Static assets
│   ├── 🖼️ logo.svg           # VaxTrack logo
│   └── 📹 VaxTrack-Explainer.mp4  # Product demo video
└── 📁 messages/              # i18n message files
    ├── 🇺🇸 en.json           # English translations
    └── 🇪🇹 am.json           # Amharic translations
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database & API (if applicable)
npm run db:push      # Push database schema
npm run db:studio    # Open database studio
```

## 🌍 Internationalization

VaxTrack supports multiple languages out of the box:

- **English** (en) - Default language
- **Amharic** (am) - Ethiopian language support

Language files are located in the `messages/` directory and can be easily extended for additional languages.

## 📊 Key Features Deep Dive

### 🏥 Vaccination Management

- Complete immunization history tracking
- Batch number and expiry date management
- Automated scheduling based on EPI calendar
- Multi-dose vaccine support

### 📱 SMS & Email Notifications

- Automated appointment reminders
- Follow-up notifications for missed vaccinations
- Parent communication system
- Multilingual message templates

### 📈 Analytics & Reporting

- Real-time vaccination coverage statistics
- Geographic coverage analysis by Kebele
- Defaulter tracking and follow-up
- Export functionality for regulatory compliance

### 👥 User Roles & Permissions

- **Super Admin**: Full system access
- **Local Admin**: Facility-level management
- **Healthcare Worker**: Clinical operations
- **Health Official**: Oversight and reporting
- **Parent**: Child health monitoring

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Secure API communication
- Session management

## 🐛 Troubleshooting

### Common Issues

1. **Node.js Version Compatibility**

   ```bash
   node --version  # Should be 18.17.0+
   ```

2. **Port Already in Use**

   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

3. **Dependency Issues**

   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

4. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
   - Check backend server status
   - Ensure CORS is configured on backend

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages**
   ```bash
   git commit -m "Add: Implement amazing feature"
   ```
5. **Push and create a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Write tests for new features
- Maintain code formatting with Prettier

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

For support, questions, or feature requests:

1. 📋 Check the [Troubleshooting](#-troubleshooting) section
2. 🔍 Search existing [GitHub Issues](../../issues)
3. 🐛 Create a new issue with detailed information
4. 📧 Contact the development team

## 🔄 Version History

### v1.0.0 (Current)

- ✅ Complete vaccination management system
- ✅ Multi-language support (English/Amharic)
- ✅ Real-time analytics and reporting
- ✅ SMS and email notifications
- ✅ Role-based access control
- ✅ Mobile-responsive design

## 🙏 Acknowledgments

- Built with ❤️ for healthcare professionals and parents
- Special thanks to the healthcare workers who provided valuable feedback
- Powered by modern web technologies and best practices

---

<div align="center">
  <strong>🚀 VaxTrack - Modern Vaccination Management System</strong><br>
  <em>Built with speed, designed for impact</em>
</div>
