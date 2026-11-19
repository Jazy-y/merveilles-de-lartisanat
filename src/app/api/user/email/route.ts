import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format d\'e-mail invalide' }, { status: 400 });
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.id
        }
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Cette adresse e-mail est déjà utilisée' }, { status: 400 });
    }

    // Verify current password
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Le mot de passe est incorrect' }, { status: 400 });
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        email,
      },
    });

    return NextResponse.json({ message: 'Adresse e-mail mise à jour avec succès.' }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating email:', error);
    return NextResponse.json({ error: 'Impossible de mettre à jour l\'adresse e-mail.' }, { status: 500 });
  }
}
