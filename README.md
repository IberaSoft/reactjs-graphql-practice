# React GraphQL E-Commerce Platform

<p align="center">
  <img src="assets/rrg-logo.png" alt="React GraphQL Practice" width="200">
</p>

This is a full-stack e-commerce application with a modern GraphQL architecture for learning purposes. Its showcases a production-ready app including type-safe resolvers, efficient data fetching, real-time subscriptions, and comprehensive error handling.

## 🚀 Tech Stack

### Backend
- **GraphQL API**: Apollo Server 4.x with TypeScript
- **Database**: PostgreSQL with Prisma 5.x ORM
- **Authentication**: JWT-based auth with httpOnly cookies
- **Payments**: Stripe integration
- **Real-time**: GraphQL Subscriptions

### Frontend
- **Framework**: Next.js 15 with React 18
- **GraphQL Client**: Apollo Client 3.x with React Hooks
- **Styling**: Styled Components 6.x
- **Type Safety**: TypeScript with GraphQL Code Generator

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel (frontend), Railway/Render (backend)
- **Development**: Hot reload, type checking, linting

## 📋 Features

### GraphQL Implementation Highlights

- **Schema-First Design**: Well-defined GraphQL schema with proper type definitions
- **Efficient Resolvers**: Optimized database queries with Prisma, preventing N+1 problems
- **Type Safety**: End-to-end type safety from database to frontend using TypeScript and code generation
- **Error Handling**: Comprehensive error handling with GraphQL error extensions
- **Authentication**: Secure JWT-based authentication with permission-based authorization
- **Real-time Capabilities**: GraphQL subscriptions for live updates (cart, orders, etc.)
- **Query Optimization**: Field-level resolvers with data loader pattern
- **Input Validation**: Zod-based validation for mutations

### Application Features

- 🛍️ **Product Catalog**: Browse, search, and filter items with pagination
- 🛒 **Shopping Cart**: Add/remove items with real-time updates
- 💳 **Checkout**: Secure payment processing with Stripe
- 👤 **User Management**: Registration, authentication, password reset
- 🔐 **Role-Based Access**: Permission system (ADMIN, USER, ITEMCREATE, etc.)
- 📦 **Order Management**: View order history and details
- 🎨 **Modern UI**: Responsive design with smooth animations

## 🏗️ Architecture

### GraphQL Schema Design

The application follows a clean, modular GraphQL schema structure:

```graphql
type Query {
  items(where: ItemWhereInput, orderBy: ItemOrderByInput, skip: Int, first: Int): [Item]!
  item(where: ItemWhereUniqueInput!): Item
  itemsConnection(where: ItemWhereInput): ItemConnection!
  me: User
  users: [User]!
}

type Mutation {
  createItem(title: String, description: String, price: Int, image: String): Item!
  updateItem(id: ID!, title: String, description: String, price: Int): Item!
  deleteItem(id: ID!): Item
  signup(email: String!, password: String!, name: String!): User!
  signin(email: String!, password: String!): User!
  addToCart(id: ID!): CartItem
  removeFromCart(id: ID!): CartItem
  createOrder(token: String!): Order!
  # ... more mutations
}
```

### Resolver Patterns

- **Forwarding Resolvers**: Simple queries forwarded directly to Prisma
- **Custom Resolvers**: Complex business logic with proper error handling
- **Context-Based Auth**: User authentication via request context
- **Permission Checks**: Field and operation-level permission validation

### Database Schema

Prisma schema with proper relationships:

```prisma
model User {
  id              String      @id @default(uuid())
  name            String
  email           String      @unique
  password        String
  permissions     Permission[]
  cart            CartItem[]
  orders          Order[]
  # ... more fields
}

model Item {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Int
  image       String?
  user        User     @relation(fields: [userId], references: [id])
  # ... more fields
}
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn
- Docker and Docker Compose (for local development)
- PostgreSQL (or use Docker)
- Stripe account (for payments)

### Local Development with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reactjs-graphql-practice
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```
   
   Edit the `.env` files with your configuration:
   - Database connection string
   - JWT secret
   - Stripe keys
   - Email service credentials

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   This will start:
   - PostgreSQL database
   - GraphQL API server (port 4000)
   - Frontend development server (port 3000)

4. **Run database migrations**
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql
   - Prisma Studio: `npm run prisma:studio` (in backend directory)

### Manual Setup (without Docker)

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📚 GraphQL Examples

### Query Example

```graphql
query GetItems($skip: Int, $first: Int) {
  items(skip: $skip, first: $first, orderBy: createdAt_DESC) {
    id
    title
    description
    price
    image
    user {
      name
    }
  }
  itemsConnection {
    aggregate {
      count
    }
  }
}
```

### Mutation Example

```graphql
mutation CreateItem($title: String!, $description: String!, $price: Int!) {
  createItem(
    title: $title
    description: $description
    price: $price
  ) {
    id
    title
    price
  }
}
```

### Authentication Example

```graphql
mutation SignIn($email: String!, $password: String!) {
  signin(email: $email, password: $password) {
    id
    name
    email
    permissions
  }
}
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

## 🚢 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)

1. Connect your repository
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy

## 📖 GraphQL Best Practices Demonstrated

1. **Schema Design**: Clear, intuitive schema with proper naming conventions
2. **Resolver Efficiency**: Optimized queries with Prisma, avoiding N+1 problems
3. **Error Handling**: Meaningful error messages with proper error codes
4. **Type Safety**: End-to-end TypeScript types from schema to components
5. **Security**: Authentication and authorization at resolver level
6. **Performance**: Field-level resolvers, query complexity analysis
7. **Documentation**: Self-documenting schema with descriptions
8. **Testing**: Comprehensive test coverage for resolvers and components

## 🔐 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Input validation and sanitization
- Permission-based access control
- CORS configuration
- SQL injection prevention (Prisma)

## 📝 Project Structure

```
.
├── backend/              # GraphQL API server
│   ├── src/
│   │   ├── schema/      # GraphQL schema and resolvers
│   │   ├── lib/         # Utilities (Prisma, auth, etc.)
│   │   └── middleware/  # Express/Apollo middleware
│   ├── prisma/          # Prisma schema and migrations
│   └── Dockerfile
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # React components
│   │   ├── graphql/     # GraphQL queries/mutations
│   │   └── lib/         # Utilities (Apollo Client, etc.)
│   └── Dockerfile
├── docker-compose.yml   # Local development setup
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Learning Resources

This project is designed as a comprehensive GraphQL learning resource, demonstrating:

- GraphQL schema design and best practices
- Apollo Server setup and configuration
- Prisma ORM integration with GraphQL
- Apollo Client usage in React applications
- Type-safe GraphQL development
- Real-world authentication and authorization
- Payment integration patterns
- Testing GraphQL APIs and React components

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using GraphQL, React, and modern web technologies**
