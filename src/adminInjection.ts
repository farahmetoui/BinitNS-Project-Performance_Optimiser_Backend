import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs';
import 'dotenv/config';

export async function createAdminUser() {
    const prisma = new PrismaClient();
    const passwordadmin = process.env.passwordAdmin;
  
    try {
      const existingAdmin = await prisma.user.findFirst({
        where: {
          role: 'admin',
        },
      });
  
      if (existingAdmin) {
        console.log('Admin already exists. Skipping creation.');
        return;
      }
  
      const hashedPassword = await bcrypt.hash(passwordadmin!, 10);
  
      await prisma.user.create({
        data: {
          firstName: process.env.firstnameadmin!,
          lastName: process.env.lastnameadmin!,
          phonenumber: Number(process.env.phonenumberadmin!),
          password: hashedPassword,
          userName: process.env.usernameadmin!,
          role: 'admin',
          email: process.env.emailadmin!,
        },
      });
  
      console.log('Admin user created successfully.');
    } catch (error) {
      console.error(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  