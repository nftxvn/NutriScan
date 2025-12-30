import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foodItems = [
  // Indonesian Local Foods
  {
    name: "Nasi Goreng",
    brand: "Homemade",
    servingSize: "1 porsi (200g)",
    calories: 350,
    protein: 12,
    carbs: 45,
    fats: 14,
    type: "local",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    isPublic: true,
  },
  {
    name: "Mie Goreng",
    brand: "Homemade",
    servingSize: "1 porsi (180g)",
    calories: 380,
    protein: 10,
    carbs: 52,
    fats: 15,
    type: "local",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
    isPublic: true,
  },
  {
    name: "Sate Ayam",
    brand: "Warung Sate",
    servingSize: "10 tusuk",
    calories: 450,
    protein: 35,
    carbs: 15,
    fats: 28,
    type: "local",
    image: "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=400",
    isPublic: true,
  },
  {
    name: "Rendang Daging",
    brand: "Padang",
    servingSize: "100g",
    calories: 468,
    protein: 30,
    carbs: 6,
    fats: 38,
    type: "local",
    image: "https://images.unsplash.com/photo-1562565651-7d4948f339eb?w=400",
    isPublic: true,
  },
  {
    name: "Gado-Gado",
    brand: "Homemade",
    servingSize: "1 porsi (250g)",
    calories: 320,
    protein: 14,
    carbs: 28,
    fats: 18,
    type: "local",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    isPublic: true,
  },
  {
    name: "Ayam Goreng",
    brand: "Homemade",
    servingSize: "1 potong (150g)",
    calories: 320,
    protein: 28,
    carbs: 8,
    fats: 20,
    type: "local",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400",
    isPublic: true,
  },
  {
    name: "Bakso Sapi",
    brand: "Warung Bakso",
    servingSize: "1 mangkok",
    calories: 280,
    protein: 18,
    carbs: 32,
    fats: 10,
    type: "local",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
    isPublic: true,
  },
  {
    name: "Soto Ayam",
    brand: "Homemade",
    servingSize: "1 mangkok (350ml)",
    calories: 250,
    protein: 20,
    carbs: 22,
    fats: 10,
    type: "local",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    isPublic: true,
  },
  {
    name: "Nasi Padang",
    brand: "Padang",
    servingSize: "1 porsi",
    calories: 550,
    protein: 25,
    carbs: 58,
    fats: 25,
    type: "local",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    isPublic: true,
  },
  {
    name: "Pecel Lele",
    brand: "Warung Lele",
    servingSize: "1 porsi",
    calories: 420,
    protein: 28,
    carbs: 35,
    fats: 22,
    type: "local",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400",
    isPublic: true,
  },
  {
    name: "Tempe Goreng",
    brand: "Homemade",
    servingSize: "5 potong (100g)",
    calories: 200,
    protein: 18,
    carbs: 12,
    fats: 10,
    type: "local",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
    isPublic: true,
  },
  {
    name: "Tahu Goreng",
    brand: "Homemade",
    servingSize: "5 potong (100g)",
    calories: 180,
    protein: 15,
    carbs: 8,
    fats: 12,
    type: "local",
    image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400",
    isPublic: true,
  },
  {
    name: "Nasi Putih",
    brand: "Homemade",
    servingSize: "1 porsi (150g)",
    calories: 195,
    protein: 4,
    carbs: 44,
    fats: 0.4,
    type: "local",
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400",
    isPublic: true,
  },
  {
    name: "Bubur Ayam",
    brand: "Warung Bubur",
    servingSize: "1 mangkok",
    calories: 280,
    protein: 15,
    carbs: 38,
    fats: 8,
    type: "local",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    isPublic: true,
  },
  {
    name: "Rawon",
    brand: "Homemade",
    servingSize: "1 mangkok",
    calories: 380,
    protein: 28,
    carbs: 25,
    fats: 20,
    type: "local",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    isPublic: true,
  },

  // Fast Food
  {
    name: "Big Mac",
    brand: "McDonald's",
    servingSize: "1 burger",
    calories: 540,
    protein: 25,
    carbs: 45,
    fats: 28,
    type: "fastfood",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    isPublic: true,
  },
  {
    name: "Whopper",
    brand: "Burger King",
    servingSize: "1 burger",
    calories: 657,
    protein: 28,
    carbs: 49,
    fats: 40,
    type: "fastfood",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
    isPublic: true,
  },
  {
    name: "Crispy Chicken",
    brand: "KFC",
    servingSize: "2 potong",
    calories: 490,
    protein: 38,
    carbs: 16,
    fats: 32,
    type: "fastfood",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
    isPublic: true,
  },
  {
    name: "McFlurry Oreo",
    brand: "McDonald's",
    servingSize: "1 cup",
    calories: 340,
    protein: 8,
    carbs: 52,
    fats: 12,
    type: "fastfood",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    isPublic: true,
  },
  {
    name: "French Fries Large",
    brand: "McDonald's",
    servingSize: "Large",
    calories: 490,
    protein: 7,
    carbs: 66,
    fats: 23,
    type: "fastfood",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
    isPublic: true,
  },
  {
    name: "Pizza Pepperoni",
    brand: "Pizza Hut",
    servingSize: "2 slices",
    calories: 520,
    protein: 22,
    carbs: 54,
    fats: 24,
    type: "fastfood",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    isPublic: true,
  },
  {
    name: "Chicken Teriyaki Sub",
    brand: "Subway",
    servingSize: "6 inch",
    calories: 370,
    protein: 26,
    carbs: 46,
    fats: 10,
    type: "fastfood",
    image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=400",
    isPublic: true,
  },

  // Snacks
  {
    name: "Chitato Original",
    brand: "Chitato",
    servingSize: "68g",
    calories: 380,
    protein: 4,
    carbs: 42,
    fats: 22,
    type: "snack",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2ebb7?w=400",
    isPublic: true,
  },
  {
    name: "Oreo Original",
    brand: "Oreo",
    servingSize: "6 keping (51g)",
    calories: 250,
    protein: 2,
    carbs: 36,
    fats: 11,
    type: "snack",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
    isPublic: true,
  },
  {
    name: "Indomie Goreng",
    brand: "Indomie",
    servingSize: "1 bungkus (85g)",
    calories: 380,
    protein: 8,
    carbs: 52,
    fats: 16,
    type: "snack",
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400",
    isPublic: true,
  },
  {
    name: "Pop Mie",
    brand: "Indofood",
    servingSize: "1 cup (75g)",
    calories: 310,
    protein: 6,
    carbs: 42,
    fats: 14,
    type: "snack",
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400",
    isPublic: true,
  },
  {
    name: "Tango Wafer Coklat",
    brand: "Tango",
    servingSize: "1 pack (42g)",
    calories: 210,
    protein: 2,
    carbs: 28,
    fats: 10,
    type: "snack",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
    isPublic: true,
  },
  {
    name: "Good Day Cappuccino",
    brand: "Good Day",
    servingSize: "1 sachet (25g)",
    calories: 100,
    protein: 2,
    carbs: 18,
    fats: 2,
    type: "snack",
    image: "https://images.unsplash.com/photo-1497515114583-f61414b98bac?w=400",
    isPublic: true,
  },

  // Healthy Foods
  {
    name: "Salad Sayur",
    brand: "Homemade",
    servingSize: "1 porsi (200g)",
    calories: 120,
    protein: 4,
    carbs: 18,
    fats: 5,
    type: "local",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    isPublic: true,
  },
  {
    name: "Oatmeal",
    brand: "Quaker",
    servingSize: "1 cup (40g)",
    calories: 150,
    protein: 5,
    carbs: 27,
    fats: 3,
    type: "local",
    image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400",
    isPublic: true,
  },
  {
    name: "Greek Yogurt",
    brand: "Heavenly Blush",
    servingSize: "1 cup (150g)",
    calories: 130,
    protein: 15,
    carbs: 8,
    fats: 4,
    type: "local",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    isPublic: true,
  },
  {
    name: "Telur Rebus",
    brand: "Homemade",
    servingSize: "2 butir",
    calories: 155,
    protein: 13,
    carbs: 1,
    fats: 11,
    type: "local",
    image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400",
    isPublic: true,
  },
  {
    name: "Pisang",
    brand: "Buah Segar",
    servingSize: "1 buah (120g)",
    calories: 105,
    protein: 1,
    carbs: 27,
    fats: 0.4,
    type: "local",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    isPublic: true,
  },
  {
    name: "Alpukat",
    brand: "Buah Segar",
    servingSize: "1 buah (150g)",
    calories: 240,
    protein: 3,
    carbs: 12,
    fats: 22,
    type: "local",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
    isPublic: true,
  },
  {
    name: "Dada Ayam Panggang",
    brand: "Homemade",
    servingSize: "100g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 4,
    type: "local",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
    isPublic: true,
  },
  {
    name: "Salmon Panggang",
    brand: "Homemade",
    servingSize: "100g",
    calories: 208,
    protein: 20,
    carbs: 0,
    fats: 13,
    type: "local",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    isPublic: true,
  },

  // Drinks
  {
    name: "Es Teh Manis",
    brand: "Homemade",
    servingSize: "1 gelas (300ml)",
    calories: 80,
    protein: 0,
    carbs: 20,
    fats: 0,
    type: "local",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    isPublic: true,
  },
  {
    name: "Kopi Susu",
    brand: "Kopi Kenangan",
    servingSize: "1 cup (350ml)",
    calories: 180,
    protein: 5,
    carbs: 28,
    fats: 6,
    type: "local",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
    isPublic: true,
  },
  {
    name: "Jus Jeruk",
    brand: "Homemade",
    servingSize: "1 gelas (250ml)",
    calories: 110,
    protein: 2,
    carbs: 26,
    fats: 0,
    type: "local",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    isPublic: true,
  },
  {
    name: "Susu Full Cream",
    brand: "Ultra Milk",
    servingSize: "1 gelas (250ml)",
    calories: 150,
    protein: 8,
    carbs: 12,
    fats: 8,
    type: "local",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    isPublic: true,
  },
  {
    name: "Air Kelapa",
    brand: "Buah Segar",
    servingSize: "1 gelas (240ml)",
    calories: 46,
    protein: 2,
    carbs: 9,
    fats: 0,
    type: "local",
    image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400",
    isPublic: true,
  },
];

async function main() {
  console.log('🌱 Seeding food catalog...');
  
  // Clear existing public foods (optional)
  await prisma.foodItem.deleteMany({
    where: { createdBy: null, isPublic: true }
  });
  
  // Insert all food items
  const createdFoods: any[] = [];
  for (const food of foodItems) {
    const created = await prisma.foodItem.create({
      data: food
    });
    createdFoods.push(created);
    console.log(`✅ Added: ${food.name}`);
  }
  
  console.log(`\n🎉 Successfully seeded ${foodItems.length} food items!`);
  
  // Seed food logs and analytics for existing users
  console.log('\n📊 Seeding food logs and analytics...');
  
  const users = await prisma.user.findMany({
    include: { profile: true }
  });
  
  if (users.length === 0) {
    console.log('⚠️ No users found. Skipping food logs and analytics.');
    return;
  }
  
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  
  for (const user of users) {
    console.log(`\n👤 Processing user: ${user.name}`);
    
    // Clear existing logs and metrics for this user
    await prisma.dailyLog.deleteMany({ where: { userId: user.id } });
    await prisma.dailyMetric.deleteMany({ where: { userId: user.id } });
    
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    // Create 90 days of food logs and metrics
    for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      
      // Random number of meals per day (2-4)
      const mealsToday = Math.floor(Math.random() * 3) + 2;
      
      for (let meal = 0; meal < mealsToday; meal++) {
        const randomFood = createdFoods[Math.floor(Math.random() * createdFoods.length)];
        const mealType = mealTypes[Math.min(meal, mealTypes.length - 1)];
        const quantity = Math.random() > 0.7 ? 1.5 : 1; // Sometimes eat 1.5 portions
        
        await prisma.dailyLog.create({
          data: {
            userId: user.id,
            foodId: randomFood.id,
            date: date,
            mealType: mealType,
            quantity: quantity,
          }
        });
      }
      
      // Create daily metric
      const baseWeight = user.profile?.weight || 70;
      const weightVariation = (Math.random() - 0.5) * 2; // -1 to +1 kg variation
      
      await prisma.dailyMetric.create({
        data: {
          userId: user.id,
          date: date,
          weightRecorded: baseWeight + weightVariation - (dayOffset * 0.02), // Slight weight loss trend
          waterIntake: 1.5 + Math.random() * 1.5, // 1.5 to 3 liters
          sleepMinutes: 360 + Math.floor(Math.random() * 180), // 6 to 9 hours
        }
      });
      
      if (dayOffset % 10 === 0) {
        console.log(`  📅 Day -${dayOffset}: ${mealsToday} meals logged`);
      }
    }
    
    console.log(`✅ Created 90 days of data for ${user.name}`);
  }
  
  console.log('\n🎉 Successfully seeded all food logs and analytics!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

