const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Fixing passenger email...\n');

  // Find passenger user
  const passenger = await prisma.user.findFirst({
    where: { role: 'PENUMPANG' }
  });

  if (passenger) {
    console.log('Found passenger:', passenger.email);
    console.log('ID:', passenger.id);

    // Check if new email already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'penumpang@example.com' }
    });

    if (existing) {
      console.log('\nEmail penumpang@example.com already exists!');
      console.log('Deleting old passenger and keeping the correct one...');
      await prisma.user.delete({ where: { id: passenger.id } });
      console.log('Old passenger deleted.');
    } else {
      // Update email
      await prisma.user.update({
        where: { id: passenger.id },
        data: { email: 'penumpang@example.com' }
      });
      console.log('\nUpdated email to: penumpang@example.com');
    }
  } else {
    console.log('No passenger user found, creating one...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 12);

    await prisma.user.create({
      data: {
        email: 'penumpang@example.com',
        password: hashedPassword,
        nama: 'Demo Penumpang',
        role: 'PENUMPANG',
        no_hp: '081234567895',
      }
    });
    console.log('Created passenger: penumpang@example.com');
  }

  console.log('\n✅ Done!');
  await prisma.$disconnect();
}

fix().catch(console.error);
