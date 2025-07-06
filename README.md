# Blog-Genzet

A modern, full-stack blog application built with Next.js 15, TypeScript, and Tailwind CSS. This application provides a complete blogging platform with role-based authentication, article management, and category organization.

## 🚀 Features

### Authentication & Authorization

- **User Registration & Login** with JWT authentication
- **Role-based Access Control** (Admin & User roles)
- **Cookie-based Session Management** for secure authentication
- **Protected Routes** with server-side validation

### Admin Dashboard

- **Article Management** - Create, read, update, and delete articles
- **Category Management** - Organize content with custom categories
- **User Management** - View and manage user accounts
- **Real-time Search & Filtering** - Advanced search capabilities
- **Pagination** - Efficient content browsing

### User Features

- **Article Reading** - Browse and read published articles
- **Category Filtering** - Filter articles by categories
- **Responsive Design** - Optimized for all devices
- **SEO Optimized** - Dynamic meta tags and Open Graph support

### Technical Features

- **Server-Side Rendering (SSR)** with Next.js 15
- **Client-Side Interactivity** with React 19
- **Form Validation** with Zod and React Hook Form
- **Modern UI/UX** with Tailwind CSS and Lucide React icons
- **Type Safety** with TypeScript
- **API Integration** with Axios

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful & consistent icons

### Libraries & Tools

- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Axios** - Promise-based HTTP client
- **SweetAlert2** - Beautiful, responsive alerts
- **ESLint** - Code linting and formatting

### Backend Integration

- **REST API** - Integration with external blog API
- **JWT Authentication** - Secure token-based authentication
- **Cookie Management** - Secure session handling

## 📁 Project Structure

```
blog-genzet-app/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── categories/          # Category management
│   │   │   ├── create-category/     # Create new category
│   │   │   ├── edit-category/       # Edit existing category
│   │   │   └── page.tsx             # Admin dashboard
│   │   ├── user/
│   │   │   ├── [id]/               # Article detail pages
│   │   │   └── page.tsx            # User dashboard
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   └── Components/
│       ├── AdminArticleClient.tsx   # Admin article management
│       ├── AdminNavBar.tsx         # Admin navigation
│       ├── CategoryForm.tsx        # Category form component
│       ├── CategoryTable.tsx       # Category table display
│       ├── SideBar.tsx            # Admin sidebar
│       └── UserArticleDetail.tsx   # Article detail view
├── public/                         # Static assets
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/adrianAlviYendri/Blog-Genzet.git
cd Blog-Genzet/blog-genzet-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### 🔐 Demo Credentials

For testing purposes, you can use the following admin credentials:

#### Admin Access

```json
{
  "username": "genzet123",
  "password": "12345",
  "role": "Admin"
}
```

**Note**: These are demo credentials for testing the admin dashboard features. In a production environment, use secure credentials and implement proper user management.

## 📖 Usage

### For Users

1. **Register** - Create a new account with username and password
2. **Login** - Access your account with credentials
3. **Browse Articles** - Read published articles
4. **Filter by Category** - Find articles by specific categories

### For Admins

1. **Admin Login** - Use the demo credentials above or create an admin account
2. **Admin Dashboard** - Access comprehensive management interface
3. **Manage Articles** - Create, edit, and delete articles
4. **Manage Categories** - Organize content with custom categories
5. **Search & Filter** - Advanced search capabilities with real-time results
6. **Pagination** - Navigate through large datasets efficiently

## 🔧 API Integration

The application integrates with the following API endpoints:

- **Authentication**: `https://test-fe.mysellerpintar.com/api/auth/`
- **Articles**: `https://test-fe.mysellerpintar.com/api/articles/`
- **Categories**: `https://test-fe.mysellerpintar.com/api/categories/`

### Authentication Flow

1. User registers/logs in
2. JWT token stored in HTTP-only cookies
3. Token validated on each protected route
4. Server-side authentication check before page render

## 🎨 UI/UX Features

### Design System

- **Consistent Color Palette** - Blue primary with gray accents
- **Responsive Layout** - Mobile-first design approach
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time validation with clear feedback

### Animations & Interactions

- **Smooth Transitions** - CSS transitions for better UX
- **Hover Effects** - Interactive button and link states
- **Loading Animations** - Spinner animations for async operations
- **Modal Dialogs** - SweetAlert2 for confirmations and alerts

## 🔒 Security Features

- **JWT Token Authentication** - Secure token-based auth
- **HTTP-only Cookies** - Secure token storage
- **Route Protection** - Server-side route guards
- **Input Validation** - Zod schema validation
- **XSS Protection** - Sanitized user inputs

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop** - Full-featured admin dashboard
- **Tablet** - Adapted layouts with collapsible sidebars
- **Mobile** - Touch-friendly interface with mobile navigation

## 🚀 Performance Optimizations

- **Server-Side Rendering** - Fast initial page loads
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Next.js automatic image optimization
- **Font Optimization** - Automatic font loading with next/font

## 🔮 Future Enhancements

- [ ] Rich text editor for articles
- [ ] Image upload functionality
- [ ] User profiles and avatars
- [ ] Article commenting system
- [ ] Social sharing features
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

**Adrian Alvi yendri** - [GitHub Profile](https://github.com/adrianAlviYendri)
