// backend/server.js - MongoDB Atlas Ready
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// تنظيف النماذج المكررة
Object.keys(mongoose.models).forEach(key => {
    delete mongoose.models[key];
});

// Helper function to safely get or create models
function getOrCreateModel(modelName, schemaDefinition) {
    try {
        // Try to get existing model
        return mongoose.model(modelName);
    } catch (error) {
        // If doesn't exist, create it
        const schema = new mongoose.Schema(schemaDefinition);
        return mongoose.model(modelName, schema);
    }
}

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Create necessary directories
const directories = ['uploads', 'logs', 'backups'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${req.method} ${req.url} - IP: ${req.ip}`;
    console.log(logMessage);
    
    if (process.env.LOG_TO_FILE === 'true') {
        fs.appendFileSync('logs/access.log', logMessage + '\n');
    }
    
    next();
});

// ==================== DATABASE CONNECTION ====================
console.log('🔗 Initializing MongoDB Atlas connection...');
console.log(`📊 Cluster: cluster0.1olgyvi.mongodb.net`);
console.log(`👤 User: abdallahreda1969_db_user`);

const MONGODB_URI = process.env.DB_URI || 'mongodb+srv://abdallahreda1969_db_user:ilSr4GuErWpwetmE@cluster0.1olgyvi.mongodb.net/projectmaster?retryWrites=true&w=majority';

const mongooseOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10
};

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(async () => {
        console.log('✅ SUCCESS: Connected to MongoDB Atlas');
        console.log(`📁 Database: ${mongoose.connection.db?.databaseName || 'projectmaster'}`);
        console.log(`📍 Host: ${mongoose.connection.host}`);
        console.log(`🎯 Port: ${mongoose.connection.port || '27017 (SRV)'}`);
        
        await initializeDatabase();
        startExpressServer();
    })
    .catch(err => {
        console.error('❌ MongoDB Atlas connection failed:', err.message);
        console.log('\n⚠️  Starting server in limited mode (without database)...');
        startExpressServer(false);
    });

// Database initialization
async function initializeDatabase() {
    try {
        const db = mongoose.connection.db;
        
        const requiredCollections = [
            'users', 'projects', 'tasks', 'teams',
            'invoices', 'time_entries', 'documents',
            'notifications', 'system_logs'
        ];
        
        console.log('\n📦 Initializing database collections...');
        
        const existingCollections = await db.listCollections().toArray();
        const existingNames = existingCollections.map(c => c.name);
        
        for (const collection of requiredCollections) {
            if (!existingNames.includes(collection)) {
                await db.createCollection(collection);
                console.log(`   ✅ Created: ${collection}`);
            } else {
                console.log(`   📁 Exists: ${collection}`);
            }
        }
        
        await createIndexes(db);
        await createAdminUser();
        
        console.log('🎉 Database initialization completed!');
        
    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
    }
}

// Create database indexes
async function createIndexes(db) {
    console.log('\n🔍 Creating database indexes...');
    
    const indexes = [
        { collection: 'users', field: 'email', unique: true },
        { collection: 'users', field: 'username', unique: true },
        { collection: 'projects', field: 'projectCode', unique: true },
        { collection: 'tasks', field: 'taskCode', unique: true },
        { collection: 'invoices', field: 'invoiceNumber', unique: true }
    ];
    
    for (const index of indexes) {
        try {
            await db.collection(index.collection).createIndex(
                { [index.field]: 1 },
                { unique: index.unique || false }
            );
            console.log(`   ✅ Index: ${index.collection}.${index.field}`);
        } catch (error) {
            console.log(`   ⚠️  Index exists: ${index.collection}.${index.field}`);
        }
    }
}

// Create admin user
async function createAdminUser() {
    const userSchema = new mongoose.Schema({
        username: { type: String, unique: true },
        email: { type: String, unique: true },
        password: String,
        fullName: String,
        role: { type: String, default: 'user' },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.model('User', userSchema);
    
    const adminEmail = 'admin@projectmaster.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
        const simpleHash = Buffer.from('Admin123!').toString('base64');
        
        await User.create({
            username: 'admin',
            email: adminEmail,
            password: simpleHash,
            fullName: 'System Administrator',
            role: 'admin',
            isActive: true
        });
        
        console.log('\n👑 Admin user created:');
        console.log('   📧 Email: admin@projectmaster.com');
        console.log('   🔑 Password: Admin123!');
        console.log('   ⚠️ SECURITY: Change password immediately!');
    } else {
        console.log('\n👑 Admin user already exists');
    }
}

// Start Express server
function startExpressServer(dbConnected = true) {

    // ==================== HOME ROUTES ====================
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
    });

    app.get('/dashboard', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/public/dashboard.html'));
    });

    // ==================== API STATUS ====================
    app.get('/api', (req, res) => {
        res.json({
            success: true,
            message: '🚀 ProjectMaster Pro API',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            database: {
                connected: dbConnected,
                name: dbConnected ? (mongoose.connection.db?.databaseName || 'projectmaster') : 'Not connected',
                cluster: 'MongoDB Atlas',
                host: mongoose.connection.host
            },
            status: 'operational'
        });
    });

    app.get('/api/health', (req, res) => {
        const dbStatus = mongoose.connection.readyState;
        const statusCodes = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        res.json({
            status: dbStatus === 1 ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: {
                state: statusCodes[dbStatus] || 'unknown',
                connected: dbStatus === 1,
                cluster: 'Atlas',
                host: mongoose.connection.host
            },
            system: {
                platform: process.platform,
                node_version: process.version,
                env: process.env.NODE_ENV || 'development'
            }
        });
    });

    app.get('/api/system/info', (req, res) => {
        res.json({
            app: process.env.APP_NAME || 'ProjectMaster Pro',
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            port: PORT,
            database: {
                type: 'MongoDB Atlas',
                connected: dbConnected,
                cluster: 'cluster0.1olgyvi.mongodb.net'
            },
            features: [
                'Project Management',
                'Task Tracking',
                'Team Collaboration',
                'Financial Management',
                'Document Storage'
            ]
        });
    });

    app.get('/api/database/test', async (req, res) => {
        try {
            if (!dbConnected) {
                throw new Error('Database not connected');
            }
            
            const db = mongoose.connection.db;
            const stats = await db.stats();
            const collections = await db.listCollections().toArray();
            
            res.json({
                success: true,
                message: '✅ Database connection successful',
                database: {
                    name: stats.db,
                    collections: collections.length,
                    objects: stats.objects,
                    dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
                    storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
                    indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`
                },
                cluster: {
                    host: mongoose.connection.host,
                    port: mongoose.connection.port
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '❌ Database test failed',
                error: error.message
            });
        }
    });

    app.get('/api/database/collections', async (req, res) => {
        try {
            if (!dbConnected) {
                throw new Error('Database not connected');
            }
            
            const collections = await mongoose.connection.db.listCollections().toArray();
            
            res.json({
                success: true,
                count: collections.length,
                collections: collections.map(c => ({
                    name: c.name,
                    type: c.type
                }))
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '❌ Failed to list collections',
                error: error.message
            });
        }
    });

    // ==================== USERS ROUTES ====================
    
    // GET /api/users - جلب جميع المستخدمين
    app.get('/api/users', async (req, res) => {
        try {
            if (!dbConnected) {
                return res.status(503).json({
                    success: false,
                    message: 'قاعدة البيانات غير متصلة'
                });
            }
            
            let User;
            try {
                User = mongoose.model('User');
            } catch (error) {
                const userSchema = new mongoose.Schema({
                    username: String,
                    email: String,
                    fullName: String,
                    role: String,
                    isActive: Boolean,
                    createdAt: Date
                });
                User = mongoose.model('User', userSchema);
            }
            
            const users = await User.find().select('-password');
            
            res.json({
                success: true,
                count: users.length,
                users: users
            });
        } catch (error) {
            console.error('Error in GET /api/users:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب المستخدمين',
                error: error.message
            });
        }
    });

    // GET /api/users/count - عدد المستخدمين
    app.get('/api/users/count', async (req, res) => {
        try {
            if (!dbConnected) {
                return res.status(503).json({
                    success: false,
                    message: 'قاعدة البيانات غير متصلة'
                });
            }
            
            const User = getOrCreateModel('User', {
                username: String,
                email: String,
                password: String,
                fullName: String,
                role: String,
                isActive: Boolean,
                createdAt: Date
            });
            
            const count = await User.countDocuments();
            
            res.json({
                success: true,
                count: count
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '❌ Failed to count users',
                error: error.message
            });
        }
    });

    // ==================== PROJECTS ROUTES ====================

    // تعريف نموذج المشروع
    let Project;
    try {
        Project = mongoose.model('Project');
    } catch (error) {
        const projectSchema = new mongoose.Schema({
            name: { type: String, required: true },
            description: String,
            status: { type: String, default: 'active' },
            projectCode: { type: String, unique: true },
            budget: Number,
            progress: { type: Number, default: 0 },
            startDate: Date,
            endDate: Date,
            clientName: String,
            clientEmail: String,
            priority: { type: String, default: 'medium' },
            createdAt: { type: Date, default: Date.now }
        });
        Project = mongoose.model('Project', projectSchema);
    }

    // GET /api/projects - جلب جميع المشاريع
    app.get('/api/projects', async (req, res) => {
        try {
            if (!dbConnected) {
                return res.status(503).json({
                    success: false,
                    message: 'قاعدة البيانات غير متصلة'
                });
            }
            
            const projects = await Project.find().sort({ createdAt: -1 });
            
            res.json({
                success: true,
                count: projects.length,
                projects: projects
            });
        } catch (error) {
            console.error('Error in GET /api/projects:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب المشاريع',
                error: error.message
            });
        }
    });

    // GET /api/projects/stats - إحصائيات المشاريع
    app.get('/api/projects/stats', async (req, res) => {
    console.time('projects-stats'); // <-- أضف هذا السطر هنا
    try {
        if (!dbConnected) {
            return res.status(503).json({
                success: false,
                message: 'قاعدة البيانات غير متصلة'
            });
        }
        
        const total = await Project.countDocuments();
        const active = await Project.countDocuments({ status: 'active' });
        const completed = await Project.countDocuments({ status: 'completed' });
        const onHold = await Project.countDocuments({ status: 'on-hold' });
        
        const projects = await Project.find();
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        
        console.timeEnd('projects-stats'); // <-- أضف هذا السطر هنا
        
        res.json({
            success: true,
            stats: {
                total,
                active,
                completed,
                onHold,
                totalBudget
            }
        });
    } catch (error) {
        console.timeEnd('projects-stats'); // <-- وأيضاً هنا في حالة الخطأ
        console.error('Error in GET /api/projects/stats:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات المشاريع',
            error: error.message
        });
    }
});

    // POST /api/projects - إنشاء مشروع جديد
    app.post('/api/projects', express.json(), async (req, res) => {
        try {
            console.log('📝 بيانات المشروع المستلمة:', req.body);
            
            if (!dbConnected) {
                return res.status(503).json({
                    success: false,
                    message: 'قاعدة البيانات غير متصلة'
                });
            }
            
            // إنشاء كود مشروع فريد
            let projectCode;
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;

            while (!isUnique && attempts < maxAttempts) {
                attempts++;
                const year = new Date().getFullYear();
                const randomNum = Math.floor(Math.random() * 9000) + 1000;
                projectCode = `PROJ-${year}-${randomNum}`;
                
                const existing = await Project.findOne({ projectCode });
                if (!existing) {
                    isUnique = true;
                }
            }

            if (!isUnique) {
                projectCode = `PROJ-${Date.now()}`;
            }
            
            console.log('📋 كود المشروع الجديد:', projectCode);
            
            const projectData = {
                name: req.body.name || 'مشروع جديد',
                description: req.body.description || '',
                status: req.body.status || 'active',
                projectCode: projectCode,
                budget: req.body.budget || 0,
                progress: req.body.progress || 0,
                startDate: req.body.startDate || null,
                endDate: req.body.endDate || null,
                clientName: req.body.clientName || '',
                clientEmail: req.body.clientEmail || '',
                priority: req.body.priority || 'medium',
                createdAt: new Date()
            };
            
            console.log('💾 حفظ المشروع:', projectData);
            
            const project = new Project(projectData);
            await project.save();
            
            console.log('✅ تم إنشاء المشروع بنجاح:', project._id);
            
            res.status(201).json({
                success: true,
                message: 'تم إنشاء المشروع بنجاح',
                project: project
            });
        } catch (error) {
            console.error('❌ خطأ في إنشاء المشروع:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إنشاء المشروع',
                error: error.message
            });
        }
    });

    // PUT /api/projects/:id - تحديث مشروع
    app.put('/api/projects/:id', express.json(), async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updatedAt: new Date() },
                { new: true }
            );
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'المشروع غير موجود'
                });
            }
            
            res.json({
                success: true,
                message: 'تم تحديث المشروع بنجاح',
                project: project
            });
        } catch (error) {
            console.error('Error in PUT /api/projects/:id:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث المشروع',
                error: error.message
            });
        }
    });

    // DELETE /api/projects/:id - حذف مشروع
    app.delete('/api/projects/:id', async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const project = await Project.findByIdAndDelete(req.params.id);
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'المشروع غير موجود'
                });
            }
            
            res.json({
                success: true,
                message: 'تم حذف المشروع بنجاح'
            });
        } catch (error) {
            console.error('Error in DELETE /api/projects/:id:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في حذف المشروع',
                error: error.message
            });
        }
    });

    // POST /api/projects/sample - مشروع تجريبي
    app.post('/api/projects/sample', async (req, res) => {
        try {
            if (!dbConnected) {
                throw new Error('Database not connected');
            }
            
            const projectCount = await Project.countDocuments();
            const projectCode = `PROJ-${new Date().getFullYear()}-${(projectCount + 1).toString().padStart(4, '0')}`;
            
            const project = await Project.create({
                projectCode: projectCode,
                name: 'مشروع تجريبي - نظام إدارة المشاريع',
                description: 'هذا مشروع تجريبي لاختبار اتصال قاعدة البيانات مع MongoDB Atlas',
                status: 'active',
                budget: 10000,
                progress: 25
            });
            
            res.json({
                success: true,
                message: '✅ Sample project created successfully',
                project: project
            });
        } catch (error) {
            console.error('Error creating sample project:', error);
            res.status(500).json({
                success: false,
                message: '❌ Failed to create sample project',
                error: error.message
            });
        }
    });

   // ==================== TASKS ROUTES (نسخة مبسطة نهائية) ====================

// تعريف نموذج المهمة (بدون أي indices معقدة)
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'pending' },
    priority: { type: String, default: 'medium' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    projectName: { type: String, default: '' },
    assignee: { type: String, default: '' },
    dueDate: { type: Date, default: null },
    estimatedHours: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// إزالة أي indices قديمة (مهم جداً)
taskSchema.index({ title: 1 }); // فقط index بسيط للبحث

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// GET /api/tasks - جلب جميع المهام
app.get('/api/tasks', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ success: false, message: 'قاعدة البيانات غير متصلة' });
        }
        
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        console.error('Error in GET /api/tasks:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب المهام', error: error.message });
    }
});

// POST /api/tasks - إنشاء مهمة جديدة
app.post('/api/tasks', express.json(), async (req, res) => {
    try {
        console.log('📝 بيانات المهمة:', req.body);
        
        if (!dbConnected) {
            return res.status(503).json({ success: false, message: 'قاعدة البيانات غير متصلة' });
        }
        
        // التحقق من العنوان
        if (!req.body.title) {
            return res.status(400).json({ success: false, message: 'عنوان المهمة مطلوب' });
        }
        
        // إنشاء المهمة مباشرة
        const task = new Task({
            title: req.body.title,
            description: req.body.description || '',
            status: req.body.status || 'pending',
            priority: req.body.priority || 'medium',
            projectId: req.body.projectId || null,
            projectName: req.body.projectName || '',
            assignee: req.body.assignee || '',
            dueDate: req.body.dueDate || null,
            estimatedHours: req.body.estimatedHours || 0
        });
        
        await task.save();
        console.log('✅ تم إنشاء المهمة:', task._id);
        
        res.status(201).json({ success: true, message: 'تم إنشاء المهمة بنجاح', task });
    } catch (error) {
        console.error('❌ خطأ في إنشاء المهمة:', error);
        res.status(500).json({ success: false, message: 'خطأ في إنشاء المهمة', error: error.message });
    }
});

// PUT /api/tasks/:id - تحديث مهمة
app.put('/api/tasks/:id', express.json(), async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ success: false, message: 'قاعدة البيانات غير متصلة' });
        }
        
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!task) {
            return res.status(404).json({ success: false, message: 'المهمة غير موجودة' });
        }
        
        res.json({ success: true, message: 'تم تحديث المهمة بنجاح', task });
    } catch (error) {
        console.error('Error in PUT /api/tasks/:id:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث المهمة', error: error.message });
    }
});

// DELETE /api/tasks/:id - حذف مهمة
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ success: false, message: 'قاعدة البيانات غير متصلة' });
        }
        
        const task = await Task.findByIdAndDelete(req.params.id);
        
        if (!task) {
            return res.status(404).json({ success: false, message: 'المهمة غير موجودة' });
        }
        
        res.json({ success: true, message: 'تم حذف المهمة بنجاح' });
    } catch (error) {
        console.error('Error in DELETE /api/tasks/:id:', error);
        res.status(500).json({ success: false, message: 'خطأ في حذف المهمة', error: error.message });
    }
});

app.get('/api/tasks/stats', async (req, res) => {
    console.time('tasks-stats'); // <-- أضف هذا السطر هنا
    try {
        if (!dbConnected) {
            return res.status(503).json({ success: false, message: 'قاعدة البيانات غير متصلة' });
        }
        
        const total = await Task.countDocuments();
        const completed = await Task.countDocuments({ status: 'completed' });
        const inProgress = await Task.countDocuments({ status: 'in-progress' });
        const pending = await Task.countDocuments({ status: 'pending' });
        
        console.timeEnd('tasks-stats'); // <-- أضف هذا السطر هنا
        
        res.json({
            success: true,
            stats: { total, completed, inProgress, pending, highPriority: 0, overdue: 0 }
        });
    } catch (error) {
        console.timeEnd('tasks-stats'); // <-- وأيضاً هنا في حالة الخطأ
        console.error('Error in GET /api/tasks/stats:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إحصائيات المهام', error: error.message });
    }
});

    // ==================== INVOICES ROUTES ====================
// تعريف نموذج الفاتورة (بدون unique على invoice_number)
let Invoice;
try {
    Invoice = mongoose.model('Invoice');
} catch (error) {
    const invoiceSchema = new mongoose.Schema({
        invoiceNumber: { type: String }, // أزلنا unique: true
        clientName: String,
        clientEmail: String,
        clientPhone: String,
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        projectName: String,
        items: [{
            description: String,
            quantity: Number,
            unitPrice: Number,
            total: Number
        }],
        subtotal: Number,
        taxRate: Number,
        taxAmount: Number,
        discount: Number,
        total: Number,
        currency: { type: String, default: 'SAR' },
        status: { 
            type: String, 
            enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
            default: 'draft'
        },
        issueDate: Date,
        dueDate: Date,
        paidDate: Date,
        notes: String,
        createdAt: { type: Date, default: Date.now }
    });
    Invoice = mongoose.model('Invoice', invoiceSchema);
}
    // GET /api/invoices - جلب جميع الفواتير
    app.get('/api/invoices', async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const invoices = await Invoice.find().sort({ createdAt: -1 });
            
            res.json({
                success: true,
                count: invoices.length,
                invoices: invoices
            });
        } catch (error) {
            console.error('Error in GET /api/invoices:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب الفواتير',
                error: error.message
            });
        }
    });

    // GET /api/invoices/stats - إحصائيات الفواتير
    app.get('/api/invoices/stats', async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const total = await Invoice.countDocuments();
            const paid = await Invoice.countDocuments({ status: 'paid' });
            const sent = await Invoice.countDocuments({ status: 'sent' });
            const draft = await Invoice.countDocuments({ status: 'draft' });
            
            const invoices = await Invoice.find();
            const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
            const paidAmount = invoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + (inv.total || 0), 0);
            
            res.json({
                success: true,
                stats: {
                    total,
                    paid,
                    pending: sent,
                    overdue: 0,
                    draft,
                    totalAmount,
                    paidAmount
                }
            });
        } catch (error) {
            console.error('Error in GET /api/invoices/stats:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في جلب إحصائيات الفواتير',
                error: error.message
            });
        }
    });

    // POST /api/invoices - إنشاء فاتورة جديدة
    app.post('/api/invoices', express.json(), async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const count = await Invoice.countDocuments();
            const year = new Date().getFullYear();
            const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
            
            const invoiceData = {
                ...req.body,
                invoiceNumber,
                createdAt: new Date()
            };
            
            const invoice = new Invoice(invoiceData);
            await invoice.save();
            
            res.status(201).json({
                success: true,
                message: 'تم إنشاء الفاتورة بنجاح',
                invoice: invoice
            });
        } catch (error) {
            console.error('Error in POST /api/invoices:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إنشاء الفاتورة',
                error: error.message
            });
        }
    });

    // PUT /api/invoices/:id - تحديث فاتورة
    app.put('/api/invoices/:id', express.json(), async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const invoice = await Invoice.findByIdAndUpdate(
                req.params.id,
                { ...req.body },
                { new: true }
            );
            
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'الفاتورة غير موجودة'
                });
            }
            
            res.json({
                success: true,
                message: 'تم تحديث الفاتورة بنجاح',
                invoice: invoice
            });
        } catch (error) {
            console.error('Error in PUT /api/invoices/:id:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث الفاتورة',
                error: error.message
            });
        }
    });

    // DELETE /api/invoices/:id - حذف فاتورة
    app.delete('/api/invoices/:id', async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const invoice = await Invoice.findByIdAndDelete(req.params.id);
            
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'الفاتورة غير موجودة'
                });
            }
            
            res.json({
                success: true,
                message: 'تم حذف الفاتورة بنجاح'
            });
        } catch (error) {
            console.error('Error in DELETE /api/invoices/:id:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في حذف الفاتورة',
                error: error.message
            });
        }
    });

    // PATCH /api/invoices/:id/status - تحديث حالة الفاتورة
    app.patch('/api/invoices/:id/status', express.json(), async (req, res) => {
        try {
            if (!dbConnected) throw new Error('Database not connected');
            
            const { status } = req.body;
            
            const updateData = { status };
            if (status === 'paid') {
                updateData.paidDate = new Date();
            }
            
            const invoice = await Invoice.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );
            
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'الفاتورة غير موجودة'
                });
            }
            
            res.json({
                success: true,
                message: 'تم تحديث حالة الفاتورة',
                invoice: invoice
            });
        } catch (error) {
            console.error('Error in PATCH /api/invoices/:id/status:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث حالة الفاتورة',
                error: error.message
            });
        }
    });

    // ==================== FARM ROUTES ====================
    const farmRoutes = require('./routes/farms');
    app.use('/api/farms', farmRoutes);

    // ==================== ERROR HANDLING ====================

    // 404 Handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: '🔍 Route not found',
            path: req.url,
            method: req.method,
            available_routes: [
                'GET  /                      - Home page',
                'GET  /dashboard             - Dashboard',
                'GET  /api                   - API status',
                'GET  /api/health            - System health',
                'GET  /api/system/info       - System info',
                'GET  /api/database/test     - Test database',
                'GET  /api/database/collections - List collections',
                'GET  /api/users             - Get all users',
                'GET  /api/users/count       - Count users',
                'GET  /api/projects          - Get all projects',
                'GET  /api/projects/stats    - Project statistics',
                'POST /api/projects           - Create project',
                'POST /api/projects/sample    - Create sample project',
                'GET  /api/tasks              - Get all tasks',
                'GET  /api/tasks/stats        - Task statistics',
                'POST /api/tasks               - Create task',
                'GET  /api/invoices           - Get all invoices',
                'GET  /api/invoices/stats     - Invoice statistics',
                'POST /api/invoices            - Create invoice',
                'GET  /api/farms              - Get all farms',
                'POST /api/farms              - Add new farm',
                'GET  /api/farms/:id          - Get farm details',
                'GET  /api/farms/:id/ndvi     - Get NDVI readings',
                'POST /api/farms/:id/ndvi     - Add NDVI reading',
                'GET  /api/farms/:id/weather  - Get weather records'
            ]
        });
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error('❌ Server error:', err);
        
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            ip: req.ip
        };
        
        if (process.env.LOG_TO_FILE === 'true') {
            fs.appendFileSync('logs/errors.log', JSON.stringify(errorLog) + '\n');
        }
        
        res.status(500).json({
            success: false,
            message: '🚨 Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
        });
    });

    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 السيرفر يعمل على http://0.0.0.0:${PORT}`);
        console.log('\n' + '='.repeat(60));
        console.log('🚀 PROJECTMASTER PRO - MONGODB ATLAS EDITION');
        console.log('='.repeat(60));
        console.log(`🌐 Frontend: http://localhost:${PORT}`);
        console.log(`🔧 API: http://localhost:${PORT}/api`);
        console.log(`📊 Health: http://localhost:${PORT}/api/health`);
        console.log(`📁 Database: ${dbConnected ? '✅ Connected' : '❌ Not connected'}`);
        console.log('='.repeat(60));
        console.log('\n📋 Available endpoints:');
        console.log('   /                    - Home page');
        console.log('   /dashboard           - Dashboard');
        console.log('   /api                 - API status');
        console.log('   /api/health          - System health check');
        console.log('   /api/users/count     - Count users');
        console.log('   /api/users           - Get all users');
        console.log('   /api/projects        - Get all projects');
        console.log('   /api/projects/stats  - Project statistics');
        console.log('   /api/tasks           - Get all tasks');
        console.log('   /api/tasks/stats     - Task statistics');
        console.log('   /api/invoices        - Get all invoices');
        console.log('   /api/invoices/stats  - Invoice statistics');
        console.log('\n⚡ Server is ready! Press Ctrl+C to stop.');
        console.log('='.repeat(60));
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Shutting down gracefully...');
        server.close(() => {
            if (mongoose.connection.readyState === 1) {
                mongoose.connection.close(false, () => {
                    console.log('✅ MongoDB connection closed');
                    console.log('🛑 Server stopped');
                    process.exit(0);
                });
            } else {
                console.log('🛑 Server stopped');
                process.exit(0);
            }
        });
    });
}

module.exports = { app, mongoose };