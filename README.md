# React Authentication & Navigation App

## 📌 Overview
This is a React-based web application featuring authentication (Sign Up & Sign In) and a navigation bar. The authentication system supports local login as well as Google and Facebook authentication. 

## 🚀 Features
- User authentication with Sign Up & Sign In.
- API integration for backend authentication.
- Google & Facebook OAuth login.
- Responsive UI with Tailwind CSS.
- Local storage to maintain login state.
- Navigation bar with links to Home, Upload, and Explorer pages.

## 🛠️ Technologies Used
- React.js
- TypeScript
- Tailwind CSS
- React Router
- REST API integration
- Local Storage

## 📂 Project Structure
```
📁 src
 ├── 📂 components
 │   ├── Header.tsx (Navigation bar with authentication)
 │   ├── SignInForm.tsx (Sign In form UI & API integration)
 │   ├── SignUpForm.tsx (Sign Up form UI & API integration)
 ├── 📂 pages
 │   ├── Home.tsx
 │   ├── Upload.tsx
 │   ├── Explorer.tsx
 ├── 📂 utils
 │   ├── auth.ts (Authentication functions & API calls)
 ├── App.tsx (Main entry point)
 ├── index.tsx (Renders the application)
```

## 🏗️ Installation
### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Steps to Install & Run
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo-name.git
   cd your-repo-name
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## 🔑 Authentication API Integration
The authentication API is integrated in the `auth.ts` file. 
Make sure your backend API supports the following endpoints:
- `POST /api/auth/signup` → User registration
- `POST /api/auth/login` → User authentication

### Example API Request for Signup
```ts
const signUpUser = async (name: string, email: string, password: string) => {
  const response = await fetch("https://your-api.com/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
};
```

## 📜 Environment Variables
Create a `.env` file in the root directory and add your API base URL:
```
VITE_API_BASE_URL=https://your-api.com
```

## 📌 Future Enhancements
- Implement JWT authentication.
- Add user profile and logout functionality.
- Improve error handling and validations.

## 📄 License
This project is licensed under the MIT License.

---
Happy coding! 🚀
