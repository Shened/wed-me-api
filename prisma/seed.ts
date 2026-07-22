import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const templates = [
    {
      name: 'Clássico',
      description: 'Design elegante e atemporal, com tipografia serif.',
      previewUrl: 'https://exemplo.com/previews/classico.png',
    },
    {
      name: 'Moderno',
      description: 'Layout minimalista, cores neutras, tipografia sans-serif.',
      previewUrl: 'https://exemplo.com/previews/moderno.png',
    },
    {
      name: 'Rústico',
      description: 'Inspirado em casamentos ao ar livre, tons terrosos.',
      previewUrl: 'https://exemplo.com/previews/rustico.png',
    },
  ];

  for (const template of templates) {
    await prisma.template.create({ data: template });
  }

  console.log(`Seed concluído: ${templates.length} templates criados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
