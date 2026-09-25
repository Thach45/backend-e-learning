import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const documentTags = [
  { name: 'Đề thi', slug: 'de-thi', color: '#EF4444', description: 'Đề thi các kỳ thi' },
  { name: 'Đề cương', slug: 'de-cuong', color: '#F97316', description: 'Đề cương ôn tập' },
  { name: 'Slide bài giảng', slug: 'slide-bai-giang', color: '#F59E0B', description: 'Slide bài giảng từ thầy cô' },
  { name: 'Tài liệu tham khảo', slug: 'tai-lieu-tham-khao', color: '#10B981', description: 'Tài liệu tham khảo bổ sung' },
  { name: 'Bài tập có lời giải', slug: 'bai-tap-co-loi-giai', color: '#06B6D4', description: 'Bài tập kèm lời giải chi tiết' },
  { name: 'Giáo trình', slug: 'giao-trinh', color: '#3B82F6', description: 'Giáo trình chính thức' },
  { name: 'Tóm tắt lý thuyết', slug: 'tom-tat-ly-thuyet', color: '#8B5CF6', description: 'Tóm tắt các kiến thức lý thuyết' },
  { name: 'Đề thi cuối kỳ', slug: 'de-thi-cuoi-ky', color: '#EC4899', description: 'Đề thi cuối kỳ' },
  { name: 'Đề thi giữa kỳ', slug: 'de-thi-giua-ky', color: '#D946EF', description: 'Đề thi giữa kỳ' },
  { name: 'Đồ án', slug: 'do-an', color: '#A855F7', description: 'Báo cáo đồ án, project' },
  { name: 'Luận văn', slug: 'luan-van', color: '#6366F1', description: 'Luận văn tốt nghiệp' },
  { name: 'Tiếng Anh', slug: 'tieng-anh', color: '#0EA5E9', description: 'Tài liệu tiếng Anh' },
  { name: 'Có đáp án', slug: 'co-dap-an', color: '#22C55E', description: 'Tài liệu kèm đáp án' },
  { name: 'Template', slug: 'template', color: '#84CC16', description: 'Mẫu template' },
  { name: 'Chứng chỉ', slug: 'chung-chi', color: '#EAB308', description: 'Tài liệu ôn thi chứng chỉ' },
];

async function main() {
  console.log('🏷️ Seeding document tags...');

  for (let i = 0; i < documentTags.length; i++) {
    const tag = documentTags[i];
    const existing = await prisma.documentTag.findUnique({
      where: { slug: tag.slug },
    });

    if (!existing) {
      await prisma.documentTag.create({
        data: {
          name: tag.name,
          slug: tag.slug,
          color: tag.color,
          description: tag.description,
          sortOrder: i,
          isActive: true,
        },
      });
      console.log(`  ✅ Created: ${tag.name}`);
    } else {
      console.log(`  ⏭️ Already exists: ${tag.name}`);
    }
  }

  console.log('✨ Document tags seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding document tags:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

