const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const User        = require('../models/User');
const LandRecord  = require('../models/LandRecord');
const Application = require('../models/Application');
const LandTax     = require('../models/LandTax');
const Document    = require('../models/Document');

// ── Dummy Users (20) ─────────────────────────────────────────
const usersData = [
  { fullName:'Israt Jahan Ema',    nid:'1234567890',          dateOfBirth:'1995-06-15', mobile:'01712345678', email:'israt@email.com',    role:'citizen', address:'House 12, Road 5, Savar, Dhaka' },
  { fullName:'Md. Rahim Hossain',  nid:'19876543210981234',   dateOfBirth:'1980-03-20', mobile:'01811111111', email:'rahim@email.com',    role:'citizen', address:'Village: Kaliganj, Gazipur' },
  { fullName:'Fatema Akter',       nid:'19987654321095678',   dateOfBirth:'1990-07-12', mobile:'01722222222', email:'fatema@email.com',   role:'citizen', address:'Mirpur-10, Dhaka-1216' },
  { fullName:'Abdul Karim',        nid:'19765432109879012',   dateOfBirth:'1975-11-05', mobile:'01933333333', email:'akarim@email.com',   role:'citizen', address:'Bashundhara R/A, Dhaka' },
  { fullName:'Sadia Islam',        nid:'20012345678913456',   dateOfBirth:'2001-02-28', mobile:'01644444444', email:'sadia@email.com',    role:'citizen', address:'Tangail Sadar, Tangail' },
  { fullName:'Hasan Mahmud',       nid:'19654321098767890',   dateOfBirth:'1970-09-18', mobile:'01755555555', email:'hasan@email.com',    role:'citizen', address:'Comilla Sadar, Comilla' },
  { fullName:'Nusrat Jahan',       nid:'19943210987654321',   dateOfBirth:'1994-04-22', mobile:'01666666666', email:'nusrat@email.com',   role:'officer', address:'Gulshan-2, Dhaka' },
  { fullName:'Kabir Uddin',        nid:'19832109876541122',   dateOfBirth:'1983-08-30', mobile:'01877777777', email:'kabir@email.com',    role:'citizen', address:'Narayanganj Sadar' },
  { fullName:'Roksana Begum',      nid:'19721098765433344',   dateOfBirth:'1972-12-10', mobile:'01788888888', email:'roksana@email.com',  role:'citizen', address:'Sylhet Sadar, Sylhet' },
  { fullName:'Tariqul Islam',      nid:'19881234567895566',   dateOfBirth:'1988-05-25', mobile:'01599999999', email:'tariq@email.com',    role:'citizen', address:'Rajshahi Sadar, Rajshahi' },
  { fullName:'Mostofa Kamal',      nid:'19779876543217788',   dateOfBirth:'1977-01-14', mobile:'01610101010', email:'mostofa@email.com',  role:'citizen', address:'Chattogram Sadar, Ctg' },
  { fullName:'Shirina Akter',      nid:'19929876543219900',   dateOfBirth:'1992-10-08', mobile:'01711121314', email:'shirina@email.com',  role:'citizen', address:'Khulna Sadar, Khulna' },
  { fullName:'Jahangir Alam',      nid:'19659876543211100',   dateOfBirth:'1965-07-19', mobile:'01812345670', email:'jahangir@email.com', role:'citizen', address:'Barisal Sadar, Barisal' },
  { fullName:'Parvin Sultana',     nid:'19849876543212200',   dateOfBirth:'1984-03-03', mobile:'01713141516', email:'parvin@email.com',   role:'citizen', address:'Mymensingh Sadar' },
  { fullName:'Rafiqul Islam',      nid:'19739876543213300',   dateOfBirth:'1973-06-27', mobile:'01614151617', email:'rafiq@email.com',    role:'citizen', address:'Rangpur Sadar, Rangpur' },
  { fullName:'Monira Khatun',      nid:'19979876543214400',   dateOfBirth:'1997-09-16', mobile:'01815161718', email:'monira@email.com',   role:'citizen', address:'Dinajpur Sadar, Dinajpur' },
  { fullName:'Salauddin Ahmed',    nid:'19589876543215500',   dateOfBirth:'1958-04-11', mobile:'01716171819', email:'salaudin@email.com', role:'citizen', address:"Cox's Bazar Sadar" },
  { fullName:'Taslima Nasrin',     nid:'19869876543216600',   dateOfBirth:'1986-11-23', mobile:'01617181920', email:'taslima@email.com',  role:'citizen', address:'Jessore Sadar, Jessore' },
  { fullName:'Nurul Islam',        nid:'19619876543217700',   dateOfBirth:'1961-08-05', mobile:'01918192021', email:'nurul@email.com',    role:'citizen', address:'Bogra Sadar, Bogra' },
  { fullName:'Admin User',         nid:'19901234567890000',   dateOfBirth:'1990-01-01', mobile:'01700000000', email:'admin@nagorikbhumi.gov.bd', role:'admin', address:'Ministry of Land, Dhaka' },
];

// ── Dummy Land Records (20) ──────────────────────────────────
const landTypes   = ['Residential','Agricultural','Commercial','Industrial','Agricultural','Residential','Commercial','Agricultural','Residential','Agricultural','Commercial','Residential','Agricultural','Commercial','Residential','Agricultural','Industrial','Residential','Agricultural','Commercial'];
const statuses    = ['Verified','Verified','Pending','Verified','Rejected','Verified','Pending','Verified','Verified','Pending','Verified','Verified','Pending','Verified','Verified','Rejected','Pending','Verified','Verified','Pending'];
const divisions   = ['Dhaka','Dhaka','Dhaka','Chattogram','Sylhet','Rajshahi','Khulna','Dhaka','Dhaka','Mymensingh','Barisal','Rangpur','Dhaka','Dhaka','Chattogram','Sylhet','Rajshahi','Khulna','Dhaka','Dhaka'];
const districts   = ['Savar','Gazipur','Bashundhara','Comilla','Sylhet','Rajshahi','Khulna','Tangail','Narayanganj','Mymensingh','Barisal','Rangpur','Mirpur','Motijheel','Cox\'s Bazar','Habiganj','Bogra','Jessore','Manikganj','Narsingdi'];
const sizes       = [5.00,12.00,8.00,10.00,3.50,15.00,6.00,20.00,4.50,8.50,7.00,11.00,2.50,9.00,14.00,6.50,18.00,3.00,7.50,13.00];
const plotNums    = ['1234','5678','9012','3456','7890','4321','8765','2109','6543','0987','1357','2468','3579','4680','5791','6802','7913','8024','9135','0246'];
// Real Bangladesh land/agricultural photos from Wikimedia Commons (CC licensed)
const photoUrls = [
  'https://upload.wikimedia.org/wikipedia/commons/4/45/Agriculture_of_Bangladesh_11.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/24/Agriculture_of_Bangladesh_1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4f/Agriculture_of_Bangladesh_8.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/c/c9/Agriculture_in_Rural_Bangladesh.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5e/Our_Bangladesh.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b9/Plain_rice_field.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b2/Agriculture_field.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/bd/Rice_Field.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/af/Green_paddy.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6c/Green_into_the_green.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Agriculture_of_Bangladesh_2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/28/Agriculture_of_Bangladesh_3.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e7/Agriculture_of_Bangladesh_4.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e1/Agriculture_of_Bangladesh_5.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/11/Agriculture_of_Bangladesh_6.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/17/Agriculture_of_Bangladesh_7.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5a/Agriculture_of_Bangladesh_9.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/bd/Agriculture_of_Bangladesh_10.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/45/Agriculture_of_Bangladesh_11.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/24/Agriculture_of_Bangladesh_1.jpg',
];

// ─────────────────────────────────────────────────────────────
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      LandRecord.deleteMany({}),
      Application.deleteMany({}),
      LandTax.deleteMany({}),
      Document.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create Users ──────────────────────────────────────────
    const password = await bcrypt.hash('password123', 12);
    const users = await User.insertMany(
      usersData.map(u => ({
        ...u,
        password,
        isVerified: true,
        isActive: true,
        photoUrl: `https://i.pravatar.cc/150?u=${u.nid}`,
      }))
    );
    console.log(`👤 Created ${users.length} users`);

    // ── Create Land Records ───────────────────────────────────
    const landRecords = [];
    for (let i = 0; i < 20; i++) {
      const sqft = Math.round(sizes[i] * 720);
      const rec = await LandRecord.create({
        owner:       users[i % 19]._id,
        title:       `${landTypes[i]} Land – ${districts[i]}`,
        type:        landTypes[i],
        location: {
          division: divisions[i],
          district: districts[i],
          upazila:  `${districts[i]} Sadar`,
          address:  `Mouza: ${districts[i]}, Plot: ${plotNums[i]}`,
        },
        plotNumber:    plotNums[i],
        khatianNumber: `KH-${1000 + i}`,
        size: {
          value: sizes[i],
          unit:  'Katha',
          sqft,
        },
        status:  statuses[i],
        notes:   `Land record for ${landTypes[i].toLowerCase()} plot in ${districts[i]}.`,
        photoUrl: photoUrls[i],
      });
      landRecords.push(rec);
    }
    console.log(`🗺️  Created ${landRecords.length} land records`);

    // ── Create Documents ──────────────────────────────────────
    const docTypes  = ['Deed','Survey','Identity','Tax','Deed','Survey','Identity','Tax','Deed','Survey','Deed','Survey','Identity','Tax','Deed','Survey','Identity','Tax','Deed','Inheritance'];
    const docStatus = ['Verified','Verified','Verified','Verified','Pending','Verified','Verified','Pending','Verified','Verified','Verified','Pending','Verified','Verified','Verified','Pending','Verified','Verified','Verified','Pending'];
    const documents = [];
    for (let i = 0; i < 20; i++) {
      const doc = await Document.create({
        name:          `${docTypes[i]} Document – ${landRecords[i].recordId}`,
        type:          docTypes[i],
        format:        'PDF',
        fileUrl:       `https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf`,
        fileSize:      Math.floor(Math.random() * 3000000) + 500000,
        uploadedBy:    users[i % 19]._id,
        relatedRecord: landRecords[i]._id,
        status:        docStatus[i],
        ...(docStatus[i] === 'Verified' ? { verifiedBy: users[19]._id, verifiedAt: new Date() } : {}),
      });
      documents.push(doc);
    }
    console.log(`📄 Created ${documents.length} documents`);

    // ── Create Applications ───────────────────────────────────
    const appTypes = [
      'Land Mutation','Name Correction','Land Survey','Partition Deed','Ownership Transfer',
      'Land Tax Clearance','Land Mutation','Land Survey','Name Correction','Ownership Transfer',
      'Land Mutation','Partition Deed','Land Survey','Land Tax Clearance','Land Mutation',
      'Name Correction','Ownership Transfer','Land Survey','Partition Deed','Land Mutation',
    ];
    const appStatus = ['Approved','Pending','In Review','Rejected','Approved','Pending','Approved','In Review','Pending','Approved','Pending','In Review','Approved','Pending','Rejected','Approved','Pending','In Review','Approved','Pending'];
    const priorities = ['High','Normal','High','Normal','Low','Normal','High','Normal','Low','Normal','High','Normal','High','Low','Normal','High','Normal','Low','Normal','High'];

    for (let i = 0; i < 20; i++) {
      await Application.create({
        applicant:   users[i % 19]._id,
        landRecord:  landRecords[i]._id,
        type:        appTypes[i],
        description: `${appTypes[i]} application for plot ${plotNums[i]} in ${districts[i]}.`,
        documents:   [documents[i]._id],
        status:      appStatus[i],
        priority:    priorities[i],
        ...(appStatus[i] === 'Approved' || appStatus[i] === 'Rejected'
          ? { reviewedBy: users[19]._id, reviewedAt: new Date() }
          : {}),
        ...(appStatus[i] === 'Rejected' ? { rejectionReason: 'Documents incomplete or incorrect.' } : {}),
      });
    }
    console.log(`📋 Created 20 applications`);

    // ── Create Land Tax Records ───────────────────────────────
    const taxStatus = ['Paid','Unpaid','Overdue','Paid','Unpaid','Paid','Unpaid','Paid','Overdue','Unpaid','Paid','Unpaid','Paid','Overdue','Paid','Unpaid','Paid','Overdue','Unpaid','Paid'];
    const taxAmounts = [4500,3600,4400,3000,3800,5200,2800,4100,3500,4800,2600,5500,3200,4000,3700,4900,2900,5100,3300,4600];

    for (let i = 0; i < 20; i++) {
      const year = taxStatus[i] === 'Paid' || taxStatus[i] === 'Overdue' ? 2023 : 2024;
      await LandTax.create({
        landRecord:    landRecords[i]._id,
        owner:         users[i % 19]._id,
        year,
        amount:        taxAmounts[i],
        dueDate:       new Date(`${year}-12-31`),
        status:        taxStatus[i],
        ...(taxStatus[i] === 'Paid' ? {
          paidAt:        new Date(`${year}-11-${10 + i}`),
          paymentMethod: ['bKash','Nagad','Bank Transfer','Online'][i % 4],
          transactionId: `TXN${Date.now()}${i}`,
          receiptNumber: `RCP-${year}-${String(i + 1).padStart(3, '0')}`,
        } : {}),
      });
    }
    console.log(`💰 Created 20 land tax records`);

    console.log('\n✅ ═══════════════════════════════════════');
    console.log('   Seeding complete! Summary:');
    console.log('   • 20 Users (password: password123)');
    console.log('   • 20 Land Records');
    console.log('   • 20 Documents');
    console.log('   • 20 Applications');
    console.log('   • 20 Land Tax Records');
    console.log('═══════════════════════════════════════\n');
    console.log('🔑 Admin login:');
    console.log('   NID:      19901234567800');
    console.log('   Password: password123');
    console.log('\n🔑 Citizen login (Israt Jahan Ema):');
    console.log('   NID:      1234567890');
    console.log('   Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
