import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOCUMENT_CATEGORIES = [
  {
    name: 'Công nghệ thông tin',
    description: 'Tài liệu về lập trình, phát triển phần mềm, mạng máy tính, cơ sở dữ liệu',
    slug: 'cong-nghe-thong-tin',
    icon: '💻',
    isActive: true,
  },
  {
    name: 'Kinh tế & Quản trị',
    description: 'Tài liệu về kinh tế học, quản trị kinh doanh, marketing, tài chính',
    slug: 'kinh-te-quan-tri',
    icon: '💼',
    isActive: true,
  },
  {
    name: 'Khoa học tự nhiên',
    description: 'Tài liệu về toán học, vật lý, hóa học, sinh học',
    slug: 'khoa-hoc-tu-nhien',
    icon: '🔬',
    isActive: true,
  },
  {
    name: 'Kỹ thuật & Công nghệ',
    description: 'Tài liệu về cơ khí, điện - điện tử, xây dựng, giao thông',
    slug: 'ky-thuat-cong-nghe',
    icon: '🔧',
    isActive: true,
  },
  {
    name: 'Ngoại ngữ',
    description: 'Tài liệu học tiếng Anh, IELTS, TOEIC, các ngôn ngữ khác',
    slug: 'ngoai-ngu',
    icon: '🌐',
    isActive: true,
  },
  {
    name: 'Luật',
    description: 'Tài liệu về pháp luật, tư pháp, hành chính',
    slug: 'luat',
    icon: '⚖️',
    isActive: true,
  },
  {
    name: 'Y - Dược',
    description: 'Tài liệu về y học, dược học, điều dưỡng',
    slug: 'y-duoc',
    icon: '🏥',
    isActive: true,
  },
  {
    name: 'Khoa học xã hội',
    description: 'Tài liệu về tâm lý học, xã hội học, lịch sử, triết học',
    slug: 'khoa-hoc-xa-hoi',
    icon: '📚',
    isActive: true,
  },
  {
    name: 'Nghệ thuật & Thiết kế',
    description: 'Tài liệu về mỹ thuật, thiết kế đồ họa, kiến trúc',
    slug: 'nghe-thuat-thiet-ke',
    icon: '🎨',
    isActive: true,
  },
  {
    name: 'Sư phạm & Giáo dục',
    description: 'Tài liệu về phương pháp giảng dạy, giáo dục học',
    slug: 'su-pham-giao-duc',
    icon: '🎓',
    isActive: true,
  },
  {
    name: 'Khác',
    description: 'Các tài liệu không thuộc danh mục cụ thể',
    slug: 'khac',
    icon: '📁',
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Seeding document categories...');

  for (const category of DOCUMENT_CATEGORIES) {
    const existing = await prisma.documentCategory.findFirst({
      where: { slug: category.slug },
    });

    if (existing) {
      console.log(`  ⏭️  Category "${category.name}" already exists, skipping...`);
      continue;
    }

    await prisma.documentCategory.create({
      data: category,
    });
    console.log(`  ✅ Created category: ${category.name}`);
  }

  console.log('✅ Document categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding document categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


