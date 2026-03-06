// test-connection.js - اختبار اتصال MongoDB Atlas
const mongoose = require('mongoose');

// رابط الاتصال الخاص بك
const MONGODB_URI = 'mongodb+srv://abdallahreda1969_db_user:ilSr4GuErWpwetmE@cluster0.1olgyvi.mongodb.net/projectmaster?retryWrites=true&w=majority';

console.log('🧪 Testing MongoDB Atlas Connection...');
console.log('='.repeat(50));
console.log('URI:', MONGODB_URI.replace(/:[^:@]*@/, ':****@'));

async function testConnection() {
    try {
        console.log('\n🔗 Attempting to connect...');
        
        // طريقة 1: الاتصال المباشر
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('✅ Connection successful!');
        console.log('\n📊 Connection Details:');
        console.log('   Database:', mongoose.connection.db?.databaseName);
        console.log('   Host:', mongoose.connection.host);
        console.log('   Port:', mongoose.connection.port || 'SRV');
        console.log('   Ready State:', mongoose.connection.readyState);
        
        // عرض قواعد البيانات
        console.log('\n📁 Listing databases...');
        const adminDb = mongoose.connection.db.admin();
        const databases = await adminDb.listDatabases();
        
        console.log('Available databases:');
        databases.databases.forEach(db => {
            console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });
        
        // إنشاء قاعدة بيانات إذا لم تكن موجودة
        console.log('\n📦 Creating projectmaster database if not exists...');
        const db = mongoose.connection.useDb('projectmaster');
        
        // إنشاء مجموعة تجريبية
        await db.collection('test_connection').insertOne({
            test: 'MongoDB Atlas Connection Test',
            timestamp: new Date(),
            status: 'success'
        });
        
        console.log('✅ Test document inserted successfully!');
        
        // قراءة الوثيقة
        const doc = await db.collection('test_connection').findOne({});
        console.log('\n📄 Retrieved document:', JSON.stringify(doc, null, 2));
        
        // تنظيف
        await db.collection('test_connection').deleteMany({});
        console.log('🧹 Test collection cleaned up');
        
        await mongoose.disconnect();
        console.log('\n🎉 All tests passed! MongoDB Atlas is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n🔧 Possible solutions:');
            console.log('1. Check your internet connection');
            console.log('2. Verify MongoDB Atlas cluster is running');
            console.log('3. Add your IP to Atlas whitelist:');
            console.log('   - Go to Atlas Dashboard');
            console.log('   - Click "Network Access"');
            console.log('   - Add "0.0.0.0/0" (temporarily for testing)');
            console.log('4. Verify username/password');
        } else if (error.name === 'MongoNetworkError') {
            console.log('\n🌐 Network error - check firewall or proxy settings');
        }
        
        process.exit(1);
    }
}

testConnection();