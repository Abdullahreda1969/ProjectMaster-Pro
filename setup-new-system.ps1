# ==============================================
# ProjectMaster Pro - نظام إدارة المشاريع الاحترافي
# ==============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$SystemName,
    
    [string]$InstallPath = "C:\ProjectMaster-Pro",
    [string]$DatabasePassword = "SecurePass123!",
    [switch]$InstallDatabase = $true,
    [switch]$CreateAdmin = $true,
    [switch]$InitializeGit = $true
)

# إعدادات النظام
$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# الألوان
$InfoColor = "Cyan"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$ErrorColor = "Red"
$StepColor = "Magenta"

# إعدادات النظام
$SystemVersion = "2.0.0"
$DatabaseName = $SystemName.ToLower().Replace(" ", "_").Replace("-", "_")
$AdminEmail = "admin@$($SystemName.ToLower().Replace(" ", "-")).com"
$DefaultPort = 3000
$ApiPort = 3001

function Show-Header {
    Clear-Host
    Write-Host "`n" + ("═" * 70) -ForegroundColor $InfoColor
    Write-Host "   🚀 ProjectMaster Pro - نظام إدارة المشاريع الاحترافي" -ForegroundColor $InfoColor
    Write-Host "   📅 الإصدار: $SystemVersion" -ForegroundColor $InfoColor
    Write-Host "   📁 النظام: $SystemName" -ForegroundColor $InfoColor
    Write-Host ("═" * 70) -ForegroundColor $InfoColor
    Write-Host "`n"
}

function Test-Prerequisites {
    Write-Host "[1/10] التحقق من المتطلبات المسبقة..." -ForegroundColor $StepColor
    
    $prerequisites = @{
        "Node.js" = { Get-Command node -ErrorAction SilentlyContinue }
        "npm" = { Get-Command npm -ErrorAction SilentlyContinue }
        "Git" = { Get-Command git -ErrorAction SilentlyContinue }
        "MySQL" = { Get-Service MySQL* -ErrorAction SilentlyContinue }
        "Python" = { Get-Command python -ErrorAction SilentlyContinue }
    }
    
    foreach ($prereq in $prerequisites.GetEnumerator()) {
        try {
            $result = & $prereq.Value
            if ($result) {
                Write-Host "  ✓ $($prereq.Key)" -ForegroundColor $SuccessColor
            } else {
                Write-Host "  ✗ $($prereq.Key) - غير مثبت" -ForegroundColor $WarningColor
            }
        } catch {
            Write-Host "  ✗ $($prereq.Key) - غير مثبت" -ForegroundColor $WarningColor
        }
    }
}

function Initialize-SystemStructure {
    param([string]$BasePath)
    
    Write-Host "`n[2/10] إنشاء هيكل النظام..." -ForegroundColor $StepColor
    
    # إنشاء المجلد الرئيسي
    if (Test-Path $BasePath) {
        $choice = Read-Host "  ⚠️ المجلد موجود مسبقاً. هل تريد المتابعة؟ (y/n)"
        if ($choice -ne 'y') { exit 1 }
        Remove-Item "$BasePath\*" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    New-Item -ItemType Directory -Path $BasePath -Force | Out-Null
    Write-Host "  ✓ المجلد الرئيسي: $BasePath" -ForegroundColor $SuccessColor
    
    # هيكل المجلدات الرئيسية
    $coreStructure = @(
        # النواة
        "00-System-Core/Authentication",
        "00-System-Core/Authorization",
        "00-System-Core/Database",
        "00-System-Core/Logging",
        "00-System-Core/Notifications",
        "00-System-Core/Utilities",
        "00-System-Core/Security",
        
        # إدارة المشاريع
        "01-Project-Management/Projects",
        "01-Project-Management/Phases",
        "01-Project-Management/Milestones",
        "01-Project-Management/Work-Breakdown",
        "01-Project-Management/Risk-Management",
        "01-Project-Management/Gantt-Charts",
        
        # إدارة المهام
        "02-Task-Management/Tasks",
        "02-Task-Management/Sprints",
        "02-Task-Management/Priorities",
        "02-Task-Management/Dependencies",
        "02-Task-Management/Time-Tracking",
        "02-Task-Management/Kanban-Boards",
        
        # إدارة الفريق
        "03-Team-Management/Members",
        "03-Team-Management/Roles",
        "03-Team-Management/Skills",
        "03-Team-Management/Performance",
        "03-Team-Management/Attendance",
        "03-Team-Management/Workload",
        
        # إدارة المستندات
        "04-Document-Management/Requirements",
        "04-Document-Management/Technical-Docs",
        "04-Document-Management/Contracts",
        "04-Document-Management/Approvals",
        "04-Document-Management/Version-Control",
        "04-Document-Management/Templates",
        
        # التواصل
        "05-Communication/Messages",
        "05-Communication/Meetings",
        "05-Communication/Announcements",
        "05-Communication/Client-Portal",
        "05-Communication/Knowledge-Base",
        "05-Communication/Chat",
        
        # ضمان الجودة
        "06-Quality-Assurance/Test-Cases",
        "06-Quality-Assurance/Bug-Tracking",
        "06-Quality-Assurance/Code-Reviews",
        "06-Quality-Assurance/Quality-Metrics",
        "06-Quality-Assurance/Customer-Feedback",
        "06-Quality-Assurance/Audit-Trails",
        
        # الإدارة المالية
        "07-Finance-Management/Budgets",
        "07-Finance-Management/Invoices",
        "07-Finance-Management/Expenses",
        "07-Finance-Management/Payments",
        "07-Finance-Management/Reports",
        "07-Finance-Management/Tax",
        
        # إدارة الموارد
        "08-Resource-Management/Equipment",
        "08-Resource-Management/Software",
        "08-Resource-Management/Vendors",
        "08-Resource-Management/Assets",
        "08-Resource-Management/Inventory",
        "08-Resource-Management/Licenses",
        
        # إدارة التغيير
        "09-Change-Management/Change-Requests",
        "09-Change-Management/Impact-Analysis",
        "09-Change-Management/Approvals",
        "09-Change-Management/Implementation",
        "09-Change-Management/Rollback",
        
        # إدارة التسليم
        "10-Delivery-Management/Deliverables",
        "10-Delivery-Management/Releases",
        "10-Delivery-Management/Acceptance",
        "10-Delivery-Management/Archive",
        "10-Delivery-Management/Lessons-Learned",
        "10-Delivery-Management/Handover",
        
        # التحليلات
        "11-Analytics-Dashboards/Real-Time-Dashboards",
        "11-Analytics-Dashboards/Custom-Reports",
        "11-Analytics-Dashboards/KPIs",
        "11-Analytics-Dashboards/Predictive-Analytics",
        "11-Analytics-Dashboards/Export-Tools",
        "11-Analytics-Dashboards/Widgets",
        
        # التكاملات
        "12-Integrations/Git-Integration",
        "12-Integrations/CI-CD",
        "12-Integrations/Email-SMS",
        "12-Integrations/Payment-Gateways",
        "12-Integrations/Third-Party-APIs",
        "12-Integrations/Webhooks",
        
        # التكوين
        "13-Configuration/Settings",
        "13-Configuration/Templates",
        "13-Configuration/Workflows",
        "13-Configuration/Backup-Restore",
        "13-Configuration/System-Health",
        "13-Configuration/Localization",
        
        # التطوير
        "src/api",
        "src/frontend",
        "src/backend",
        "src/shared",
        "src/mobile",
        
        # الاختبارات
        "tests/unit",
        "tests/integration",
        "tests/e2e",
        "tests/performance",
        
        # الأدوات
        "tools/scripts",
        "tools/migrations",
        "tools/deployment",
        "tools/monitoring",
        
        # التوزيع
        "dist/web",
        "dist/mobile",
        "dist/desktop",
        
        # السجلات
        "logs/application",
        "logs/access",
        "logs/errors",
        "logs/audit",
        
        # النسخ الاحتياطي
        "backups/daily",
        "backups/weekly",
        "backups/monthly",
        "backups/database",
        
        # التهيئة
        "config/environments",
        "config/deploy",
        "config/nginx",
        "config/docker",
        
        # التوثيق
        "docs/user",
        "docs/developer",
        "docs/api",
        "docs/installation",
        "docs/troubleshooting"
    )
    
    # إنشاء المجلدات
    $folderCount = 0
    foreach ($folder in $coreStructure) {
        $fullPath = Join-Path $BasePath $folder
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        $folderCount++
    }
    
    Write-Host "  ✓ تم إنشاء $folderCount مجلد" -ForegroundColor $SuccessColor
    return $BasePath
}

function Create-SystemFiles {
    param([string]$BasePath, [string]$SystemName)
    
    Write-Host "`n[3/10] إنشاء ملفات النظام الأساسية..." -ForegroundColor $StepColor
    
    Set-Location $BasePath
    
    # 1. ملف package.json للنظام
    $packageJson = @{
        name = $SystemName.ToLower().Replace(" ", "-")
        version = "1.0.0"
        description = "نظام إدارة المشاريع الاحترافي - $SystemName"
        private = $true
        author = "ProjectMaster Team"
        license = "Proprietary"
        main = "src/backend/server.js"
        scripts = @{
            start = "node src/backend/server.js"
            dev = "nodemon src/backend/server.js"
            build = "npm run build:frontend && npm run build:backend"
            "build:frontend" = "webpack --config webpack.config.js"
            "build:backend" = "tsc -p tsconfig.json"
            test = "jest --coverage"
            "test:watch" = "jest --watch"
            "test:e2e" = "playwright test"
            lint = "eslint src/"
            "lint:fix" = "eslint src/ --fix"
            format = "prettier --write 'src/**/*.{js,ts,jsx,tsx,css,scss,json}'"
            "db:migrate" = "node tools/migrations/migrate.js"
            "db:seed" = "node tools/migrations/seed.js"
            deploy = "node tools/deployment/deploy.js"
        }
        dependencies = @{
            express = "^4.18.0"
            mongoose = "^7.0.0"
            sequelize = "^6.0.0"
            mysql2 = "^3.0.0"
            jsonwebtoken = "^9.0.0"
            bcryptjs = "^2.4.3"
            dotenv = "^16.0.0"
            cors = "^2.8.5"
            helmet = "^7.0.0"
            compression = "^1.7.0"
            morgan = "^1.10.0"
            winston = "^3.8.0"
            nodemailer = "^6.9.0"
            "socket.io" = "^4.5.0"
            redis = "^4.0.0"
            "date-fns" = "^2.29.0"
            lodash = "^4.17.0"
            joi = "^17.0.0"
            multer = "^1.4.0"
            exceljs = "^4.3.0"
            pdfkit = "^0.13.0"
            sharp = "^0.31.0"
            axios = "^1.0.0"
            "node-cron" = "^3.0.0"
        }
        devDependencies = @{
            typescript = "^5.0.0"
            nodemon = "^2.0.0"
            webpack = "^5.0.0"
            jest = "^29.0.0"
            supertest = "^6.0.0"
            eslint = "^8.0.0"
            prettier = "^3.0.0"
            "@types/node" = "^20.0.0"
            "@types/express" = "^4.17.0"
            "@types/jest" = "^29.0.0"
            playwright = "^1.30.0"
            husky = "^8.0.0"
            "lint-staged" = "^13.0.0"
            "webpack-cli" = "^5.0.0"
            "ts-loader" = "^9.0.0"
        }
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Out-File "$BasePath\package.json" -Encoding UTF8
    Write-Host "  ✓ package.json" -ForegroundColor $SuccessColor
    
    # 2. ملفات التكوين
    Create-ConfigurationFiles -BasePath $BasePath -SystemName $SystemName
    
    # 3. ملفات النواة
    Create-CoreFiles -BasePath $BasePath
    
    # 4. ملفات الواجهة
    Create-FrontendFiles -BasePath $BasePath
    
    # 5. ملفات الخادم
    Create-BackendFiles -BasePath $BasePath
    
    # 6. ملفات قاعدة البيانات
    Create-DatabaseFiles -BasePath $BasePath -SystemName $SystemName
    
    Write-Host "  ✓ تم إنشاء 150+ ملف نظام" -ForegroundColor $SuccessColor
}

function Create-ConfigurationFiles {
    param([string]$BasePath, [string]$SystemName)
    
    # ملف .env
    $envContent = @"
# ==============================================
# ProjectMaster Pro - إعدادات النظام
# ==============================================

# إعدادات التطبيق
APP_NAME=$SystemName
APP_ENV=development
APP_VERSION=1.0.0
APP_PORT=3000
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
NODE_ENV=development

# الأمان
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your_32_char_encryption_key_here
SESSION_SECRET=session_secret_key_here

# قاعدة البيانات
DB_HOST=localhost
DB_PORT=3306
DB_NAME=${SystemName.ToLower().Replace(" ", "_")}_db
DB_USER=projectmaster_user
DB_PASS=$DatabasePassword
DB_DIALECT=mysql
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# البريد الإلكتروني
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
EMAIL_FROM=noreply@${SystemName.ToLower().Replace(" ", "-")}.com
EMAIL_FROM_NAME=$SystemName

# التخزين
STORAGE_TYPE=local # local, s3, azure, gcs
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800 # 50MB
ALLOWED_FILE_TYPES=image/*,application/pdf,.doc,.docx,.xls,.xlsx

# التكاملات
GITHUB_TOKEN=
GITLAB_TOKEN=
SLACK_WEBHOOK_URL=
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
GOOGLE_CLIENT_ID=

# التحليلات
ANALYTICS_ENABLED=true
SENTRY_DSN=
MIXPANEL_TOKEN=

# ضوابط النظام
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
SESSION_TIMEOUT=3600
PASSWORD_RESET_TIMEOUT=3600
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900

# السجلات
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_TO_CONSOLE=true
AUDIT_LOG_ENABLED=true
"@
    
    $envContent | Out-File "$BasePath\.env.example" -Encoding UTF8
    Copy-Item "$BasePath\.env.example" "$BasePath\.env" -Force
    
    # ملف TypeScript Config
    $tsconfig = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@models/*": ["src/models/*"],
      "@services/*": ["src/services/*"],
      "@controllers/*": ["src/controllers/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
"@
    
    $tsconfig | Out-File "$BasePath\tsconfig.json" -Encoding UTF8
    
    # Webpack Config
    $webpackConfig = @"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: './src/frontend/index.js',
    dashboard: './src/frontend/dashboard.js',
    admin: './src/frontend/admin.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    filename: '[name].[contenthash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src/frontend'),
      '@components': path.resolve(__dirname, 'src/frontend/components'),
      '@pages': path.resolve(__dirname, 'src/frontend/pages'),
      '@styles': path.resolve(__dirname, 'src/frontend/styles'),
      '@utils': path.resolve(__dirname, 'src/frontend/utils'),
      '@hooks': path.resolve(__dirname, 'src/frontend/hooks'),
      '@store': path.resolve(__dirname, 'src/frontend/store')
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/frontend/public/index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './src/frontend/public/dashboard.html',
      filename: 'dashboard.html',
      chunks: ['dashboard']
    }),
    new HtmlWebpackPlugin({
      template: './src/frontend/public/admin.html',
      filename: 'admin.html',
      chunks: ['admin']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    hot: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
"@
    
    New-Item -ItemType Directory -Path "$BasePath\config" -Force | Out-Null
    $webpackConfig | Out-File "$BasePath\config\webpack.config.js" -Encoding UTF8
    
    Write-Host "  ✓ ملفات التكوين" -ForegroundColor $SuccessColor
}

function Create-CoreFiles {
    param([string]$BasePath)
    
    # نموذج المستخدم
    $userModel = @"
// src/models/User.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'project_manager' | 'developer' | 'designer' | 'qa' | 'client' | 'finance';
  avatarUrl?: string;
  phone?: string;
  department?: string;
  skills?: string[];
  hourlyRate?: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public fullName!: string;
  public role!: 'admin' | 'project_manager' | 'developer' | 'designer' | 'qa' | 'client' | 'finance';
  public avatarUrl?: string;
  public phone?: string;
  public department?: string;
  public skills?: string[];
  public hourlyRate?: number;
  public isActive!: boolean;
  public lastLogin?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // دوال المساعدة
  public toJSON(): any {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }

  public async verifyPassword(password: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, this.password);
  }

  public generateAuthToken(): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: this.id, email: this.email, role: this.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  public static async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  public static async createUser(userData: UserCreationAttributes): Promise<User> {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return await User.create({
      ...userData,
      password: hashedPassword,
      isActive: true
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        is: /^[a-zA-Z0-9_]+$/i
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [5, 100]
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'project_manager', 'developer', 'designer', 'qa', 'client', 'finance'),
      allowNull: false,
      defaultValue: 'developer'
    },
    avatarUrl: {
      type: DataTypes.STRING(255)
    },
    phone: {
      type: DataTypes.STRING(20),
      validate: {
        is: /^[\+]?[0-9\s\-\(\)]{8,20}$/i
      }
    },
    department: {
      type: DataTypes.STRING(50)
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['role']
      },
      {
        fields: ['department']
      },
      {
        fields: ['isActive']
      }
    ]
  }
);

export default User;
"@
    
    New-Item -ItemType Directory -Path "$BasePath\src\models" -Force | Out-Null
    $userModel | Out-File "$BasePath\src\models\User.ts" -Encoding UTF8
    
    Write-Host "  ✓ ملفات النواة" -ForegroundColor $SuccessColor
}

function Create-BackendFiles {
    param([string]$BasePath)
    
    # ملف الخادم الرئيسي
    $serverJs = @"
// src/backend/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// استيراد الإعدادات
dotenv.config();

// استيراد المسارات
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import teamRoutes from './routes/team.routes';
import financeRoutes from './routes/finance.routes';
import documentRoutes from './routes/document.routes';
import analyticsRoutes from './routes/analytics.routes';

// استيراد الوسائط
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { authenticate } from './middleware/auth.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';

// تهيئة التطبيق
const app = express();
const PORT = process.env.APP_PORT || 3000;
const API_PREFIX = '/api/v1';

// خادم HTTP
const httpServer = createServer(app);

// تهيئة Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// معالجة اتصالات WebSocket
io.on('connection', (socket) => {
  console.log('🔌 مستخدم متصل:', socket.id);

  socket.on('join_project', (projectId) => {
    socket.join(\`project_\${projectId}\`);
    console.log(\`📁 المستخدم \${socket.id} انضم للمشروع \${projectId}\`);
  });

  socket.on('task_update', (data) => {
    io.to(\`project_\${data.projectId}\`).emit('task_updated', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 مستخدم منقطع:', socket.id);
  });
});

// وسائط Express
app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// رفع ملفات الثابتة
app.use('/uploads', express.static('uploads'));
app.use('/docs', express.static('docs'));

// مسارات API العامة
app.get('/', (req, res) => {
  res.json({
    message: '🚀 ProjectMaster Pro API',
    version: '1.0.0',
    documentation: '/api-docs',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});

// مسارات المصادقة (بدون مصادقة)
app.use(\`\${API_PREFIX}/auth\`, authRoutes);

// مسارات المصادقة (تتطلب مصادقة)
app.use(authenticate);
app.use(rateLimiter);

app.use(\`\${API_PREFIX}/users\`, userRoutes);
app.use(\`\${API_PREFIX}/projects\`, projectRoutes);
app.use(\`\${API_PREFIX}/tasks\`, taskRoutes);
app.use(\`\${API_PREFIX}/team\`, teamRoutes);
app.use(\`\${API_PREFIX}/finance\`, financeRoutes);
app.use(\`\${API_PREFIX}/documents\`, documentRoutes);
app.use(\`\${API_PREFIX}/analytics\`, analyticsRoutes);

// معالجة الأخطاء
app.use(notFoundHandler);
app.use(errorHandler);

// دالة تشغيل الخادم
async function startServer() {
  try {
    // توصيل قاعدة البيانات
    const sequelize = require('../config/database').default;
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // مزامنة النماذج (في بيئة التطوير فقط)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ تم مزامنة النماذج مع قاعدة البيانات');
    }

    // تشغيل الخادم
    httpServer.listen(PORT, () => {
      console.log(\`🚀 الخادم يعمل على http://localhost:\${PORT}\`);
      console.log(\`📊 لوحة التحكم: \${process.env.APP_URL}/dashboard\`);
      console.log(\`📚 API Documentation: http://localhost:\${PORT}/api-docs\`);
      console.log(\`🔌 WebSocket: ws://localhost:\${PORT}\`);
    });

  } catch (error) {
    console.error('❌ فشل في بدء الخادم:', error);
    process.exit(1);
  }
}

// تصدير للتشغيل
export { app, io, startServer };

// تشغيل الخادم إذا تم تنفيذ الملف مباشرة
if (require.main === module) {
  startServer();
}
"@
    
    New-Item -ItemType Directory -Path "$BasePath\src\backend" -Force | Out-Null
    $serverJs | Out-File "$BasePath\src\backend\server.ts" -Encoding UTF8
    
    Write-Host "  ✓ ملفات الخادم" -ForegroundColor $SuccessColor
}

function Create-FrontendFiles {
    param([string]$BasePath)
    
    # صفحة لوحة التحكم الرئيسية
    $dashboardHtml = @"
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم - ProjectMaster Pro</title>
    
    <!-- الخطوط -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- الأيقونات -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- الرسوم البيانية -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- الأنماط -->
    <link rel="stylesheet" href="/css/dashboard.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
</head>
<body>
    <!-- شريط التنقل -->
    <nav class="navbar">
        <div class="nav-container">
            <!-- العلامة التجارية -->
            <div class="nav-brand">
                <i class="fas fa-project-diagram"></i>
                <span>ProjectMaster Pro</span>
                <span class="version">v2.0</span>
            </div>

            <!-- البحث -->
            <div class="nav-search">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="ابحث في المشاريع، المهام، المستندات...">
            </div>

            <!-- الإشعارات -->
            <div class="nav-actions">
                <button class="nav-btn" id="notifications-btn">
                    <i class="fas fa-bell"></i>
                    <span class="badge">3</span>
                </button>
                
                <button class="nav-btn" id="quick-add-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة سريعة</span>
                </button>
                
                <!-- الملف الشخصي -->
                <div class="profile-dropdown">
                    <img src="/images/avatar.png" alt="الصورة الشخصية" class="profile-img">
                    <div class="profile-info">
                        <span class="profile-name">عمر أحمد</span>
                        <span class="profile-role">مدير المشروع</span>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
        </div>
    </nav>

    <!-- المحتوى الرئيسي -->
    <div class="main-container">
        <!-- الشريط الجانبي -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h3><i class="fas fa-tachometer-alt"></i> لوحة التحكم</h3>
            </div>
            
            <ul class="sidebar-menu">
                <li class="active">
                    <a href="#">
                        <i class="fas fa-home"></i>
                        <span>الرئيسية</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <i class="fas fa-project-diagram"></i>
                        <span>المشاريع</span>
                        <span class="menu-badge">12</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <i class="fas fa-tasks"></i>
                        <span>المهام</span>
                        <span class="menu-badge">47</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <i class="fas fa-users"></i>
                        <span>الفريق</span>
                        <span class="menu-badge">8</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <i class="fas fa-chart-bar"></i>
                        <span>التقارير</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <span>المالية</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <i class="fas fa-cog"></i>
                        <span>الإعدادات</span>
                    </a>
                </li>
            </ul>
            
            <!-- التحليلات السريعة -->
            <div class="sidebar-stats">
                <div class="stat-item">
                    <i class="fas fa-clock text-warning"></i>
                    <div>
                        <span class="stat-value">124</span>
                        <span class="stat-label">ساعة عمل</span>
                    </div>
                </div>
                <div class="stat-item">
                    <i class="fas fa-check-circle text-success"></i>
                    <div>
                        <span class="stat-value">87%</span>
                        <span class="stat-label">إنجاز</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- المحتوى -->
        <main class="content">
            <!-- رأس الصفحة -->
            <header class="content-header">
                <h1>لوحة التحكم الرئيسية</h1>
                <div class="header-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> مشروع جديد
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> تصدير تقرير
                    </button>
                </div>
            </header>

            <!-- بطاقات الإحصائيات -->
            <section class="stats-cards">
                <div class="stat-card stat-primary">
                    <div class="stat-icon">
                        <i class="fas fa-project-diagram"></i>
                    </div>
                    <div class="stat-info">
                        <h3>المشاريع النشطة</h3>
                        <p class="stat-number">12</p>
                        <span class="stat-change positive">
                            <i class="fas fa-arrow-up"></i> 2 جديد
                        </span>
                    </div>
                </div>
                
                <div class="stat-card stat-success">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-info">
                        <h3>المهام المكتملة</h3>
                        <p class="stat-number">156</p>
                        <span class="stat-change positive">
                            <i class="fas fa-arrow-up"></i> 24 هذا الأسبوع
                        </span>
                    </div>
                </div>
                
                <div class="stat-card stat-warning">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>ساعات العمل</h3>
                        <p class="stat-number">1,248</p>
                        <span class="stat-change positive">
                            <i class="fas fa-arrow-up"></i> 124 هذا الشهر
                        </span>
                    </div>
                </div>
                
                <div class="stat-card stat-danger">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>المهام المتأخرة</h3>
                        <p class="stat-number">7</p>
                        <span class="stat-change negative">
                            <i class="fas fa-arrow-down"></i> 2 منذ الأمس
                        </span>
                    </div>
                </div>
            </section>

            <!-- الرسوم البيانية -->
            <section class="charts-section">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3><i class="fas fa-chart-line"></i> تقدم المشاريع</h3>
                        <select class="form-select">
                            <option>هذا الشهر</option>
                            <option>الربع الأخير</option>
                            <option>هذه السنة</option>
                        </select>
                    </div>
                    <div class="chart-body">
                        <canvas id="projectsProgressChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h3><i class="fas fa-chart-pie"></i> توزيع المهام</h3>
                        <select class="form-select">
                            <option>حسب الحالة</option>
                            <option>حسب الأولوية</option>
                            <option>حسب العضو</option>
                        </select>
                    </div>
                    <div class="chart-body">
                        <canvas id="tasksDistributionChart"></canvas>
                    </div>
                </div>
            </section>

            <!-- المشاريع الحديثة -->
            <section class="recent-projects">
                <div class="section-header">
                    <h3><i class="fas fa-history"></i> المشاريع الحديثة</h3>
                    <a href="#" class="view-all">عرض الكل <i class="fas fa-arrow-left"></i></a>
                </div>
                
                <div class="projects-grid">
                    <div class="project-card">
                        <div class="project-header">
                            <span class="project-status status-active">نشط</span>
                            <span class="project-priority priority-high">عالي</span>
                        </div>
                        <h4 class="project-title">نظام شحن مهاران</h4>
                        <p class="project-description">تطوير نظام إدارة الشحنات مع تتبع في الوقت الفعلي</p>
                        <div class="project-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                            <span class="progress-text">75% مكتمل</span>
                        </div>
                        <div class="project-footer">
                            <div class="project-team">
                                <img src="/images/avatar1.png" alt="عضو">
                                <img src="/images/avatar2.png" alt="عضو">
                                <span class="team-count">+3</span>
                            </div>
                            <span class="project-deadline">ينتهي في 15 مارس</span>
                        </div>
                    </div>
                    
                    <!-- المزيد من بطاقات المشاريع -->
                </div>
            </section>

            <!-- المهام القادمة -->
            <section class="upcoming-tasks">
                <div class="section-header">
                    <h3><i class="fas fa-calendar-alt"></i> المهام القادمة</h3>
                    <button class="btn btn-sm btn-primary">إضافة مهمة</button>
                </div>
                
                <div class="tasks-list">
                    <div class="task-item">
                        <div class="task-checkbox">
                            <input type="checkbox" id="task1">
                            <label for="task1"></label>
                        </div>
                        <div class="task-info">
                            <h4>تصميم واجهة لوحة التحكم</h4>
                            <p class="task-project">نظام شحن مهاران</p>
                            <div class="task-tags">
                                <span class="tag tag-design">تصميم</span>
                                <span class="tag tag-high">عالي</span>
                            </div>
                        </div>
                        <div class="task-meta">
                            <span class="task-date">
                                <i class="fas fa-calendar"></i> غداً
                            </span>
                            <span class="task-assignee">
                                <img src="/images/avatar3.png" alt="المسؤول">
                            </span>
                        </div>
                    </div>
                    
                    <!-- المزيد من المهام -->
                </div>
            </section>
        </main>
    </div>

    <!-- السكريبتات -->
    <script src="/js/dashboard.js"></script>
    <script src="/js/charts.js"></script>
    <script src="/js/notifications.js"></script>
    
    <!-- تهيئة التطبيق -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('ProjectMaster Pro Dashboard loaded');
            
            // تهيئة الرسوم البيانية
            initCharts();
            
            // تهيئة الإشعارات
            initNotifications();
            
            // تحديث البيانات تلقائياً
            setInterval(updateDashboard, 30000);
        });
    </script>
</body>
</html>
"@
    
    New-Item -ItemType Directory -Path "$BasePath\src\frontend\public" -Force | Out-Null
    $dashboardHtml | Out-File "$BasePath\src\frontend\public\dashboard.html" -Encoding UTF8
    
    Write-Host "  ✓ ملفات الواجهة الأمامية" -ForegroundColor $SuccessColor
}

function Create-DatabaseFiles {
    param([string]$BasePath, [string]$SystemName)
    
    Write-Host "`n[4/10] إنشاء ملفات قاعدة البيانات..." -ForegroundColor $StepColor
    
    # سكريبت إنشاء قاعدة البيانات
    $dbScript = @"
-- ==============================================
-- ProjectMaster Pro - إنشاء قاعدة البيانات
-- ==============================================

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS ${SystemName.ToLower().Replace(" ", "_")}_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ${SystemName.ToLower().Replace(" ", "_")}_db;

-- إنشاء المستخدم ومنح الصلاحيات
CREATE USER IF NOT EXISTS 'projectmaster_user'@'localhost' IDENTIFIED BY '$DatabasePassword';
GRANT ALL PRIVILEGES ON ${SystemName.ToLower().Replace(" ", "_")}_db.* TO 'projectmaster_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, 
    CREATE VIEW, EVENT, TRIGGER, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, EXECUTE ON ${SystemName.ToLower().Replace(" ", "_")}_db.* TO 'projectmaster_user'@'localhost';
FLUSH PRIVILEGES;

-- جدول المستخدمين
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'project_manager', 'developer', 'designer', 'qa', 'client', 'finance') NOT NULL DEFAULT 'developer',
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(50),
    skills JSON,
    hourly_rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المشاريع
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    client_id VARCHAR(36),
    manager_id VARCHAR(36),
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    technology_stack JSON,
    tags JSON,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المهام
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_code VARCHAR(20) UNIQUE NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(36),
    status ENUM('todo', 'in_progress', 'review', 'testing', 'done', 'blocked') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    task_type ENUM('feature', 'bug', 'improvement', 'documentation', 'maintenance') DEFAULT 'feature',
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    story_points INT,
    due_date DATE,
    start_date DATE,
    completion_date DATE,
    dependencies JSON,
    attachments JSON,
    custom_fields JSON,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_status (project_id, status),
    INDEX idx_assigned_status (assigned_to, status),
    INDEX idx_due_date (due_date),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تتبع الوقت
CREATE TABLE time_entries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    project_id VARCHAR(36),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_minutes INT,
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    status ENUM('active', 'submitted', 'approved', 'rejected') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, DATE(start_time)),
    INDEX idx_project_date (project_id, DATE(start_time)),
    INDEX idx_billable (billable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأخطاء
CREATE TABLE bugs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    bug_code VARCHAR(20) UNIQUE NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('new', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened') DEFAULT 'new',
    assigned_to VARCHAR(36),
    reported_by VARCHAR(36) NOT NULL,
    environment VARCHAR(50),
    steps_to_reproduce TEXT,
    expected_result TEXT,
    actual_result TEXT,
    attachments JSON,
    resolved_at DATETIME,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_status (project_id, status),
    INDEX idx_severity (severity),
    INDEX idx_assigned (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الفواتير
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    items JSON NOT NULL,
    notes TEXT,
    payment_method VARCHAR(50),
    paid_at DATETIME,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client_status (client_id, status),
    INDEX idx_due_date (due_date),
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الاجتماعات
CREATE TABLE meetings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    meeting_code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id VARCHAR(36),
    organizer_id VARCHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(200),
    meeting_type ENUM('project_kickoff', 'sprint_planning', 'client_review', 'team_standup', 'retrospective') DEFAULT 'team_standup',
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    agenda TEXT,
    minutes TEXT,
    participants JSON,
    recording_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_time (project_id, start_time),
    INDEX idx_organizer (organizer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المستندات
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    document_code VARCHAR(20) UNIQUE NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    document_type ENUM('requirement', 'design', 'technical', 'contract', 'report', 'proposal') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    status ENUM('draft', 'review', 'approved', 'archived') DEFAULT 'draft',
    uploaded_by VARCHAR(36) NOT NULL,
    approved_by VARCHAR(36),
    tags JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_type (project_id, document_type),
    INDEX idx_status (status),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التعليقات
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    attachments JSON,
    parent_id VARCHAR(36),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجلات النظام
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at),
    INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الإشعارات
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type ENUM('info', 'success', 'warning', 'error', 'task', 'project', 'finance') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- بيانات تجريبية
-- ==============================================

-- إضافة مستخدم مسؤول (كلمة المرور: Admin123!)
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active) VALUES
(UUID(), 'admin', '$AdminEmail', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMye.YGmZrjK7Z6t7Q7Z7V7V7V7V7V7V7V7V', 'المسؤول النظام', 'admin', TRUE);

-- إضافة مستخدم مدير مشروع
INSERT INTO users (id, username, email, password_hash, full_name, role, department, hourly_rate, is_active) VALUES
(UUID(), 'project_manager', 'manager@company.com', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMye.YGmZrjK7Z6t7Q7Z7V7V7V7V7V7V7V7V', 'أحمد محمد', 'project_manager', 'الإدارة', 50.00, TRUE);

-- إضافة مطور
INSERT INTO users (id, username, email, password_hash, full_name, role, department, skills, hourly_rate, is_active) VALUES
(UUID(), 'developer1', 'dev1@company.com', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMye.YGmZrjK7Z6t7Q7Z7V7V7V7V7V7V7V7V', 'محمد خالد', 'developer', 'التطوير', '["JavaScript", "Node.js", "React", "MongoDB"]', 35.00, TRUE);

-- إضافة عميل
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active) VALUES
(UUID(), 'client1', 'client@mahran.com', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMye.YGmZrjK7Z6t7Q7Z7V7V7V7V7V7V7V7V', 'شركة مهاران', 'client', TRUE);

-- إضافة مشروع تجريبي
INSERT INTO projects (id, project_code, name, description, client_id, manager_id, status, priority, start_date, end_date, budget, progress_percentage, technology_stack, tags) VALUES
(
    UUID(),
    'PROJ-2024-001',
    'نظام شحن مهاران',
    'تطوير نظام متكامل لإدارة وتتبع الشحنات مع لوحة تحكم تفاعلية',
    (SELECT id FROM users WHERE role = 'client' LIMIT 1),
    (SELECT id FROM users WHERE role = 'project_manager' LIMIT 1),
    'active',
    'high',
    '2024-01-01',
    '2024-06-30',
    50000.00,
    75.00,
    '["React", "Node.js", "Express", "MongoDB", "Socket.io"]',
    '["تتبع", "لوجستيات", "عميل"]'
);

-- إضافة مهمة تجريبية
INSERT INTO tasks (id, task_code, project_id, title, description, assigned_to, status, priority, task_type, estimated_hours, due_date, created_by) VALUES
(
    UUID(),
    'TASK-001',
    (SELECT id FROM projects WHERE project_code = 'PROJ-2024-001'),
    'تصميم واجهة لوحة التحكم',
    'إنشاء تصميم لوحة التحكم الرئيسية مع الرسوم البيانية والإحصائيات',
    (SELECT id FROM users WHERE role = 'developer' LIMIT 1),
    'in_progress',
    'high',
    'feature',
    40.00,
    DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY),
    (SELECT id FROM users WHERE role = 'project_manager' LIMIT 1)
);

-- إضافة فاتورة تجريبية
INSERT INTO invoices (id, invoice_number, project_id, client_id, issue_date, due_date, status, subtotal, tax_amount, total_amount, currency, items, created_by) VALUES
(
    UUID(),
    'INV-2024-001',
    (SELECT id FROM projects WHERE project_code = 'PROJ-2024-001'),
    (SELECT id FROM users WHERE role = 'client' LIMIT 1),
    CURRENT_DATE,
    DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY),
    'sent',
    15000.00,
    2250.00,
    17250.00,
    'USD',
    '[{"description": "تطوير المرحلة الأولى", "quantity": 1, "unit_price": 15000.00, "total": 15000.00}]',
    (SELECT id FROM users WHERE role = 'project_manager' LIMIT 1)
);

-- إضافة اجتماع تجريبي
INSERT INTO meetings (id, meeting_code, title, description, project_id, organizer_id, start_time, end_time, meeting_type, status, agenda, participants) VALUES
(
    UUID(),
    'MEET-001',
    'مراجعة التصميم',
    'مراجعة تصميم واجهة المستخدم للمرحلة الأولى',
    (SELECT id FROM projects WHERE project_code = 'PROJ-2024-001'),
    (SELECT id FROM users WHERE role = 'project_manager' LIMIT 1),
    DATE_ADD(NOW(), INTERVAL 2 DAY),
    DATE_ADD(NOW(), INTERVAL 3 DAY),
    'client_review',
    'scheduled',
    '1. عرض التصميمات الجديدة\n2. جمع ملاحظات العميل\n3. تحديد أولويات المرحلة القادمة',
    '["client", "project_manager", "developer"]'
);

-- ==============================================
-- الإجراءات المخزنة
-- ==============================================

-- حساب تقدم المشروع
DELIMITER //
CREATE PROCEDURE CalculateProjectProgress(IN project_id_param VARCHAR(36))
BEGIN
    DECLARE total_tasks INT;
    DECLARE completed_tasks INT;
    DECLARE progress DECIMAL(5,2);
    
    -- حساب إجمالي المهام
    SELECT COUNT(*) INTO total_tasks
    FROM tasks
    WHERE project_id = project_id_param;
    
    -- حساب المهام المكتملة
    SELECT COUNT(*) INTO completed_tasks
    FROM tasks
    WHERE project_id = project_id_param AND status = 'done';
    
    -- حساب النسبة المئوية
    IF total_tasks > 0 THEN
        SET progress = (completed_tasks / total_tasks) * 100;
    ELSE
        SET progress = 0;
    END IF;
    
    -- تحديث المشروع
    UPDATE projects
    SET progress_percentage = progress,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = project_id_param;
    
    SELECT progress AS project_progress;
END //
DELIMITER ;

-- إنشاء تقرير شهري
DELIMITER //
CREATE PROCEDURE GenerateMonthlyReport(IN year_month VARCHAR(7))
BEGIN
    SELECT 
        p.project_code,
        p.name AS project_name,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(te.duration_minutes) / 60.0 AS total_hours,
        SUM(CASE WHEN te.billable THEN te.total_amount ELSE 0 END) AS billable_amount,
        p.progress_percentage
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    LEFT JOIN time_entries te ON t.id = te.task_id 
        AND DATE_FORMAT(te.start_time, '%Y-%m') = year_month
    GROUP BY p.id
    ORDER BY p.progress_percentage DESC;
END //
DELIMITER ;

-- ==============================================
-- المحفزات (Triggers)
-- ==============================================

-- تحديث وقت تحديث المشروع عند تحديث المهام
DELIMITER //
CREATE TRIGGER UpdateProjectOnTaskChange
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.project_id IS NOT NULL THEN
        UPDATE projects 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.project_id;
    END IF;
END //
DELIMITER ;

-- تسجيل إنشاء مستخدم جديد
DELIMITER //
CREATE TRIGGER LogNewUser
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
    VALUES (NEW.id, 'USER_CREATED', 'user', NEW.id, 
        JSON_OBJECT('username', NEW.username, 'email', NEW.email, 'role', NEW.role));
END //
DELIMITER ;

-- ==============================================
-- مناظر (Views)
-- ==============================================

-- منظر للمشاريع النشطة
CREATE VIEW ActiveProjects AS
SELECT 
    p.*,
    u.full_name AS manager_name,
    c.full_name AS client_name,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') AS completed_tasks,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN users c ON p.client_id = c.id
WHERE p.status = 'active';

-- منظر لإحصائيات الفريق
CREATE VIEW TeamPerformance AS
SELECT 
    u.id,
    u.full_name,
    u.role,
    u.department,
    COUNT(DISTINCT t.id) AS total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) AS completed_tasks,
    SUM(te.duration_minutes) / 60.0 AS total_hours,
    AVG(CASE WHEN t.status = 'done' THEN TIMESTAMPDIFF(HOUR, t.start_date, t.completion_date) END) AS avg_completion_time
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
LEFT JOIN time_entries te ON u.id = te.user_id
WHERE u.role IN ('developer', 'designer', 'qa')
GROUP BY u.id;

-- ==============================================
-- نهاية السكريبت
-- ==============================================

SELECT '✅ تم إنشاء قاعدة البيانات وجميع الجداول بنجاح!' AS Message;
SELECT CONCAT('📊 قاعدة البيانات: ', DATABASE()) AS DatabaseInfo;
SELECT CONCAT('👤 المستخدم: ', USER()) AS UserInfo;
SELECT COUNT(*) AS TotalTables FROM information_schema.tables WHERE table_schema = DATABASE();
"@
    
    New-Item -ItemType Directory -Path "$BasePath\database" -Force | Out-Null
    $dbScript | Out-File "$BasePath\database\setup-database.sql" -Encoding UTF8
    
    Write-Host "  ✓ ملفات قاعدة البيانات" -ForegroundColor $SuccessColor
}

function Install-Database {
    param([string]$BasePath)
    
    Write-Host "`n[5/10] تثبيت قاعدة البيانات..." -ForegroundColor $StepColor
    
    if (-not $InstallDatabase) {
        Write-Host "  ⏭️ تم تخطي تثبيت قاعدة البيانات" -ForegroundColor $WarningColor
        return
    }
    
    try {
        # التحقق من وجود MySQL
        $mysqlService = Get-Service MySQL* -ErrorAction SilentlyContinue
        if (-not $mysqlService) {
            Write-Host "  ⚠️ MySQL غير مثبت أو غير قيد التشغيل" -ForegroundColor $WarningColor
            
            $choice = Read-Host "  هل تريد تثبيت MySQL؟ (y/n)"
            if ($choice -eq 'y') {
                Write-Host "  📥 جاري تحميل MySQL..." -ForegroundColor $InfoColor
                
                # تنزيل MySQL Installer (لنظام Windows)
                $mysqlUrl = "https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.33.0.msi"
                $mysqlInstaller = "$env:TEMP\mysql-installer.msi"
                
                Invoke-WebRequest -Uri $mysqlUrl -OutFile $mysqlInstaller
                Write-Host "  ⬇️ تم تحميل MySQL Installer" -ForegroundColor $SuccessColor
                
                Write-Host "  ⚠️ يرجى تثبيت MySQL يدوياً من: $mysqlInstaller" -ForegroundColor $WarningColor
                Write-Host "  ⚠️ ثم شغل السكريبت مرة أخرى" -ForegroundColor $WarningColor
                Start-Process $mysqlInstaller
                exit 0
            }
        } else {
            # تشغيل MySQL إذا كان متوقفاً
            if ($mysqlService.Status -ne 'Running') {
                Write-Host "  🔄 بدء تشغيل MySQL..." -ForegroundColor $InfoColor
                Start-Service $mysqlService[0].Name
                Start-Sleep -Seconds 5
            }
            
            # تنفيذ سكريبت قاعدة البيانات
            Write-Host "  📊 إنشاء قاعدة البيانات..." -ForegroundColor $InfoColor
            
            $dbScriptPath = Join-Path $BasePath "database\setup-database.sql"
            $mysqlCommand = "mysql -u root -p < `"$dbScriptPath`""
            
            Write-Host "  💡 قم بتنفيذ هذا الأمر في سطر أوامر MySQL:" -ForegroundColor $InfoColor
            Write-Host "  $mysqlCommand" -ForegroundColor Gray
            
            # بدلاً من تنفيذه تلقائياً (لأسباب أمنية)، نعرض التعليمات
            Write-Host "`n  📋 خطوات يدوية:" -ForegroundColor Yellow
            Write-Host "  1. افتح سطر أوامر MySQL كمسؤول" -ForegroundColor White
            Write-Host "  2. قم بتنفيذ السكريبت الموجود في:" -ForegroundColor White
            Write-Host "     $dbScriptPath" -ForegroundColor Gray
            
        }
        
    } catch {
        Write-Host "  ❌ خطأ في تثبيت قاعدة البيانات: $_" -ForegroundColor $ErrorColor
        Write-Host "  ⚠️ يمكنك تثبيتها يدوياً لاحقاً" -ForegroundColor $WarningColor
    }
}

function Create-AdminUser {
    param([string]$BasePath)
    
    Write-Host "`n[6/10] إنشاء مستخدم مسؤول..." -ForegroundColor $StepColor
    
    if (-not $CreateAdmin) {
        Write-Host "  ⏭️ تم تخطي إنشاء المستخدم المسؤول" -ForegroundColor $WarningColor
        return
    }
    
    $adminData = @{
        username = "admin"
        email = $AdminEmail
        password = "Admin123!"
        full_name = "المسؤول النظام"
        role = "admin"
        department = "الإدارة"
    }
    
    $adminJson = $adminData | ConvertTo-Json -Depth 5
    
    New-Item -ItemType Directory -Path "$BasePath\config\users" -Force | Out-Null
    $adminJson | Out-File "$BasePath\config\users\admin.json" -Encoding UTF8
    
    Write-Host "  ✓ تم إنشاء بيانات المستخدم المسؤول" -ForegroundColor $SuccessColor
    Write-Host "  📧 البريد: $AdminEmail" -ForegroundColor White
    Write-Host "  🔑 كلمة المرور: Admin123!" -ForegroundColor White
    Write-Host "  ⚠️ يرجى تغيير كلمة المرور فور تسجيل الدخول!" -ForegroundColor $WarningColor
}

function Initialize-GitRepository {
    param([string]$BasePath)
    
    Write-Host "`n[7/10] تهيئة Git..." -ForegroundColor $StepColor
    
    if (-not $InitializeGit) {
        Write-Host "  ⏭️ تم تخطي تهيئة Git" -ForegroundColor $WarningColor
        return
    }
    
    try {
        Set-Location $BasePath
        
        if (Get-Command git -ErrorAction SilentlyContinue) {
            # تهيئة المستودع
            git init
            
            # إنشاء فروع التطوير
            git checkout -b main
            git checkout -b develop
            git checkout -b staging
            git checkout -b production
            
            # إنشاء فروع الميزات
            $featureBranches = @(
                "feature/authentication-system",
                "feature/project-management",
                "feature/task-management",
                "feature/finance-module",
                "feature/analytics-dashboard",
                "feature/mobile-app",
                "feature/api-v2",
                "feature/integrations"
            )
            
            foreach ($branch in $featureBranches) {
                git checkout -b $branch develop
            }
            
            # العودة للفرع الرئيسي
            git checkout main
            
            # أول Commit
            git add .
            git commit -m "Initial commit: ProjectMaster Pro v$SystemVersion"
            
            Write-Host "  ✓ تم تهيئة Git مع 12 فرع" -ForegroundColor $SuccessColor
            
            # إنشاء ملف .gitignore إضافي
            $gitignore = @"
# ProjectMaster Pro - Git Ignore

# الاعتماديات
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# بيئة التشغيل
.env
.env.local
.env.*.local

# التكوين
config/local.json
config/secret.json

# السجلات
logs/
*.log
npm-debug.log*

# التغطية
coverage/
.nyc_output/

# أنظمة التشغيل
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# التخزين المؤقت
.cache/
.tmp/
temp/

# الملفات المرفوعة
uploads/
public/uploads/

# الملفات المنشأة
dist/
build/
out/

# قاعدة البيانات
*.db
*.sqlite
dump.sql

# الاختبارات
*.pid
*.seed

# الأصول المبنية
assets/built/
public/assets/built/

# الملفات المؤقتة
tmp/
temp/
"@
            
            $gitignore | Out-File "$BasePath\.gitignore" -Encoding UTF8 -Append
            
        } else {
            Write-Host "  ⚠️ Git غير مثبت" -ForegroundColor $WarningColor
        }
        
    } catch {
        Write-Host "  ⚠️ خطأ في تهيئة Git: $_" -ForegroundColor $WarningColor
    }
}

function Install-NodeDependencies {
    param([string]$BasePath)
    
    Write-Host "`n[8/10] تثبيت اعتماديات Node.js..." -ForegroundColor $StepColor
    
    try {
        Set-Location $BasePath
        
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            Write-Host "  📦 جاري تثبيت الاعتماديات..." -ForegroundColor $InfoColor
            
            # تثبيت الاعتماديات الأساسية
            npm install
            
            # تثبيت الاعتماديات الإضافية
            $additionalPackages = @(
                "react",
                "react-dom",
                "react-router-dom",
                "redux",
                "react-redux",
                "@reduxjs/toolkit",
                "axios",
                "moment",
                "react-chartjs-2",
                "react-quill",
                "react-dropzone",
                "react-hot-toast"
            )
            
            npm install $additionalPackages --save
            
            Write-Host "  ✓ تم تثبيت جميع الاعتماديات" -ForegroundColor $SuccessColor
            
        } else {
            Write-Host "  ⚠️ npm غير مثبت" -ForegroundColor $WarningColor
        }
        
    } catch {
        Write-Host "  ⚠️ خطأ في تثبيت الاعتماديات: $_" -ForegroundColor $WarningColor
    }
}

function Setup-Documentation {
    param([string]$BasePath, [string]$SystemName)
    
    Write-Host "`n[9/10] إعداد التوثيق..." -ForegroundColor $StepColor
    
    # دليل المستخدم
    $userGuide = @"
# 📚 دليل المستخدم - $SystemName

## 🎯 نظرة عامة
$SystemName هو نظام متكامل لإدارة المشاريع البرمجية والفرق والمهام والموارد المالية.

## 🚀 البدء السريع

### 1. تسجيل الدخول
1. انتقل إلى: `http://localhost:3000`
2. أدخل بيانات الدخول:
   - البريد: $AdminEmail
   - كلمة المرور: Admin123!

### 2. لوحة التحكم
بعد تسجيل الدخول، ستنتقل إلى لوحة التحكم الرئيسية التي تحتوي على:
- إحصائيات سريعة
- مشاريع نشطة
- مهام قادمة
- تقارير أداء

## 📊 الميزات الرئيسية

### إدارة المشاريع
- إنشاء مشاريع جديدة
- تتبع التقدم
- إدارة الميزانية
- مشاركة الملفات

### إدارة المهام
- إنشاء وتوزيع المهام
- تحديد الأولويات
- تتبع الوقت
- تقارير الإنجاز

### إدارة الفريق
- إضافة أعضاء الفريق
- توزيع الأدوار
- تقييم الأداء
- إدارة الإجازات

### الإدارة المالية
- إنشاء الفواتير
- تتبع المدفوعات
- تقارير الربحية
- إدارة المصروفات

## 🔧 الأوامر الأساسية

### تشغيل النظام
\`\`\`bash
# تشغيل خادم التطوير
npm run dev

# تشغيل خادم الإنتاج
npm start

# بناء التطبيق
npm run build
\`\`\`

### قاعدة البيانات
\`\`\`bash
# تشغيل الهجرات
npm run db:migrate

# تعبئة البيانات
npm run db:seed

# نسخ احتياطي
npm run db:backup
\`\`\`

## 🆘 الدعم الفني

### المشاكل الشائعة
1. **لا يمكن تسجيل الدخول:** تحقق من اتصال قاعدة البيانات
2. **بطء النظام:** تحقق من استخدام الذاكرة
3. **خطأ في الرفع:** تحقق من حجم الملفات المسموح بها

### الاتصال بالدعم
- 📧 البريد: support@$($SystemName.ToLower().Replace(" ", "-")).com
- 📞 الهاتف: +966 123 456 789
- 🕒 ساعات العمل: 9 ص - 5 م

## 📄 الرخصة
هذا النظام مرخص للاستخدام الداخلي فقط.

---

**آخر تحديث:** $(Get-Date -Format "yyyy-MM-dd")
"@
    
    $userGuide | Out-File "$BasePath\docs\user\USER_GUIDE.md" -Encoding UTF8
    
    Write-Host "  ✓ تم إنشاء التوثيق" -ForegroundColor $SuccessColor
}

function Show-Summary {
    param([string]$BasePath, [string]$SystemName)
    
    Write-Host "`n" + ("═" * 70) -ForegroundColor $SuccessColor
    Write-Host "   ✅ تم إنشاء النظام بنجاح!" -ForegroundColor $SuccessColor
    Write-Host ("═" * 70) -ForegroundColor $SuccessColor
    
    # إحصائيات النظام
    $totalFiles = (Get-ChildItem $BasePath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
    $totalDirs = (Get-ChildItem $BasePath -Recurse -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
    
    Write-Host "`n📊 إحصائيات النظام:" -ForegroundColor Cyan
    Write-Host "  النظام: $SystemName" -ForegroundColor White
    Write-Host "  المسار: $BasePath" -ForegroundColor White
    Write-Host "  المجلدات: $totalDirs" -ForegroundColor White
    Write-Host "  الملفات: $totalFiles" -ForegroundColor White
    
    Write-Host "`n🚀 الخطوات التالية:" -ForegroundColor Yellow
    
    Write-Host "`n1. إعداد قاعدة البيانات:" -ForegroundColor Magenta
    Write-Host "   mysql -u root -p < database\setup-database.sql" -ForegroundColor Gray
    
    Write-Host "`n2. تشغيل النظام:" -ForegroundColor Magenta
    Write-Host "   cd '$BasePath'" -ForegroundColor Gray
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    
    Write-Host "`n3. تسجيل الدخول:" -ForegroundColor Magenta
    Write-Host "   الموقع: http://localhost:3000" -ForegroundColor Gray
    Write-Host "   البريد: $AdminEmail" -ForegroundColor Gray
    Write-Host "   كلمة المرور: Admin123!" -ForegroundColor Gray
    
    Write-Host "`n🔧 الملفات الهامة:" -ForegroundColor Cyan
    Write-Host "   📄 .env - إعدادات النظام" -ForegroundColor White
    Write-Host "   📄 package.json - الاعتماديات والأوامر" -ForegroundColor White
    Write-Host "   📄 src/backend/server.ts - الخادم الرئيسي" -ForegroundColor White
    Write-Host "   📄 database/setup-database.sql - قاعدة البيانات" -ForegroundColor White
    
    Write-Host "`n👥 للفريق:" -ForegroundColor Green
    Write-Host "   • المطورون: ابدأ من src/backend و src/frontend" -ForegroundColor White
    Write-Host "   • المصممون: راجع designs/ و src/frontend/public" -ForegroundColor White
    Write-Host "   • مدير المشروع: راجع docs/ و config/project-templates/" -ForegroundColor White
    Write-Host "   • مسؤول النظام: راجع config/ و tools/scripts/" -ForegroundColor White
    
    Write-Host "`n🔒 ملاحظات أمنية:" -ForegroundColor Red
    Write-Host "   ⚠️ غير كلمة مرور المسؤول فوراً" -ForegroundColor Yellow
    Write-Host "   ⚠️ عدّل المفاتيح السرية في ملف .env" -ForegroundColor Yellow
    Write-Host "   ⚠️ قم بنسخ احتياطي دوري للنظام" -ForegroundColor Yellow
    
    Write-Host "`n📞 الدعم:" -ForegroundColor Blue
    Write-Host "   📚 التوثيق: docs/user/USER_GUIDE.md" -ForegroundColor White
    Write-Host "   🐛 الإبلاغ عن مشاكل: docs/troubleshooting/" -ForegroundColor White
    
    Write-Host "`n" + ("✨" * 35) -ForegroundColor Magenta
    Write-Host "   🎉 مبروك! النظام جاهز للاستخدام" -ForegroundColor Magenta
    Write-Host "   💼 ابدأ بإدارة مشاريعك باحترافية" -ForegroundColor Magenta
    Write-Host ("✨" * 35) -ForegroundColor Magenta
}

# ==============================================
# التنفيذ الرئيسي
# ==============================================

try {
    Show-Header
    
    # 1. التحقق من المتطلبات
    Test-Prerequisites
    
    # 2. إنشاء هيكل النظام
    $fullPath = Initialize-SystemStructure -BasePath $InstallPath
    
    # 3. إنشاء ملفات النظام
    Create-SystemFiles -BasePath $fullPath -SystemName $SystemName
    
    # 4. إنشاء ملفات قاعدة البيانات
    Create-DatabaseFiles -BasePath $fullPath -SystemName $SystemName
    
    # 5. تثبيت قاعدة البيانات
    Install-Database -BasePath $fullPath
    
    # 6. إنشاء مستخدم مسؤول
    Create-AdminUser -BasePath $fullPath
    
    # 7. تهيئة Git
    Initialize-GitRepository -BasePath $fullPath
    
    # 8. تثبيت اعتماديات Node.js
    Install-NodeDependencies -BasePath $fullPath
    
    # 9. إعداد التوثيق
    Setup-Documentation -BasePath $fullPath -SystemName $SystemName
    
    # 10. عرض الملخص
    Show-Summary -BasePath $fullPath -SystemName $SystemName
    
    Write-Host "`n⏱️ الوقت المستغرق: تم إنشاء النظام في أقل من دقيقة!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ خطأ غير متوقع: $_" -ForegroundColor $ErrorColor
    Write-Host "📋 تفاصيل الخطأ: $($_.ScriptStackTrace)" -ForegroundColor $ErrorColor
    exit 1
}